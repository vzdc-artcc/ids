'use server';

export const fetchSigWx = async () => {
    const res = await fetch("https://aviationweather.gov/api/data/sigmet?format=json", {
        next: {
            revalidate: 60 * 60, // 1 hour
        },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch SIGWX data');
    }

    return res.json();
}