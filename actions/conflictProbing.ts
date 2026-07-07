'use server';

import {ConflictProbingConfigResponse, ConflictProbingResponse} from "@/types/conflict-probing";

const {CONFLICT_PROBING_DATA_ENDPOINT} = process.env;
const {CONFLICT_PROBING_CONFIG_ENDPOINT} = process.env;

export const fetchConflictProbingData = async (): Promise<ConflictProbingResponse> => {
    const res = await fetch(CONFLICT_PROBING_DATA_ENDPOINT || '', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    }).catch(() => null);

    if (!res?.ok) {
        return Promise.reject('Failed to fetch conflict probing data');
    }

    return await res.json();
}

export const fetchConflictProbingConfig = async (): Promise<ConflictProbingConfigResponse> => {
    const res = await fetch(CONFLICT_PROBING_CONFIG_ENDPOINT || '', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    }).catch(() => null);

    if (!res?.ok) {
        return Promise.reject('Failed to fetch conflict probing config');
    }

    return await res.json();
}