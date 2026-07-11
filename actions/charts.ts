'use server';

import {AtcData, ChartsFetchResponse} from "@/types";

export const fetchCharts = async (id: string): Promise<ChartsFetchResponse> => {
    const response = await fetch(`https://api-v2.aviationapi.com/v2/charts?airport=${id.toUpperCase()}`, {
        next: {
            revalidate: 60 * 60, // 1 hour
        },
    }).catch(() => null);

    if (id.length === 4 && id.startsWith("K")) {
        id = id.toUpperCase().substring(1);
    }

    const atcRes = await fetch(`${process.env.CONFLICT_PROBING_ATC_DATA_ENDPOINT}?id=${encodeURIComponent(id)}`, {
        next: {
            revalidate: 60 * 60, // 1 hour
        },
    }).catch(() => null);

    let atcData: AtcData | undefined = undefined;

    if (atcRes?.ok) {
        atcData = await atcRes.json();
    }

    let data: ChartsFetchResponse | null;

    data = {
        atcData: atcData,
    };

    if (response?.ok) {
        const chartsData = await response.json();
        data = {...data, airport_data: chartsData?.airport_data, charts: chartsData?.charts };
    }

    return data;
}