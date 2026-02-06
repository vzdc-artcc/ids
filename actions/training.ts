'use server';

const TRAINING_WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

export const updateAtisManual = async (formData: FormData) => {
    const res = await fetch(`${TRAINING_WEBSOCKET_URL}/api/vatis/flow`, {
        method: 'POST',
        body: JSON.stringify({
            facility: formData.get('icao')?.toString().toUpperCase() || "",
            preset: formData.get('preset') || "",
            atisLetter: formData.get('code')?.toString().charAt(0).toUpperCase() || "A",
            atisType: formData.get('type') || "combined",
            airportConditions: formData.get('conditions')?.toString().toUpperCase() || "N/A",
            notams: formData.get('notams')?.toString().toUpperCase() || "N/A",
        }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return res.ok;
}