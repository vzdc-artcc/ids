'use server';
import {PreferredRoute} from "@/types";

const {CONFLICT_PROBING_PRD_ENDPOINT} = process.env;

export async function getRoutes(origin: string, dest?: string) {
    if (!origin) {
        return [];
    }

    const res = await fetch(`${CONFLICT_PROBING_PRD_ENDPOINT}?origin=${origin}&dest=${dest}`);
    if (!res.ok) return [];
    const data: PreferredRoute[] = await res.json();
    return data;

}