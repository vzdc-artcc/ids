'use server';

import {revalidatePath} from "next/cache";
import {log} from "@/actions/log";
import prisma from "@/lib/prisma";

export const fetchAllConsolidations = async () => {
    return prisma.radarConsolidation.findMany({
        include: {
            primarySector: {
                include: {
                    radar: true,
                },
            },
            secondarySectors: {
                include: {
                    radar: true,
                },
            },
            user: true,
        },
    });
}

export const createConsolidation = async (userId: string, primarySectorId: string, secondarySectorIds: string[], claimAll: boolean) => {

    // Fetch existing consolidations
    const existingConsolidations = await prisma.radarConsolidation.findMany({
        include: {
            primarySector: true,
            secondarySectors: true,
            user: true,
        },
    });

    if (existingConsolidations.map(consolidation => consolidation.userId).includes(userId)) {
        return {error: "User already has a consolidation.  You can only work one primary sector at a time.  Consider adding to you secondary sectors."};
    }

    // Check if the primary sector is already in a consolidation
    const isPrimaryInUse = existingConsolidations.some(consolidation => consolidation.primarySectorId === primarySectorId);
    if (isPrimaryInUse) {
        return {error: "Primary sector is already in a consolidation"};
    }

    // Check if any secondary sector is trying to override a primary sector
    const isSecondaryOverridingPrimary = existingConsolidations.some(consolidation =>
        secondarySectorIds.includes(consolidation.primarySectorId)
    );
    if (isSecondaryOverridingPrimary) {
        return {error: "A secondary sector is trying to override a primary sector"};
    }

    // Remove secondary sectors from other consolidations
    for (const consolidation of existingConsolidations) {
        const secondarySectorsToRemove = consolidation.secondarySectors.filter(sector => secondarySectorIds.includes(sector.id));
        if (secondarySectorsToRemove.length > 0) {
            await prisma.radarConsolidation.update({
                where: {id: consolidation.id},
                data: {
                    secondarySectors: {
                        disconnect: secondarySectorsToRemove.map(sector => ({id: sector.id})),
                    },
                },
            });
        }
    }

    let otherSectors: string[] = [];

    if (claimAll) {
        const allSectors = await prisma.radarSector.findMany({
            select: {
                id: true,
            },
            where: {
                radar: {
                    facility: {
                        hiddenFromPicker: false,
                    },
                },
            },
        });
        otherSectors = allSectors.map(sector => sector.id).filter(sectorId => {
            return !existingConsolidations.some(consolidation => consolidation.primarySectorId === sectorId || consolidation.secondarySectors.map(sector => sector.id).includes(sectorId));
        })
            .filter(sectorId => sectorId !== primarySectorId && !secondarySectorIds.includes(sectorId));
    }

    // Create the new consolidation
    const consolidation = await prisma.radarConsolidation.create({
        data: {
            primarySectorId,
            secondarySectors: {
                connect: [...otherSectors.map(id => ({id})), ...secondarySectorIds.map(id => ({id}))],
            },
            userId,
        },
        include: {
            primarySector: {
                include: {
                    radar: true,
                },
            },
            secondarySectors: {
                include: {
                    radar: true,
                },
            },
            user: true,
        },
    });

    await log("CREATE", "RADAR_CONSOLIDATION", `Created radar consolidation for ${consolidation.user.fullName} (${consolidation.user.cid}) with primary sector ${consolidation.primarySector.identifier} and secondary sectors ${consolidation.secondarySectors.map(sector => sector.identifier).join(", ")}`);

    revalidatePath('/', "layout");

    return {consolidation};
}

export const updateConsolidation = async (id: string, primarySectorId: string, secondarySectorIds: string[]) => {
    // Fetch existing consolidations excluding the current one
    const existingConsolidations = await prisma.radarConsolidation.findMany({
        where: {
            NOT: {
                id,
            },
        },
        include: {
            primarySector: true,
            secondarySectors: true,
        },
    });

    // Check if the primary sector is already in a consolidation
    const isPrimaryInUse = existingConsolidations.some(consolidation => consolidation.primarySectorId === primarySectorId);
    if (isPrimaryInUse) {
        return {error: "Primary sector is already in a consolidation"};
    }

    // Remove secondary sectors from other consolidations if they are being "stolen"
    for (const consolidation of existingConsolidations) {
        const secondarySectorsToRemove = consolidation.secondarySectors.filter(sector => secondarySectorIds.includes(sector.id));
        if (secondarySectorsToRemove.length > 0) {
            await prisma.radarConsolidation.update({
                where: {id: consolidation.id},
                data: {
                    secondarySectors: {
                        disconnect: secondarySectorsToRemove.map(sector => ({id: sector.id})),
                    },
                },
            });
        }
    }

    // Update the consolidation with the new primary and secondary sectors
    const consolidation = await prisma.radarConsolidation.update({
        where: {
            id,
        },
        data: {
            primarySectorId,
            secondarySectors: {
                set: secondarySectorIds.map(id => ({id})),
            },
        },
        include: {
            primarySector: {
                include: {
                    radar: true,
                },
            },
            secondarySectors: {
                include: {
                    radar: true,
                },
            },
            user: true,
        },
    });

    await log("UPDATE", "RADAR_CONSOLIDATION", `Updated radar consolidation with primary sector ${consolidation.primarySector.identifier} and secondary sectors ${consolidation.secondarySectors.map(sector => sector.identifier).join(", ")}`);

    revalidatePath('/', "layout");

    return {consolidation};
}

export const deleteConsolidation = async (id: string) => {
    const consolidation = await prisma.radarConsolidation.delete({
        where: {
            id,
        },
        include: {
            primarySector: {
                include: {
                    radar: true,
                },
            },
            secondarySectors: {
                include: {
                    radar: true,
                },
            },
            user: true,
        },
    });

    await log("DELETE", "RADAR_CONSOLIDATION", `Deleted radar consolidation with primary sector ${consolidation.primarySector.identifier} and secondary sectors ${consolidation.secondarySectors.map(sector => sector.identifier).join(", ")}`);

    revalidatePath('/', "layout");

    return {consolidation};
}