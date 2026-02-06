'use server';

const VATSIM_METAR_URL = "https://metar.vatsim.net/metar.php";

export const fetchMetar = async (icao: string) => {
    const res = await fetch(`${VATSIM_METAR_URL}?id=${icao}`, {
        cache: "no-store",
    });
    return await res.text();
}