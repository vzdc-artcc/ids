'use server';

import {
    Airport,
    AirportRunway,
    AirspaceDiagram,
    DefaultRadarConsolidation,
    Facility,
    FlowPreset,
    FlowPresetRunway,
    Radar,
    RadarSector
} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import {log} from "@/actions/log";
import JSZip from "jszip";
import {UTApi} from "uploadthing/server";

type RadarWithConnectedAirports = Radar & { connectedAirports: { id: string, }[], };
type RadarSectorWithBorderingSectors = RadarSector & { borderingSectors: { id: string, }[], };
type DefaultRadarConsolidationWithSecondarySectors = DefaultRadarConsolidation & {
    secondarySectors: { id: string, }[],
};

export type ConfigFile = {
    facilities: Facility[];
    airports: Airport[];
    radars: RadarWithConnectedAirports[];
    runways: AirportRunway[];
    radarSectors: RadarSectorWithBorderingSectors[];
    flowPresets: FlowPreset[];
    flowPresetRunways: FlowPresetRunway[];
    defaultRadarConsolidations: DefaultRadarConsolidationWithSecondarySectors[];
    airspaceDiagrams: AirspaceDiagram[];
}

const ut = new UTApi();

export const importConfigFile = async (zipFile: Uint8Array) => {

    const zip = new JSZip();

    await zip.loadAsync(zipFile);

    const config = JSON.parse(await zip.file("config.json")?.async("text") as string) as ConfigFile;

    await prisma.facility.deleteMany();
    await prisma.airport.deleteMany();
    await prisma.airportRunway.deleteMany();
    await prisma.radar.deleteMany();
    await prisma.radarSector.deleteMany();
    await prisma.flowPreset.deleteMany();
    await prisma.flowPresetRunway.deleteMany();
    await prisma.defaultRadarConsolidation.deleteMany();
    await prisma.airspaceDiagram.deleteMany();

    await prisma.facility.createMany({
        data: config.facilities,
    });

    await prisma.radar.createMany({
        data: config.radars.map(radar => ({
            ...radar,
            connectedAirports: undefined,
        })),
    });

    await prisma.radarSector.createMany({
        data: config.radarSectors.map(radarSector => ({
            ...radarSector,
            borderingSectors: undefined,
        })),
    });

    await prisma.airport.createMany({
        data: config.airports,
    });

    await prisma.airportRunway.createMany({
        data: config.runways,
    });

    await prisma.flowPreset.createMany({
        data: config.flowPresets,
    });

    await prisma.flowPresetRunway.createMany({
        data: config.flowPresetRunways,
    });

    await prisma.defaultRadarConsolidation.createMany({
        data: config.defaultRadarConsolidations.map(consolidation => ({
            ...consolidation,
            secondarySectors: undefined,
        })),
    });

    const airspaceImages = zip.folder("airspace-images");

    for (const diagram of config.airspaceDiagrams) {
        const image = await airspaceImages?.file(`${diagram.id}.png`)?.async("blob");

        if (!image) {
            continue;
        }

        await ut.deleteFiles([diagram.key]);

        const imageFile = new File([image], `${diagram.id}.png`, {type: "image/png"});

        const res = await ut.uploadFiles(imageFile);

        if (res.error) {
            console.log(res.error);
            throw new Error("Error uploading airspace diagram");
        }


        await prisma.airspaceDiagram.create({
            data: {
                ...diagram,
                key: res.data.key,
            },
        });
    }

    for (const radar of config.radars) {
        await prisma.radar.update({
            where: {
                id: radar.id,
            },
            data: {
                connectedAirports: {
                    connect: radar.connectedAirports,
                },
            },
        });
    }

    for (const consolidation of config.defaultRadarConsolidations) {
        await prisma.defaultRadarConsolidation.update({
            where: {
                id: consolidation.id,
            },
            data: {
                secondarySectors: {
                    connect: consolidation.secondarySectors,
                },
            },
        });
    }

    for (const radarSector of config.radarSectors) {
        await prisma.radarSector.update({
            where: {
                id: radarSector.id,
            },
            data: {
                borderingSectors: {
                    connect: radarSector.borderingSectors,
                },
            },
        });
    }

    await log("UPDATE", "IMPORT", "Config file imported successfully");
}