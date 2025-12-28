import type { Hono } from 'hono';
import type { Bindings } from './s3';
import {
	getObjectFromS3,
	buildS3KeyForM3u8,
	buildS3KeyForSegment,
	buildS3KeyForDetalhesSerie,
	buildS3KeyForDetalhesEpisodio,
	buildS3KeyForCapa,
	buildS3KeyForEpisode,
} from './s3';
import { tryCache } from './cache';

const CACHE_TTL = 1; // 7 dias 604800

export function registerRoutes(app: Hono<{ Bindings: Bindings }>) {
	// ========== M3U8 ==========
	app.get('/m3u8', async (c) => {
		return tryCache(c, CACHE_TTL, async () => {
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

				const text = new TextDecoder().decode(fullArray);
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
					'Cache-Control': `public, max-age=${CACHE_TTL}`,
				});
			} catch (e: any) {
				console.error('Erro ao buscar m3u8 do S3:', e);
				if (e.name === 'NoSuchKey') return c.text('Vídeo não encontrado', 404);
				return c.text(`Erro interno: ${e.message}`, 500);
			}
		});
	});

	// ========== SEGMENTO ==========
	app.get('/seg', async (c) => {
		return tryCache(c, CACHE_TTL, async () => {
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
						'Cache-Control': `public, max-age=${CACHE_TTL}`,
					},
				});
			} catch (e: any) {
				console.error('Erro ao buscar segmento do S3:', e);
				if (e.name === 'NoSuchKey') return c.text('Segmento não encontrado', 404);
				return c.text(`Erro interno: ${e.message}`, 500);
			}
		});
	});

	// ========== CATÁLOGO ==========
	app.get('/catalago', async (c) => {
		return tryCache(c, CACHE_TTL, async () => {
			try {
				const { body, contentType } = await getObjectFromS3(c.env, 'catalago.json');

				return new Response(body, {
					status: 200,
					headers: {
						'Content-Type': contentType,
						'Access-Control-Allow-Origin': '*',
						'Cache-Control': `public, max-age=${CACHE_TTL}`,
					},
				});
			} catch (e: any) {
				console.error('Erro ao buscar catalago do S3:', e);
				return c.text(`Erro interno: ${e.message}`, 500);
			}
		});
	});

	// ========== DETALHES SÉRIE ==========
	app.get('/detalhes/serie', async (c) => {
		return tryCache(c, CACHE_TTL, async () => {
			try {
				const slug = c.req.query('slug');
				if (!slug) return c.json({ error: "Missing 'slug'" }, 400);

				const { body, contentType } = await getObjectFromS3(c.env, buildS3KeyForDetalhesSerie(slug));

				return new Response(body, {
					status: 200,
					headers: {
						'Content-Type': contentType,
						'Access-Control-Allow-Origin': '*',
						'Cache-Control': `public, max-age=${CACHE_TTL}`,
					},
				});
			} catch (e: any) {
				console.error('Erro ao buscar detalhes da série do S3:', e);
				return c.text(`Erro interno: ${e.message}`, 500);
			}
		});
	});

	// ========== IMAGEM CAPA ==========
	app.get('/images/capa', async (c) => {
		return tryCache(c, CACHE_TTL, async () => {
			try {
				const slug = c.req.query('slug');
				if (!slug) return c.json({ error: "Missing 'slug'" }, 400);

				const { body, contentType } = await getObjectFromS3(c.env, buildS3KeyForCapa(slug));

				return new Response(body, {
					status: 200,
					headers: {
						'Content-Type': contentType || 'image/jpeg',
						'Access-Control-Allow-Origin': '*',
						'Cache-Control': `public, max-age=${CACHE_TTL}`,
					},
				});
			} catch (e: any) {
				console.error('Erro ao buscar imagem do S3:', e);
				return c.text(`Erro interno: ${e.message}`, 500);
			}
		});
	});

	// ========== IMAGEM EPISÓDIO ==========
	app.get('/images/episode', async (c) => {
		return tryCache(c, CACHE_TTL, async () => {
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
						'Cache-Control': `public, max-age=${CACHE_TTL}`,
					},
				});
			} catch (e: any) {
				console.error('Erro ao buscar imagem do S3:', e);
				return c.text(`Erro interno: ${e.message}`, 500);
			}
		});
	});

	// ========== SÉRIE (PAGINADA) ==========
	app.get('/serie', async (c) => {
		return tryCache(c, CACHE_TTL, async () => {
			try {
				const slug = c.req.query('slug');
				const page = c.req.query('page') || '1';
				const order = c.req.query('order') || 'asc';

				if (!slug) return c.json({ error: "Missing 'slug'" }, 400);

				const pageNumber = parseInt(page);
				const pageSize = 20;

				const { body: infoBody } = await getObjectFromS3(c.env, buildS3KeyForDetalhesSerie(slug));
				const infoText = await new Response(infoBody).text();
				const serieInfo = JSON.parse(infoText);

				let episodeIds = serieInfo.episodes || [];

				if (order === 'desc') {
					episodeIds = episodeIds.reverse();
				}

				const totalOfEpisodes = episodeIds.length;
				const totalOfPages = Math.ceil(totalOfEpisodes / pageSize);
				const hasNextPage = pageNumber < totalOfPages;

				const start = (pageNumber - 1) * pageSize;
				const end = start + pageSize;
				const paginatedIds = episodeIds.slice(start, end);

				const episodesPromises = paginatedIds.map(async (epId: string) => {
					const { body } = await getObjectFromS3(c.env, buildS3KeyForDetalhesEpisodio(slug, epId));
					const text = await new Response(body).text();
					const metadata = JSON.parse(text);

					return {
						...metadata,
						serie: {
							titulo: serieInfo.titulo,
							slug_serie: serieInfo.slug_serie,
							generate_id: serieInfo.generate_id,
						},
					};
				});

				const episodes = await Promise.all(episodesPromises);

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
					'Cache-Control': `public, max-age=${CACHE_TTL}`,
				});
			} catch (e: any) {
				console.error('Erro ao buscar série do S3:', e);
				return c.text(`Erro interno: ${e.message}`, 500);
			}
		});
	});

	// ========== DETALHES EPISÓDIO ==========
	app.get('/detalhes/episodio', async (c) => {
		const cache = 604800;

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

				async function getEpisodeMetadataFromS3(env: any, slug: string, epId: string): Promise<EpisodeMetadataFromS3> {
					const metadataKey = `series/${slug}/videos/${epId}/metadata.json`;
					const { body } = await getObjectFromS3(env, metadataKey);
					const text = await new Response(body).text();
					const metadata = JSON.parse(text);
					return metadata as EpisodeMetadataFromS3;
				}

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
				const detalhesEpResponse = {
					id_series_episodios: 1000 + currentIndex,
					id_serie: serieInfo.id ?? 0,
					n_episodio: epInfo.n_episodio,
					titulo_episodio: epInfo.titulo_episodio,
					sinopse_episodio: epInfo.sinopse_episodio,
					data_registro: epInfo.data_registro,
					generate_id: `${nome}-${epId}`,
					serie: {
						titulo: serieInfo.title,
						slug_serie: serieInfo.slug_serie ?? nome,
						generate_id: `${nome}`,
					},
					prevEp: prevEpInfo
						? {
								id_series_episodios: 1000 + (currentIndex - 1),
								n_episodio: prevEpInfo.n_episodio,
								titulo_episodio: prevEpInfo.titulo_episodio,
								generate_id: `${nome}-${parseInt(prevEpId!.replace(/\D/g, ''), 10)}`,
								serie: {
									titulo: serieInfo.title,
									slug_serie: serieInfo.slug_serie ?? nome,
								},
						  }
						: null,
					nextEp: nextEpInfo
						? {
								id_series_episodios: 1000 + (currentIndex + 1),
								n_episodio: nextEpInfo.n_episodio,
								titulo_episodio: nextEpInfo.titulo_episodio,
								generate_id: `${nome}-${parseInt(nextEpId!.replace(/\D/g, ''), 10)}`,
								serie: {
									titulo: serieInfo.title,
									slug_serie: serieInfo.slug_serie ?? nome,
								},
						  }
						: null,
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
}
