'use server';

import {AirportData, AtcData, ChartData, ChartsFetchResponse} from "@/types";

export const fetchCharts = async (id: string): Promise<ChartsFetchResponse> => {
    const response = await fetch(`https://api-v2.aviationapi.com/v2/charts?airport=${id.length === 3 ? 'K' + id.toUpperCase() : id.toUpperCase()}`, {
        next: {
            revalidate: 60 * 60, // 1 hour
        },
    });

    if (id.length === 4 && id.startsWith("K")) {
        id = id.toUpperCase().substring(1);
    }

    const atcRes = await fetch(`${process.env.CONFLICT_PROBING_ATC_DATA_ENDPOINT}?id=${encodeURIComponent(id)}`, {
        next: {
            revalidate: 60 * 60, // 1 hour
        },
    });

    if (!atcRes.ok) {
        return null;
    }

    const atcData = await atcRes.json();

    let data: {
        airport_data?: AirportData,
        atcData?: AtcData,
        charts?: Record<string, ChartData[]>,
    } | null = null;

    if (atcData) {
        data = {
            atcData,
        };
    }

    if (response.ok) {
        data = {...data, ...await response.json()};
    }

    return data;
}