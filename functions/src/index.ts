import * as functions from 'firebase-functions';
import * as newCors from 'cors';
import {shorten, stats, visit} from './zws';

const cors = newCors({origin: true});

interface ErrorResponse {
	error: string;
}

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const getURL = functions.https.onRequest(async (request, response: functions.Response<ErrorResponse>) => {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	cors(request, response, () => {});

	// Remove any trailing slashes
	const short = request.params['0'].replace(/\//g, '');

	let url: string | null = null;
	try {
		url = await visit(short);
	} catch {
		response.status(500).json({error: 'An unknown error occurred'});
		return;
	}

	if (url === null) {
		response.status(404).end();
		return;
	}

	response.redirect(301, url);
});

export const getURLStats = functions.https.onRequest(
	async (request, response: functions.Response<ErrorResponse | {get: number; shorten: number; usage: {get: number[]; shorten: number[]}}>) => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		cors(request, response, () => {});

		const short = request.params['0'].split('/')[0] || request.query.short;
		const {url} = request.query;

		if (url) {
			response.status(400).json({error: 'Retrieving stats by long URL is not supported'}).end();
			return;
		}

		if (!short) {
			response.status(400).json({error: 'You must specify a short ID'}).end();
			return;
		}

		if (typeof short !== 'string') {
			response.status(400).json({error: 'Short ID must be string type'}).end();
			return;
		}

		const urlStats = await stats(short);

		if (urlStats === null) {
			response.status(404).end();
			return;
		}

		response
			.status(200)
			.json({shorten: 1, get: urlStats.visits.length, usage: {get: urlStats.visits.map(visit => Number(visit)), shorten: []}})
			.end();
	}
);

export const shortenURL = functions.https.onRequest(async (request, response: functions.Response<ErrorResponse | {short: string}>) => {
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	cors(request, response, () => {});

	const {url} = request.query;

	if (url === undefined) {
		response.status(422).json({error: 'You must specify a URL'}).end();
		return;
	}

	if (typeof url !== 'string') {
		response.status(400).json({error: 'URL must be string type'}).end();
		return;
	}

	// TODO: In 1% of requests change this to a subpath with an image informing API consumers to update to v2 (ex. zws.im/upgrade.png)
	const short = await shorten(url);

	response.status(201).json({short}).end();
});
