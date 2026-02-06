'use server';

import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {z} from "zod";
import {log} from "@/actions/log";
import {OrderItem} from "@/components/Admin/Order/OrderList";
import {revalidatePath} from "next/cache";
import prisma from "@/lib/prisma";
import {Prisma} from "@/generated/prisma/client";

export const fetchAllRadars = async () => {
    return prisma.radar.findMany({
        orderBy: {
            identifier: 'asc',
        },
    });
}

export const updateNotams = async (radarId: string, notams: string[]) => {
    const radar = await prisma.radar.update({
        where: {
            id: radarId,
        },
        data: {
            notams,
        },
    });

    await log("UPDATE", "FRONTEND_RDR_SET", `NOTAMs updated for ${radar.facilityId}`);

    return radar;
}

export const fetchRadars = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.RadarOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.RadarOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.radar.count({
            where: getWhere(filter),
        }),
        prisma.radar.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                sectors: {
                    orderBy: {
                        identifier: 'asc',
                    }
                },
                connectedAirports: {
                    orderBy: {
                        icao: 'asc',
                    }
                },
                facility: true,
            },
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.RadarWhereInput => {
    if (!filter) {
        return {};
    }
    switch (filter?.field) {
        case 'identifier':
            return {
                identifier: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'name':
            return {
                name: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'atcPrefixes':
            return {
                atcPrefixes: {
                    has: filter.value as string,
                },
            };
        case 'isEnrouteFacility':
            return {
                isEnrouteFacility: filter.value === 'true',
            };
        case 'connectedAirports':
            return {
                connectedAirports: {
                    some: {
                        icao: {
                            [filter.operator]: filter.value as string,
                            mode: 'insensitive',
                        },
                    },
                },
            };
        case 'sectors':
            return {
                sectors: {
                    some: {
                        identifier: {
                            [filter.operator]: filter.value as string,
                            mode: 'insensitive',
                        },
                    },
                },
            };
        default:
            return {};
    }
}

export const createOrUpdateRadar = async (formData: FormData) => {
    const radarZ = z.object({
        id: z.string().optional(),
        isHidden: z.boolean().optional(),
        identifier: z.string().min(1, "Identifier must not be empty"),
        name: z.string().min(1, "Name must not be empty"),
        sopLink: z.string().url("SOP Link must be a valid URL"),
        isEnrouteFacility: z.boolean(),
        atcPrefixes: z.array(z.string()).min(1, "At least one ATC prefix must be provided"),
    });

    const result = radarZ.safeParse({
        id: formData.get("id") as string,
        isHidden: formData.get("isHidden") === "on",
        identifier: formData.get("identifier") as string,
        name: formData.get("name") as string,
        sopLink: formData.get("sopLink") as string,
        isEnrouteFacility: formData.get("isEnrouteFacility") === 'on',
        atcPrefixes: JSON.parse(formData.get("atcPrefixes") as string),
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    await prisma.facility.updateMany({
        data: {
            id: result.data.identifier,
        },
        where: {
            radar: {
                id: result.data.id,
            },
        },
    });

    const radar = await prisma.radar.upsert({
        create: {
            identifier: result.data.identifier,
            name: result.data.name,
            sopLink: result.data.sopLink,
            isEnrouteFacility: result.data.isEnrouteFacility,
            atcPrefixes: result.data.atcPrefixes,
            facility: {
                create: {
                    id: result.data.identifier,
                    hiddenFromPicker: result.data.isHidden,
                }
            },
        },
        update: {
            identifier: result.data.identifier,
            name: result.data.name,
            sopLink: result.data.sopLink,
            isEnrouteFacility: result.data.isEnrouteFacility,
            facility: {
                update: {
                    hiddenFromPicker: result.data.isHidden,
                    id: result.data.identifier,
                },
            },
            atcPrefixes: {
                set: result.data.atcPrefixes,
            },
        },
        where: {
            id: result.data.id || '',
        },
    });

    if (result.data.id) {
        await log("UPDATE", "RADAR", `Updated radar ${radar.facilityId}`);
    } else {
        await log("CREATE", "RADAR", `Created radar ${radar.facilityId}`);
    }

    revalidatePath(`/admin/radars/${radar.id}`);

    return {radar};
}

export const updateRadarOrder = async (items: OrderItem[]) => {

    for (const item of items) {
        await prisma.radar.update({
            where: {id: item.id},
            data: {
                facility: {
                    update: {
                        order: item.order,
                    },
                },
            },
        });
    }

    await log("UPDATE", "RADAR", `Updated radar order`);

}