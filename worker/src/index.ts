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
	return `series/${nome}/videos/ep-${epNorm}/master.m3u8`;
}

function buildS3KeyForSegment(nome: string, ep: string, file: string): string {
	const epNorm = Number(ep).toString().padStart(2, '0');
	// seasons/{nome}/videos/ep-{ep}/{file}
	return `series/${nome}/videos/ep-${epNorm}/${file}`;
}
function buildS3KeyForDetalhesSerie(nome: string): string {
	// seasons/{nome}/videos/ep-{ep}/{file}
	return `series/${nome}/metadata.json`;
}
function buildS3KeyForDetalhesEpisodio(nome: string, ep: string): string {
	// seasons/{nome}/videos/ep-{ep}/{file}
	return `series/${nome}/videos/${ep}/metadata.json`;
}
function buildS3KeyForCapa(nome: string): string {
	// seasons/{nome}/videos/ep-{ep}/{file}
	return `series/${nome}/capa.jpg`;
}
function buildS3KeyForEpisode(nome: string, ep: string): string {
	// seasons/{nome}/videos/ep-{ep}/{file}
	return `series/${nome}/videos/ep-${ep}/Cover.jpg`;
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
	const cache = 1;
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

app.get('/catalago', async (c) => {
	const cache = 1;
	return tryCache(c, cache, async () => {
		try {
			const { body, contentType } = await getObjectFromS3(c.env, 'catalago.json');

			return new Response(body, {
				status: 200,
				headers: {
					'Content-Type': contentType,
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': `public, max-age=${cache}`,
				},
			});
		} catch (e: any) {
			console.error('Erro ao buscar catalago do S3:', e);

			return c.text(`Erro interno: ${e.message}`, 500);
		}
	});
});

app.get('/detalhes/serie', async (c) => {
	const cache = 1;
	return tryCache(c, cache, async () => {
		try {
			const slug = c.req.query('slug');
			if (!slug) return c.json({ error: "Missing 'slug'" }, 400);
			const { body, contentType } = await getObjectFromS3(c.env, buildS3KeyForDetalhesSerie(slug));

			return new Response(body, {
				status: 200,
				headers: {
					'Content-Type': contentType,
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': `public, max-age=${cache}`,
				},
			});
		} catch (e: any) {
			console.error('Erro ao buscar catalago do S3:', e);

			return c.text(`Erro interno: ${e.message}`, 500);
		}
	});
});
app.get('/images/capa', async (c) => {
	const cache = 1;
	return tryCache(c, cache, async () => {
		try {
			const slug = c.req.query('slug');
			if (!slug) return c.json({ error: "Missing 'slug'" }, 400);
			const { body, contentType } = await getObjectFromS3(c.env, buildS3KeyForCapa(slug));

			return new Response(body, {
				status: 200,
				headers: {
					'Content-Type': contentType || 'image/jpeg',
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': `public, max-age=${cache}`,
				},
			});
		} catch (e: any) {
			console.error('Erro ao buscar imagem do S3:', e);

			return c.text(`Erro interno: ${e.message}`, 500);
		}
	});
});
app.get('/images/episode', async (c) => {
	const cache = 1;
	return tryCache(c, cache, async () => {
		try {
			const slug = c.req.query('slug');
			const ep = c.req.query('ep');
			if (!slug || !ep) return c.json({ error: "Missing 'slug' or 'ep'" }, 400);
			const { body, contentType } = await getObjectFromS3(c.env, buildS3KeyForEpisode(slug, ep));

			return new Response(body, {
				status: 200,
				headers: {
					'Content-Type': contentType || 'image/jpeg',
					'Access-Control-Allow-Origin': '*',
					'Cache-Control': `public, max-age=${cache}`,
				},
			});
		} catch (e: any) {
			console.error('Erro ao buscar imagem do S3:', e);

			return c.text(`Erro interno: ${e.message}`, 500);
		}
	});
});
app.get('/serie', async (c) => {
	const cache = 60;

	return tryCache(c, cache, async () => {
		try {
			const slug = c.req.query('slug');
			const page = c.req.query('page') || '1';
			const order = c.req.query('order') || 'asc';

			if (!slug) {
				return c.json({ error: "Missing 'slug'" }, 400);
			}

			const pageNumber = parseInt(page);
			const pageSize = 20;

			// 1. Buscar info da série (lista de episódios)
			const { body: infoBody } = await getObjectFromS3(c.env, buildS3KeyForDetalhesSerie(slug));
			const infoText = await new Response(infoBody).text();
			const serieInfo = JSON.parse(infoText);

			let episodeIds = serieInfo.episodes || [];

			// 2. Ordenar IDs dos episódios
			if (order === 'desc') {
				episodeIds = episodeIds.reverse();
			}

			// 3. Calcular paginação
			const totalOfEpisodes = episodeIds.length;
			const totalOfPages = Math.ceil(totalOfEpisodes / pageSize);
			const hasNextPage = pageNumber < totalOfPages;

			const start = (pageNumber - 1) * pageSize;
			const end = start + pageSize;
			const paginatedIds = episodeIds.slice(start, end);

			// 4. Buscar metadata de cada episódio em paralelo
			const episodesPromises = paginatedIds.map(async (epId: string) => {
				const { body } = await getObjectFromS3(c.env, buildS3KeyForDetalhesEpisodio(slug, epId));
				const text = await new Response(body).text();
				const metadata = JSON.parse(text);

				// Enriquecer com dados da série
				return {
					...metadata,
					anime: {
						titulo: serieInfo.titulo,
						slug_serie: serieInfo.slug_serie,
						generate_id: serieInfo.generate_id,
					},
				};
			});

			const episodes = await Promise.all(episodesPromises);

			// 5. Montar resposta
			const response = {
				meta: {
					timestamp: Date.now(),
					totalOfEpisodes,
					totalOfPages,
					pageNumber,
					order,
					hasNextPage,
				},
				data: episodes,
			};

			return c.json(response, 200, {
				'Cache-Control': `public, max-age=${cache}`,
			});
		} catch (e: any) {
			console.error('Erro ao buscar série do S3:', e);
			if (e.$response) {
				console.error('Status:', e.$response.statusCode);
				console.error('Headers:', e.$response.headers);
				// CUIDADO: body pode ser stream grande; loga só se necessário
			}
			return c.text(`Erro interno: ${e.message}`, 500);
		}
	});
});
export interface DetalhesEpResponse {
	id_series_episodios: number;
	id_serie: number;
	n_episodio: string;
	titulo_episodio: string;
	sinopse_episodio: string;
	generate_id: string;
	data_registro: string;
	anime: {
		titulo: string;
		slug_serie: string;
		generate_id: string;
	};
	prevEp: {
		id_series_episodios: number;
		n_episodio: string;
		titulo_episodio: string;
		generate_id: string;
		anime: {
			titulo: string;
			slug_serie: string;
		};
	} | null;
	nextEp: {
		id_series_episodios?: number;
		n_episodio?: string;
		titulo_episodio?: string;
		generate_id?: string;
		anime?: {
			titulo: string;
			slug_serie: string;
		};
	};
}
interface SerieInfoFromS3 {
	id: number;
	generos: string[];
	title: string;
	slug_serie: string;
	ano: number;
	censura: number;
	sinopse: string;
	data_registro: string;
	episodes: string[]; // ex: ["ep-01", "ep-02", ...]
	// pode ter mais campos, mas só usei os que você mostrou
}

interface EpisodeMetadataFromS3 {
	n_episodio: string;
	titulo_episodio: string;
	sinopse_episodio: string;
	data_registro: string;
	slug_serie: string;
	// idem, pode ter mais
}
async function getEpisodeMetadataFromS3(env: any, slug: string, epId: string): Promise<EpisodeMetadataFromS3> {
	const metadataKey = `series/${slug}/videos/${epId}/metadata.json`;
	const { body } = await getObjectFromS3(env, metadataKey);
	const text = await new Response(body).text();
	const metadata = JSON.parse(text);
	return metadata as EpisodeMetadataFromS3;
}
app.get('/detalhes/episodio', async (c) => {
	const cache = 1;

	return tryCache(c, cache, async () => {
		try {
			const slug = c.req.query('slug'); // "Floresta_1"

			if (!slug) {
				return c.json({ error: "Missing 'slug'" }, 400);
			}

			const [nome, ep] = slug.split('-');

			if (!nome || !ep) {
				return c.json({ error: "Invalid slug format. Expected 'nome_ep'" }, 400);
			}

			const epId = `ep-${String(ep).padStart(2, '0')}`;

			// 1. Buscar info da série (lista de episódios)
			const infoKey = `series/${nome}/metadata.json`;
			const { body: infoBody } = await getObjectFromS3(c.env, infoKey);
			const infoText = await new Response(infoBody).text();
			const serieInfo = JSON.parse(infoText) as SerieInfoFromS3;

			const episodeIds: string[] = serieInfo.episodes || [];

			// 2. Descobrir índice do episódio atual dentro da lista de episodes
			const currentIndex = episodeIds.indexOf(epId);

			if (currentIndex === -1) {
				return c.json({ error: `Episódio '${epId}' não encontrado na série '${nome}'` }, 404);
			}

			const prevEpId = currentIndex > 0 ? episodeIds[currentIndex - 1] : null;
			const nextEpId = currentIndex < episodeIds.length - 1 ? episodeIds[currentIndex + 1] : null;

			// 3. Buscar metadata do episódio atual
			const epInfo = await getEpisodeMetadataFromS3(c.env, nome, epId);

			// 4. Buscar metadata do episódio anterior (se existir)
			const prevEpInfo = prevEpId ? await getEpisodeMetadataFromS3(c.env, nome, prevEpId) : null;

			// 5. Buscar metadata do próximo episódio (se existir)
			const nextEpInfo = nextEpId ? await getEpisodeMetadataFromS3(c.env, nome, nextEpId) : null;

			// 6. Montar objeto de resposta no formato DetalhesEpResponse

			// OBS: aqui vou mockar alguns campos que não existem nos JSONs,
			// deixando comentado pra você trocar depois.

			const detalhesEpResponse = {
				// MOCK: ID numérico do episódio atual (substituir depois por dado real)
				id_series_episodios: 1000 + currentIndex,

				// Da série
				id_serie: serieInfo.id ?? 0,

				// Do JSON de episódio atual
				n_episodio: epInfo.n_episodio,
				titulo_episodio: epInfo.titulo_episodio,
				sinopse_episodio: epInfo.sinopse_episodio,
				data_registro: epInfo.data_registro,

				// MOCK: generate_id do episódio (substituir por lógica real caso exista)
				generate_id: `${nome}-${epId}`,

				anime: {
					titulo: serieInfo.title,
					slug_serie: serieInfo.slug_serie ?? nome,

					// MOCK: generate_id da série
					generate_id: `${nome}`,
				},

				prevEp: prevEpInfo
					? {
							// MOCK: ID numérico do episódio anterior
							id_series_episodios: 1000 + (currentIndex - 1),

							n_episodio: prevEpInfo.n_episodio,
							titulo_episodio: prevEpInfo.titulo_episodio,

							// MOCK: generate_id do episódio anterior
							generate_id: `${nome}-${parseInt(prevEpId!.replace(/\D/g, ''), 10)}`,

							anime: {
								titulo: serieInfo.title,
								slug_serie: serieInfo.slug_serie ?? nome,
							},
					  }
					: null,

				nextEp: nextEpInfo
					? {
							// MOCK: ID numérico do próximo episódio
							id_series_episodios: 1000 + (currentIndex + 1),

							n_episodio: nextEpInfo.n_episodio,
							titulo_episodio: nextEpInfo.titulo_episodio,

							// MOCK: generate_id do próximo episódio
							generate_id: `${nome}-${parseInt(nextEpId!.replace(/\D/g, ''), 10)}`,

							anime: {
								titulo: serieInfo.title,
								slug_serie: serieInfo.slug_serie ?? nome,
							},
					  }
					: {
							// Se não houver próximo, devolvo objeto vazio
							// (você pode mudar depois pra {} ou outro padrão)
					  },
			};

			return c.json(detalhesEpResponse, 200, {
				'Cache-Control': `public, max-age=${cache}`,
			});
		} catch (e: any) {
			console.error('Erro ao buscar detalhes de episódio do S3:', e);
			if (e.$response) {
				console.error('Status:', e.$response.statusCode);
				console.error('Headers:', e.$response.headers);
			}
			return c.text(`Erro interno: ${e.message}`, 500);
		}
	});
});
export default app;
