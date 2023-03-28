const tfrs = require('../index');
const CACHE_TIME = 1000 * 60 * 10;

const corsHeaders = {
	"Access-Control-Allow-Origin": "*"
}

function getHeaders(otherHeaders = {}) {
	return {
		...corsHeaders,
		...otherHeaders
	}
}

function cacheKey(key) {
	return "cache_" + key;
}

async function fromCacheOrElse(cache_namespace, key, populate) {
	let cache_id = cacheKey(key);
	var data = cache_namespace.get(cache_id);
	if (data == null) {
		data = await populate();
		await cache_namespace.put(cache_id, data, { expiration: parseInt((CACHE_TIME + new Date().getTime()) / 1000) });
	}
	return data;
}

export default {
	async fetch(request, env, ctx) {
		const TFR_CACHE = env.TFR_CACHE;

		let url = new URL(request.url);
		let tfrID = url.pathname.replace('/', '');
		if (tfrID == "") {
			let tfrlist = await tfrs.list();
			return new Response(JSON.stringify(tfrlist, null, 4), {
				headers: getHeaders({
					"content-type": "application/json;charset=UTF-8"
				})
			});
		} else {
			return new Response(await fromCacheOrElse(TFR_CACHE, "tfr_" + tfrID, async () => {
				return JSON.stringify(await tfrs.fetch(tfrID), null, 4);
			}), {
				headers: getHeaders({
					"content-type": "application/json;charset=UTF-8"
				})
			});
		}
	},
};
