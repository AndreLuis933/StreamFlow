import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Definição dos tipos do ambiente (igual antes)
type Bindings = {
	// MY_KV: KVNamespace
};

const app = new Hono<{ Bindings: Bindings }>();

// 1. Middleware de CORS (Uma linha resolve tudo, igual ao FastAPI)
app.use('*', cors());

// Headers fixos
const FIXED_HEADERS = {
	'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
	Referer: 'https://www.api-vidios.net/',
};

let _buildIdCache: string | null = null;

// Função auxiliar (Lógica pura, não muda)
function buildM3u8Url(nome: string, ep: string | undefined, isMovie: boolean): string {
	if (isMovie || !ep) {
		return `https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/movies/${nome}/movie.mp4/media-1/stream.m3u8`;
	}
	const epNorm = ep.padStart(3, '0');
	return `https://cdn-zenitsu-2-gamabunta.b-cdn.net/cf/hls/animes/${nome}/${epNorm}.mp4/media-1/stream.m3u8`;
}

/**
 * Obtém o buildId (com cache em memória).
 * Tenta buscar na home page se não tiver em cache ou se forçado.
 */
async function getBuildId(forceRefresh: boolean = false): Promise<string> {
	if (_buildIdCache && !forceRefresh) {
		return _buildIdCache;
	}

	const response = await fetch('https://www.api-vidios.net/', { headers: FIXED_HEADERS });
	const text = await response.text();

	// Regex equivalente ao Python: \/_next\/static\/([A-Za-z0-9_-]+)\/_buildManifest\.js
	const match = text.match(/\/_next\/static\/([A-Za-z0-9_-]+)\/_buildManifest\.js/);

	if (match && match[1]) {
		_buildIdCache = match[1];
		return _buildIdCache;
	}

	throw new Error('Não foi possível encontrar o buildId');
}

/**
 * Função auxiliar para fazer requisições com buildId e retry automático.
 * Equivalente ao fetch_with_build_id do Python.
 */
async function fetchWithBuildId(c: any, path: string, queryParam: string) {
	try {
		let buildId = await getBuildId();
		let url = `https://www.api-vidios.net/_next/data/${buildId}${path}?${queryParam}`;

		let response = await fetch(url, { headers: FIXED_HEADERS });

		// Se der 404, tenta atualizar o buildId e refaz a requisição
		if (response.status === 404) {
			buildId = await getBuildId(true); // forceRefresh = true
			url = `https://www.api-vidios.net/_next/data/${buildId}${path}?${queryParam}`;
			response = await fetch(url, { headers: FIXED_HEADERS });
		}

		// Retorna o corpo original (JSON) com o status correto
		return new Response(response.body, {
			status: response.status,
			headers: {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*', // Garante CORS
			},
		});
	} catch (e: any) {
		return c.json({ error: e.message }, 500);
	}
}

// --- Rota: /m3u8 ---
app.get('/m3u8', async (c) => {
	// c.req.query() substitui o Annotated[Query]
	const nome = c.req.query('nome');
	const ep = c.req.query('ep');
	const isMovie = c.req.query('is_movie') === 'true';

	if (!nome) {
		return c.text("Parâmetro 'nome' é obrigatório", 400);
	}
	if (!isMovie && !ep) {
		return c.text("Parâmetro 'ep' é obrigatório para animes", 400);
	}

	const srcUrl = buildM3u8Url(nome, ep, isMovie);

	try {
		const response = await fetch(srcUrl, { headers: FIXED_HEADERS });

		if (!response.ok) {
			return c.text(`Falha ao obter m3u8 (${response.status})`, 502);
		}

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
			// Note que usamos c.req.url para pegar a URL base atual se necessário,
			// mas aqui hardcoded '/seg' funciona bem.
			const proxied = `/seg?u=${encodeURIComponent(absUrl)}`;
			outLines.push(proxied);
		}

		// Retorna texto com headers customizados
		return c.text(outLines.join('\n'), 200, {
			'Content-Type': 'application/vnd.apple.mpegurl',
			'Cache-Control': 'public, max-age=300',
		});
	} catch (e: any) {
		return c.text(`Erro interno: ${e.message}`, 500);
	}
});

// --- Rota: /seg ---
app.get('/seg', async (c) => {
	const u = c.req.query('u');

	if (!u) {
		return c.text("Parâmetro 'u' é obrigatório", 400);
	}

	const targetUrl = decodeURIComponent(u);

	try {
		const response = await fetch(targetUrl, { headers: FIXED_HEADERS });

		if (!response.ok) {
			return c.text(`Falha ao obter segmento (${response.status})`, 502);
		}

		// Para streaming de vídeo, retornamos um objeto Response nativo
		// passando o body original. O Hono entende isso perfeitamente.
		return new Response(response.body, {
			status: response.status,
			headers: {
				'Access-Control-Allow-Origin': '*', // Reforçando CORS no Response nativo
				'Content-Type': 'video/MP2T',
				'Cache-Control': 'public, max-age=300',
			},
		});
	} catch (e: any) {
		return c.text(`Timeout ou Erro: ${e.message}`, 504);
	}
});

// --- Rota: /data (Search) ---
app.get('/data', async (c) => {
	const q = c.req.query('q');
	if (!q) return c.json({ error: "Missing 'q'" }, 400);

	const response = await fetch(`https://api-search.api-vidios.net/data?q=${q}`, {
		headers: FIXED_HEADERS,
	});

	// Repassa o JSON diretamente
	return c.json(await response.json());
});

// --- Rota: /animes ---
app.get('/animes', async (c) => {
	const slug = c.req.query('slug');
	const page = c.req.query('page');

	if (!slug || !page) return c.json({ error: "Missing 'slug' or 'page'" }, 400);

	const response = await fetch(`https://apiv3-prd.api-vidios.net/animes/${slug}/episodes?page=${page}&order=desc`, { headers: FIXED_HEADERS });

	// Retorna com cache control, igual ao Python
	const data = await response.json();
	return c.json(data, 200, {
		'Cache-Control': 'public, max-age=300',
	});
});

// --- Rota: /detalhes/anime ---
app.get('/detalhes/anime', async (c) => {
	const slug = c.req.query('slug');
	if (!slug) return c.json({ error: "Missing 'slug'" }, 400);

	return await fetchWithBuildId(c, `/a/${slug}.json`, `anime=${slug}`);
});

// --- Rota: /detalhes/episodio ---
app.get('/detalhes/episodio', async (c) => {
	const slug = c.req.query('slug');
	if (!slug) return c.json({ error: "Missing 'slug'" }, 400);

	return await fetchWithBuildId(c, `/e/${slug}.json`, `episode=${slug}`);
});

// --- Rota: /detalhes/movie ---
app.get('/detalhes/movie', async (c) => {
	const slug = c.req.query('slug');
	if (!slug) return c.json({ error: "Missing 'slug'" }, 400);

	return await fetchWithBuildId(c, `/f/${slug}.json`, `movie=${slug}`);
});

export default app;
