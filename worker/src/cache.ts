export async function tryCache(c: any, ttlSeconds: number, fetcher: () => Promise<Response>): Promise<Response> {
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
