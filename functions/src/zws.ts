import got, {HTTPError} from 'got';
import {apiUrl} from './config';

export interface ShortenedUrl {
	short: string;
}

export interface LongUrl {
	url: string;
}

type YYYY = bigint;
type MM = bigint;
type DD = bigint;
type hh = bigint;
type mm = bigint;
type ss = bigint;
type ms = bigint;

type Iso8601 = `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}.${ms}Z`;

export interface Stats extends LongUrl {
	visits: Iso8601[];
}

const zws = got.extend({prefixUrl: apiUrl});

export async function shorten(url: string): Promise<string> {
	const response = await zws.post<ShortenedUrl>('', {responseType: 'json', json: {url}});

	return response.body.short;
}

export async function visit(short: string): Promise<null | string> {
	try {
		const response = await zws<LongUrl>(short, {responseType: 'json', searchParams: {visit: false}});

		return response.body.url;
	} catch (error: unknown) {
		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return null;
		}

		throw error;
	}
}

export async function stats(short: string): Promise<null | {url: string; visits: Date[]}> {
	try {
		const response = await zws<Stats>(`${short}/stats`, {responseType: 'json', searchParams: {visit: false}});

		return {url: response.body.url, visits: response.body.visits.map(visit => new Date(visit))};
	} catch (error: unknown) {
		if (error instanceof HTTPError && error.response.statusCode === 404) {
			return null;
		}

		throw error;
	}
}
