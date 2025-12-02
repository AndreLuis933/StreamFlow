import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

const FIXED_HEADERS = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
	Referer: 'https://www.api-vidios.net/',
};

let _buildIdCache: string | null = null;

function buildM3u8Url(nome: string, ep: string | undefined, isMovie: boolean): string {
	if (isMovie || !ep) {
		return `https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/movies/${nome}/movie.mp4/media-1/stream.m3u8`;
	}
	const epNorm = ep.padStart(3, '0');
	return `https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/${nome}/${epNorm}.mp4/media-1/stream.m3u8`;
}

async function getBuildId(forceRefresh: boolean = false): Promise<string> {
	if (_buildIdCache && !forceRefresh) return _buildIdCache;

	const response = await fetch('https://www.api-vidios.net/', { headers: FIXED_HEADERS });
	const text = await response.text();
	const match = text.match(/\/_next\/static\/([A-Za-z0-9_-]+)\/_buildManifest\.js/);

	if (match && match[1]) {
		_buildIdCache = match[1];
		return _buildIdCache;
	}
	throw new Error('Não foi possível encontrar o buildId');
}

async function tryCache(c: any, ttlSeconds: number, fetcher: () => Promise<Response>): Promise<Response> {
	const cache = caches.default;
	const url = new URL(c.req.url);

	const cachedResponse = await cache.match(url.toString());
	if (cachedResponse) return cachedResponse;

	const response = await fetcher();

	if (response.status === 200) {
		const responseToCache = response.clone();
		responseToCache.headers.set('Cache-Control', `public, max-age=${ttlSeconds}`);

		c.executionCtx.waitUntil(cache.put(url.toString(), responseToCache));
	}

	return response;
}

app.get('/m3u8', async (c) => {
	return tryCache(c, 86400, async () => {
		const nome = c.req.query('nome');
		const ep = c.req.query('ep');
		const isMovie = c.req.query('is_movie') === 'true';

		if (!nome) return c.text("Parâmetro 'nome' é obrigatório", 400);
		if (!isMovie && !ep) return c.text("Parâmetro 'ep' é obrigatório para animes", 400);

		const srcUrl = buildM3u8Url(nome, ep, isMovie);

		try {
			const response = await fetch(srcUrl, { headers: FIXED_HEADERS });
			if (!response.ok) return c.text(`Falha ao obter m3u8 (${response.status})`, 502);

			const text = await response.text();
			const lines = text.split('\n');
			const outLines: string[] = [];

			for (const line of lines) {
				const lineStripped = line.trim();
				if (!lineStripped || lineStripped.startsWith('#')) {
					outLines.push(line);
					continue;
				}
				const absUrl = new URL(lineStripped, srcUrl).toString();
				const proxied = `/seg?u=${encodeURIComponent(absUrl)}`;
				outLines.push(proxied);
			}

			return c.text(outLines.join('\n'), 200, {
				'Content-Type': 'application/vnd.apple.mpegurl',
				// Esse header serve para o navegador E para o nosso cache.put
				'Cache-Control': 'public, max-age=86400',
			});
		} catch (e: any) {
			return c.text(`Erro interno: ${e.message}`, 500);
		}
	});
});

app.get('/seg', async (c) => {
	return tryCache(c, 86400, async () => {
		const u = c.req.query('u');
		if (!u) return c.text('URL missing', 400);

		const targetUrl = decodeURIComponent(u);

		try {
			const controller = new AbortController();
			const id = setTimeout(() => controller.abort(), 15000);

			const response = await fetch(targetUrl, {
				headers: FIXED_HEADERS,
				signal: controller.signal,
			});
			clearTimeout(id);

			if (response.status === 404) {
				return c.text('Segment not found', 404);
			}

			if (!response.ok) {
				return c.text(`Upstream error: ${response.status}`, 502);
			}

			return new Response(response.body, {
				status: 200,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Content-Type': 'video/MP2T',
					'Cache-Control': 'public, max-age=86400',
				},
			});
		} catch (e: any) {
			return c.text(`Proxy Timeout: ${e.message}`, 504);
		}
	});
});

app.get('/data', async (c) => {
	return tryCache(c, 60, async () => {
		const q = c.req.query('q');
		if (!q) return c.json({ error: "Missing 'q'" }, 400);

		const response = await fetch(`https://api-search.api-vidios.net/data?q=${q}`, { headers: FIXED_HEADERS });
		const data = await response.json();

		// Precisamos recriar a Response para poder clonar no tryCache se necessário
		return c.json(data, 200, { 'Cache-Control': 'public, max-age=60' });
	});
});

app.get('/animes', async (c) => {
	return tryCache(c, 300, async () => {
		const slug = c.req.query('slug');
		const page = c.req.query('page');
		const order = c.req.query('order');
		if (!slug || !page || !order) return c.json({ error: "Missing 'slug' or 'page' or 'order'" }, 400);

		const response = await fetch(`https://apiv3-prd.api-vidios.net/animes/${slug}/episodes?page=${page}&order=${order}`, {
			headers: FIXED_HEADERS,
		});
		const data = await response.json();

		return c.json(data, 200, { 'Cache-Control': 'public, max-age=300' });
	});
});
async function fetchWithBuildId(c: any, path: string, queryParam: string) {
	try {
		let buildId = await getBuildId();
		let url = `https://www.api-vidios.net/_next/data/${buildId}${path}?${queryParam}`;
		let response = await fetch(url, { headers: FIXED_HEADERS });

		if (response.status === 404) {
			buildId = await getBuildId(true);
			url = `https://www.api-vidios.net/_next/data/${buildId}${path}?${queryParam}`;
			response = await fetch(url, { headers: FIXED_HEADERS });
		}

		return new Response(response.body, {
			status: response.status,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*',
				'Cache-Control': 'public, max-age=300',
			},
		});
	} catch (e: any) {
		return c.json({ error: e.message }, 500);
	}
}

app.get('/detalhes/anime', async (c) => {
	const slug = c.req.query('slug');
	if (!slug) return c.json({ error: "Missing 'slug'" }, 400);
	return await fetchWithBuildId(c, `/a/${slug}.json`, `anime=${slug}`);
});

app.get('/detalhes/episodio', async (c) => {
	const slug = c.req.query('slug');
	if (!slug) return c.json({ error: "Missing 'slug'" }, 400);
	return await fetchWithBuildId(c, `/e/${slug}.json`, `episode=${slug}`);
});

app.get('/detalhes/movie', async (c) => {
	const slug = c.req.query('slug');
	if (!slug) return c.json({ error: "Missing 'slug'" }, 400);
	return await fetchWithBuildId(c, `/f/${slug}.json`, `movie=${slug}`);
});

export default app;
