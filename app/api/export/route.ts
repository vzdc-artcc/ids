import prisma from "@/lib/db";
import {log} from "@/actions/log";
import JSZip from "jszip";

export async function GET() {

    const zip = new JSZip();

    const facilities = await prisma.facility.findMany();

    const airports = await prisma.airport.findMany();

    const radars = await prisma.radar.findMany({
        include: {
            connectedAirports: {
                select: {
                    id: true,
                },
            },
        },
    });

    const runways = await prisma.airportRunway.findMany();

    const radarSectors = await prisma.radarSector.findMany({
        include: {
            borderingSectors: {
                select: {
                    id: true,
                },
            },
        },
    });

    const flowPresets = await prisma.flowPreset.findMany();

    const flowPresetRunways = await prisma.flowPresetRunway.findMany();

    const defaultRadarConsolidations = await prisma.defaultRadarConsolidation.findMany({
        include: {
            secondarySectors: {
                select: {
                    id: true,
                },
            },
        },
    });

    const airspaceDiagrams = await prisma.airspaceDiagram.findMany();

    const airspaceImages = zip.folder("airspace-images");

    // Process images in smaller batches to avoid memory exhaustion
    const BATCH_SIZE = 5;
    for (let i = 0; i < airspaceDiagrams.length; i += BATCH_SIZE) {
        const batch = airspaceDiagrams.slice(i, i + BATCH_SIZE);

        // Process batch in parallel but limit concurrent requests
        await Promise.all(
            batch.map(async (diagram) => {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

                    const res = await fetch(`https://utfs.io/f/${diagram.key}`, {
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (!res.ok) {
                        console.error(`Failed to fetch diagram ${diagram.id}: ${res.statusText}`);
                        return;
                    }

                    const imageData = await res.arrayBuffer();
                    airspaceImages?.file(`${diagram.id}.png`, imageData);
                } catch (error) {
                    console.error(`Error fetching diagram ${diagram.id}:`, error);
                    // Continue processing other diagrams even if one fails
                }
            })
        );

        // Allow garbage collection between batches
        if (i + BATCH_SIZE < airspaceDiagrams.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    await log("CREATE", "EXPORT", "Config zip created successfully");

    const configData = {
        facilities,
        airports,
        radars,
        runways,
        radarSectors,
        flowPresets,
        flowPresetRunways,
        defaultRadarConsolidations,
        airspaceDiagrams,
    }

    zip.file("config.json", JSON.stringify(configData));
    zip.file("README.txt", "This is a zip file containing all the configuration data for the vZDC IDS." +
        "\nDO NOT MODIFY THIS FILE, FOLDER, OR ANY CONTENTS WITHIN UNLESS YOU KNOW WHAT YOUR DOING." +
        "\nTo import this configuration, go to the IDS admin panel and import this zip file." +
        "\n\nIDS developed by Aneesh Reddy & vZDC Web Team" +
        `\n\nGENERATED ${(new Date()).toUTCString()}`);

    const zipFolder = await zip.generateAsync({type: "uint8array"});

    return new Response(zipFolder, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": "attachment; filename=ids-config.zip",
        },
    });
}