'use server';
import {revalidatePath} from "next/cache";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {z} from "zod";
import {log} from "@/actions/log";
import {Prisma, Radar} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export const fetchAllRadarSectors = async () => {
    return prisma.radarSector.findMany({
        include: {
            radar: true,
        },
    });
}

export const fetchRadarSectors = async (radar: Radar, pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.RadarSectorOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.RadarSectorOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.radarSector.count({
            where: {
                radarId: radar.id,
                ...getWhere(filter),
            },
        }),
        prisma.radarSector.findMany({
            where: {
                radarId: radar.id,
                ...getWhere(filter),
            },
            orderBy,
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                borderingSectors: {
                    include: {
                        radar: true,
                    },
                },
            },
        }),
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.RadarSectorWhereInput => {
    if (!filter) {
        return {};
    }

    switch (filter.field) {
        case 'identifier':
            return {
                identifier: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'frequency':
            return {
                frequency: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'borderingSectors':
            return {
                OR: [
                    {
                        borderingSectors: {
                            some: {
                                identifier: {
                                    [filter.operator]: filter.value as string,
                                    mode: 'insensitive',
                                },
                            },
                        },
                    },
                    {
                        borderingSectors: {
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

export const createOrUpdateRadarSector = async (formData: FormData) => {
    const radarSectorZ = z.object({
        id: z.string().optional(),
        radarId: z.string(),
        identifier: z.string().min(1, "Identifier is required"),
        frequency: z.string().min(1, "Frequency is required"),
        borderingSectors: z.array(z.string()),
    });

    const result = radarSectorZ.safeParse({
        id: formData.get('id') as string,
        radarId: formData.get('radarId') as string,
        identifier: formData.get('identifier') as string,
        frequency: formData.get('frequency') as string,
        borderingSectors: JSON.parse(formData.get('borderingSectors') as string),
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const existingRadarSector = await prisma.radarSector.findUnique({
        where: {id: result.data.id},
        include: {borderingSectors: true},
    });

    const radarSector = await prisma.radarSector.upsert({
        create: {
            identifier: result.data.identifier,
            frequency: result.data.frequency,
            radarId: result.data.radarId,
            borderingSectors: {
                connect: result.data.borderingSectors.map((id) => ({id})),
            },
        },
        update: {
            identifier: result.data.identifier,
            frequency: result.data.frequency,
            borderingSectors: {
                set: result.data.borderingSectors.map((id) => ({id})),
            },
        },
        where: {
            id: result.data.id || '',
        },
        include: {
            radar: true,
        },
    });

    // Update bordering sectors in both directions
    await prisma.$transaction(
        result.data.borderingSectors.map((borderingSectorId) =>
            prisma.radarSector.update({
                where: {id: borderingSectorId},
                data: {
                    borderingSectors: {
                        connect: {id: radarSector.id},
                    },
                },
            })
        )
    );

    // Remove the sector from previously bordering sectors that are no longer bordering
    if (existingRadarSector) {
        const removedBorderingSectors = existingRadarSector.borderingSectors
            .filter(sector => !result.data.borderingSectors.includes(sector.id));

        await prisma.$transaction(
            removedBorderingSectors.map((borderingSector) =>
                prisma.radarSector.update({
                    where: {id: borderingSector.id},
                    data: {
                        borderingSectors: {
                            disconnect: {id: radarSector.id},
                        },
                    },
                })
            )
        );
    }

    if (result.data.id) {
        await log("UPDATE", "RADAR_SECTOR", `Updated ${radarSector.radar.facilityId} sector ${radarSector.identifier}`);
    } else {
        await log("CREATE", "RADAR_SECTOR", `Created ${radarSector.radar.facilityId} sector ${radarSector.identifier}`);
    }

    revalidatePath(`/admin/radars/${radarSector.radar.id}/sectors`);
    return {radarSector};
}

export const deleteRadarSector = async (id: string) => {
    const radarSector = await prisma.radarSector.delete({
        where: {
            id,
        },
        include: {
            radar: true,
        },
    });

    await log("DELETE", "RADAR_SECTOR", `Deleted ${radarSector.radar.facilityId} sector ${radarSector.identifier}`);

    revalidatePath(`/admin/radars/${radarSector.radar.id}/sectors`);
}