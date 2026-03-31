'use server';

import {readFile} from 'fs/promises';
import {join} from 'path';

export type CallsignData = {
    telephony: string;
    companyName: string;
    country: string;
    isVirtual: boolean;
    notes: string;
}

const CALLSIGNS: Record<string, CallsignData> = {};

export const fetchAllCallsigns = async (): Promise<Record<string, CallsignData>> => {
    // If we've already populated the object, return it (avoid re-fetching on the server runtime).
    if (Object.keys(CALLSIGNS).length > 0) return CALLSIGNS;

    try {
        const filePath = join(process.cwd(), 'callsigns', 'callsigns.csv');
        const csvData = await readFile(filePath, 'utf-8');

        const lines = csvData.split(/\r?\n/);

        for (const line of lines) {
            if (!line || !line.trim()) continue; // skip empty lines

            // Parse CSV respecting quoted fields
            const parts = parseCSVLine(line);
            const [code, telephony = '', companyName = '', country = '', isVirtual = 'false', notes = ''] = parts;

            if (!code) continue;

            const key = code.trim();
            // Skip header row if present (simple heuristic)
            if (key.toLowerCase() === 'code' && telephony.toLowerCase().includes('telephony')) continue;

            CALLSIGNS[key] = {
                telephony: telephony || '',
                companyName: companyName || '',
                country: country || '',
                isVirtual: String(isVirtual).toLowerCase() === 't',
                notes: notes || '',
            };
        }
    } catch (error) {
        throw new Error(`Failed to read callsign CSV file: ${error instanceof Error ? error.message : String(error)}`);
    }

    return CALLSIGNS;
}

export const getCallsign = async (code: string): Promise<CallsignData | undefined> => {
    await fetchAllCallsigns();
    return CALLSIGNS[code.toUpperCase()];
}

// Helper function to parse a CSV line respecting quoted fields
const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote: ""
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Comma outside quotes: field separator
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    // Add final field
    result.push(current.trim());

    return result;
}

