'use server';

const {SUA_ENDPOINT} = process.env;

export const fetchSuaRequests = async () => {

    if (!SUA_ENDPOINT) {
        throw new Error('SUA_ENDPOINT is not defined in environment variables');
    }

    const response = await fetch(SUA_ENDPOINT, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch SUA data');
    }

    return await response.json();
}