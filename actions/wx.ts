'use server';

import {USER_AGENT} from "@/lib/userAgent";

export const fetchSigWx = async () => {
    const res = await fetch("https://aviationweather.gov/api/data/sigmet?format=json", {
        headers: {
            'User-Agent': USER_AGENT,
        },
        next: {
            revalidate: 60 * 60, // 1 hour
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch SIGWX data');
    }

    return res.json();
}