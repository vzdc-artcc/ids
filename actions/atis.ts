'use server';

import {USER_AGENT} from "@/lib/userAgent";

const VATSIM_METAR_URL = "https://metar.vatsim.net/metar.php";

// METARs are issued roughly hourly (plus SPECIs) and metar.vatsim.net itself sends `max-age=600`,
// so a couple of minutes is plenty fresh. Every IDS client calls this action for every airport on
// screen whenever the VATSIM data feed ticks, so without a shared cache the server hammers the API.
const CACHE_TTL_MS = 2 * 60 * 1000;
// After a failure (e.g. 429), wait before trying the upstream again for that ICAO.
const ERROR_BACKOFF_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 10 * 1000;

type CacheEntry = { metar: string, expiresAt: number };

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<string>>();

// metar.vatsim.net does prefix matching ("K" returns every K*** METAR), so only allow complete ICAO codes.
const ICAO_REGEX = /^[A-Z0-9]{4}$/;

const fetchFromUpstream = async (icao: string): Promise<string> => {
    const previous = cache.get(icao);

    try {
        const res = await fetch(`${VATSIM_METAR_URL}?id=${icao}`, {
            cache: "no-store",
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'text/plain',
            },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!res.ok) {
            throw new Error(`metar.vatsim.net responded with ${res.status} for ${icao}`);
        }

        const metar = (await res.text()).trim();
        cache.set(icao, {metar, expiresAt: Date.now() + CACHE_TTL_MS});
        return metar;
    } catch (error) {
        console.error('Error fetching METAR:', error);
        // Serve the last known METAR (or nothing) and back off instead of retrying on every request.
        const metar = previous?.metar ?? '';
        cache.set(icao, {metar, expiresAt: Date.now() + ERROR_BACKOFF_MS});
        return metar;
    }
}

export const fetchMetar = async (icao: string): Promise<string> => {
    const id = icao.trim().toUpperCase();

    if (!ICAO_REGEX.test(id)) {
        return '';
    }

    const cached = cache.get(id);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.metar;
    }

    // Collapse concurrent requests for the same airport into a single upstream call.
    let pending = inFlight.get(id);
    if (!pending) {
        pending = fetchFromUpstream(id).finally(() => inFlight.delete(id));
        inFlight.set(id, pending);
    }

    return pending;
}
