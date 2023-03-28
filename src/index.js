const tfrs = require('../index');

const corsHeaders = {
	"Access-Control-Allow-Origin": "*"
}

function getHeaders(otherHeaders = {}) {
	return {
		...corsHeaders,
		...otherHeaders
	}
}

export default {
	async fetch(request, env, ctx) {
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
			return new Response(JSON.stringify(await tfrs.fetch(tfrID), null, 4), {
				headers: getHeaders({
					"content-type": "application/json;charset=UTF-8"
				})
			});
		}
	},
};
