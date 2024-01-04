import { DEV } from 'esm-env';
import client_url from './client.js?url';

let instance_id = -1;

/**
 * @param {import('./types.js').SvelteKitApp} app
 * @param {HTMLElement} target
 * @param {Parameters<import('./client.js')._hydrate>[0]} [hydrate]
 */
export async function start(app, target, hydrate) {
	if (DEV && target === document.body) {
		console.warn(
			'Placing %sveltekit.body% directly inside <body> is not recommended, as your app may break for users who have certain browser extensions installed.\n\nConsider wrapping it in an element:\n\n<div style="display: contents">\n  %sveltekit.body%\n</div>'
		);
	}

	// In embedded mode, the client is potentially loaded multiple times for different embeddings.
	// Since the client file is a singleton, we need to import it dynamically with a query string to ensure
	// it's treated as a separate module.
	// Note that this will not make SvelteKit instances completely isolated because things like beforeNavigate
	// are still shared, but it's good enough for now / backwards compatible.
	instance_id++;
	const { _hydrate, _start_router, create_client, goto } = await import(
		/* @vite-ignore */ `${client_url}?${instance_id}`
	);
	create_client(app, target);

	if (hydrate) {
		await _hydrate(hydrate);
	} else {
		goto(location.href, { replaceState: true });
	}

	_start_router();
}
