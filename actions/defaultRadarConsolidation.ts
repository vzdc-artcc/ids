'use server';

import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {z} from "zod";
import {revalidatePath} from "next/cache";
import {log} from "@/actions/log";
import prisma from "@/lib/prisma";
import {Prisma} from "@/generated/prisma/client";

export const fetchAllDefaultRadarConsolidations = async () => {
    return prisma.defaultRadarConsolidation.findMany({
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
        },
    });
}

export const fetchDefaultRadarConsolidations = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.DefaultRadarConsolidationOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.DefaultRadarConsolidationOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.defaultRadarConsolidation.count({
            where: {
                ...getWhere(filter),
            },
        }),
        prisma.defaultRadarConsolidation.findMany({
            where: {
                ...getWhere(filter),
            },
            orderBy,
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
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
            },
        }),
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.DefaultRadarConsolidationWhereInput => {
    if (!filter) {
        return {};
    }

    switch (filter.field) {
        case 'name':
            return {
                name: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'primarySector':
            return {
                OR: [
                    {
                        primarySector: {
                            identifier: {
                                [filter.operator]: filter.value as string,
                                mode: 'insensitive',
                            },
                        },
                    },
                    {
                        primarySector: {
                            radar: {
                                identifier: {
                                    [filter.operator]: filter.value as string,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                ],
            };
        case 'secondarySectors':
            return {
                OR: [
                    {
                        secondarySectors: {
                            some: {
                                identifier: {
                                    [filter.operator]: filter.value as string,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                    {
                        secondarySectors: {
                            some: {
                                radar: {
                                    identifier: {
                                        [filter.operator]: filter.value as string,
                                        mode: 'insensitive',
                                    },
                                },
                            },
                        },
                    },
                ],
            };
        default:
            return {};
    }
}

export const createOrUpdateDefaultRadarConsolidation = async (formData: FormData) => {
    const radarConsolidationZ = z.object({
        id: z.string().optional(),
        name: z.string(),
        primarySector: z.object({
            id: z.string(),
        }),
        secondarySectors: z.array(z.string()),
    });

    const result = radarConsolidationZ.safeParse({
        id: formData.get('id') as string,
        name: formData.get('name') as string,
        primarySector: {
            id: formData.get('primarySector') as string,
        },
        secondarySectors: JSON.parse(formData.get('secondarySectors') as string),
    });

    if (!result.success) {
        return {
            errors: result.error.issues,
        };
    }

    const {id, name, primarySector, secondarySectors} = result.data;

    if (secondarySectors.includes(primarySector.id)) {
        return {
            errors: [{message: 'Primary sector cannot be a secondary sector.  Consider leaving secondary sectors blank to represent a fully de-consolidated position.'}],
        };
    }

    const consolidation = await prisma.defaultRadarConsolidation.upsert({
        where: {
            id: id,
        },
        update: {
            name: name,
            primarySectorId: primarySector.id,
            secondarySectors: {
                set: secondarySectors.map((sectorId: string) => ({
                    id: sectorId,
                })),
            },
        },
        create: {
            name: name,
            primarySector: {
                connect: {
                    id: primarySector.id,
                },
            },
            secondarySectors: {
                connect: secondarySectors.map((sectorId: string) => ({
                    id: sectorId,
                })),
            },
        },
    });

    if (result.data.id) {
        await log("UPDATE", "DEFAULT_RADAR_CONSOLIDATION", `Updated default radar consolidation ${consolidation.name}`);
    } else {
        await log("CREATE", "DEFAULT_RADAR_CONSOLIDATION", `Created default radar consolidation ${consolidation.name}`);
    }

    revalidatePath('/admin/radar-consolidations');

    return {consolidation};
}

export const deleteDefaultRadarConsolidation = async (id: string) => {
    const drc = await prisma.defaultRadarConsolidation.delete({
        where: {
            id,
        },
    });

    await log("DELETE", "DEFAULT_RADAR_CONSOLIDATION", `Deleted default radar consolidation ${drc.name}`);

    revalidatePath('/admin/radar-consolidations');
}