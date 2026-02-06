'use server';

import prisma from "@/lib/prisma";
import {RadarSector} from "@/generated/prisma/client";

export type SectorStatus = {
    sector: RadarSector,
    consolidatedTo: RadarSector | null,
    open: boolean,
}

export const getAirportRelatedConsolidations = async (icao: string) => {

    const primaryRadar = await prisma.radar.findFirst({
        where: {
            airportsPrimary: {
                some: {
                    icao,
                },
            },
        },
        include: {
            sectors: {
                orderBy: {
                    identifier: 'asc',
                },
            },
        },
    });

    if (!primaryRadar) {
        return [];
    }

    const sectors = primaryRadar.sectors;

    const consolidations: SectorStatus[] = [];

    for (const sector of sectors) {

        const consolidationForSector = await prisma.radarConsolidation.findFirst({
            where: {
                OR: [
                    {
                        primarySectorId: sector.id,
                    },
                    {
                        secondarySectors: {
                            some: {
                                id: sector.id,
                            },
                        },
                    },
                ],
            },
            include: {
                primarySector: true,
            },
        });

        if (!consolidationForSector) {
            consolidations.push({
                sector,
                consolidatedTo: null,
                open: false,
            });
            continue;
        }

        if (consolidationForSector.primarySectorId === sector.id) {
            consolidations.push({
                sector,
                consolidatedTo: null,
                open: true,
            });
            continue;
        }

        consolidations.push({
            sector,
            consolidatedTo: consolidationForSector.primarySector,
            open: false,
        });
    }

    return consolidations;
}