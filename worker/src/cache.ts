const CACHE_VERSION = 'v2';

export async function tryCache(c: any, ttlSeconds: number, fetcher: () => Promise<Response>): Promise<Response> {
	const cache = caches.default;
	const url = new URL(c.req.url);

	url.searchParams.set('_cv', CACHE_VERSION);
	const cacheKey = url.toString();

	const cachedResponse = await cache.match(cacheKey);
	if (cachedResponse) return cachedResponse;

	const response = await fetcher();

	if (response.status === 200) {
		const responseToCache = response.clone();
		responseToCache.headers.set('Cache-Control', `public, max-age=${ttlSeconds}`);
		c.executionCtx.waitUntil(cache.put(cacheKey, responseToCache));
	}

	return response;
}
