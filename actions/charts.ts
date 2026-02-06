'use server';

export const fetchCharts = async (icao: string) => {
    const response = await fetch(`https://api-v2.aviationapi.com/v2/charts?airport=${icao.length === 3 ? 'K' + icao.toUpperCase() : icao.toUpperCase()}`, {
        next: {
            revalidate: 60 * 60, // 1 hour
        }
    });
    if (!response.ok) {
        return  [];
    }
    return response.json();
}