import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

type Bindings = {
	AWS_ACCESS_KEY_ID: string;
	AWS_SECRET_ACCESS_KEY: string;
	AWS_REGION: string;
	S3_BUCKET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

function createS3Client(env: Bindings): S3Client {
	return new S3Client({
		region: env.AWS_REGION,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
		},
	});
}

function buildS3KeyForM3u8(nome: string, ep: string): string {
	const epNorm = Number(ep).toString().padStart(2, '0');
	// seasons/{nome}/videos/ep-{ep}/master.m3u8
	return `seasons/${nome}/videos/ep-${epNorm}/master.m3u8`;
}

function buildS3KeyForSegment(nome: string, ep: string, file: string): string {
	const epNorm = Number(ep).toString().padStart(2, '0');
	// seasons/{nome}/videos/ep-{ep}/{file}
	return `seasons/${nome}/videos/ep-${epNorm}/${file}`;
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

async function getObjectFromS3(env: Bindings, key: string): Promise<{ body: ReadableStream; contentType: string }> {
	const s3 = createS3Client(env);

	const command = new GetObjectCommand({
		Bucket: env.S3_BUCKET,
		Key: key,
	});

	const response = await s3.send(command);

	return {
		body: response.Body as ReadableStream,
		contentType: response.ContentType || 'application/octet-stream',
	};
}

app.get('/m3u8', async (c) => {
	const cache = 1
	return tryCache(c, cache, async () => {
		const nome = c.req.query('nome');
		const ep = c.req.query('ep');

		if (!nome || !ep) {
			return c.text("Parâmetros 'nome' e 'ep' são obrigatórios", 400);
		}

		const key = buildS3KeyForM3u8(nome, ep);

		try {
			const { body } = await getObjectFromS3(c.env, key);

			const reader = body.getReader();
			const chunks: Uint8Array[] = [];
			let done = false;

			while (!done) {
				const { value, done: streamDone } = await reader.read();
				if (value) chunks.push(value);
				done = streamDone;
			}

			const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
			const fullArray = new Uint8Array(totalLength);
			let offset = 0;
			for (const chunk of chunks) {
				fullArray.set(chunk, offset);
				offset += chunk.length;
			}

			const textDecoder = new TextDecoder();
			const text = textDecoder.decode(fullArray);

			const lines = text.split('\n');
			const outLines: string[] = [];

			for (const line of lines) {
				const lineStripped = line.trim();

				if (!lineStripped || lineStripped.startsWith('#')) {
					outLines.push(line);
					continue;
				}

				if (lineStripped.endsWith('.ts')) {
					const proxied = `/seg?nome=${encodeURIComponent(nome)}&ep=${ep}&file=${encodeURIComponent(lineStripped)}`;
					outLines.push(proxied);
				} else {
					outLines.push(line);
				}
			}

			return c.text(outLines.join('\n'), 200, {
				'Content-Type': 'application/vnd.apple.mpegurl',
				'Cache-Control': `public, max-age=${cache}`,
			});
		} catch (e: any) {
			console.error('Erro ao buscar m3u8 do S3:', e);

			if (e.name === 'NoSuchKey') {
				return c.text('Vídeo não encontrado', 404);
			}

			return c.text(`Erro interno: ${e.message}`, 500);
		}
	});
});

app.get('/seg', async (c) => {
	const cache = 1;
	return tryCache(c, cache, async () => {
		const nome = c.req.query('nome');
		const ep = c.req.query('ep');
		const file = c.req.query('file');

		if (!nome || !ep || !file) {
			return c.text("Parâmetros 'nome', 'ep' e 'file' são obrigatórios", 400);
		}

		const key = buildS3KeyForSegment(nome, ep, file);

		try {
			const { body, contentType } = await getObjectFromS3(c.env, key);

			return new Response(body, {
				status: 200,
				headers: {
					'Content-Type': contentType || 'video/MP2T',
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': `public, max-age=${cache}`,
				},
			});
		} catch (e: any) {
			console.error('Erro ao buscar segmento do S3:', e);

			if (e.name === 'NoSuchKey') {
				return c.text('Segmento não encontrado', 404);
			}

			return c.text(`Erro interno: ${e.message}`, 500);
		}
	});
});

export default app;

// app.get('/data', async (c) => {
// 	return tryCache(c, 60, async () => {
// 		const q = c.req.query('q');
// 		if (!q) return c.json({ error: "Missing 'q'" }, 400);

// 		const response = await fetch(`https://api-search.api-vidios.net/data?q=${q}`, { headers: FIXED_HEADERS });
// 		const data = await response.json();

// 		// Precisamos recriar a Response para poder clonar no tryCache se necessário
// 		return c.json(data, 200, { 'Cache-Control': 'public, max-age=60' });
// 	});
// });

// app.get('/animes', async (c) => {
// 	return tryCache(c, 300, async () => {
// 		const slug = c.req.query('slug');
// 		const page = c.req.query('page');
// 		const order = c.req.query('order');
// 		if (!slug || !page || !order) return c.json({ error: "Missing 'slug' or 'page' or 'order'" }, 400);

// 		const response = await fetch(`https://apiv3-prd.api-vidios.net/animes/${slug}/episodes?page=${page}&order=${order}`, {
// 			headers: FIXED_HEADERS,
// 		});
// 		const data = await response.json();

// 		return c.json(data, 200, { 'Cache-Control': 'public, max-age=300' });
// 	});
// });
// async function fetchWithBuildId(c: any, path: string, queryParam: string) {
// 	try {
// 		let buildId = await getBuildId();
// 		let url = `https://www.api-vidios.net/_next/data/${buildId}${path}?${queryParam}`;
// 		let response = await fetch(url, { headers: FIXED_HEADERS });

// 		if (response.status === 404) {
// 			buildId = await getBuildId(true);
// 			url = `https://www.api-vidios.net/_next/data/${buildId}${path}?${queryParam}`;
// 			response = await fetch(url, { headers: FIXED_HEADERS });
// 		}

// 		return new Response(response.body, {
// 			status: response.status,
// 			headers: {
// 				'Content-Type': 'application/json',
// 				'Access-Control-Allow-Origin': '*',
// 				'Cache-Control': 'public, max-age=300',
// 			},
// 		});
// 	} catch (e: any) {
// 		return c.json({ error: e.message }, 500);
// 	}
// }

// app.get('/detalhes/anime', async (c) => {
// 	const slug = c.req.query('slug');
// 	if (!slug) return c.json({ error: "Missing 'slug'" }, 400);
// 	return await fetchWithBuildId(c, `/a/${slug}.json`, `anime=${slug}`);
// });

// app.get('/detalhes/episodio', async (c) => {
// 	const slug = c.req.query('slug');
// 	if (!slug) return c.json({ error: "Missing 'slug'" }, 400);
// 	return await fetchWithBuildId(c, `/e/${slug}.json`, `episode=${slug}`);
// });

// app.get('/detalhes/movie', async (c) => {
// 	const slug = c.req.query('slug');
// 	if (!slug) return c.json({ error: "Missing 'slug'" }, 400);
// 	return await fetchWithBuildId(c, `/f/${slug}.json`, `movie=${slug}`);
// });
