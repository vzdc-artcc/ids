'use server';

import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {revalidatePath} from "next/cache";
import {z} from "zod";
import {log} from "@/actions/log";
import {OrderItem} from "@/components/Admin/Order/OrderList";
import {Facility, Prisma} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";

export const fetchSingleTmu = async (facility: Facility) => {
    return prisma.tmuNotice.findMany({
        where: {
            broadcastedFacilities: {
                some: {
                    id: facility.id,
                },
            },
        },
        orderBy: {
            order: 'asc',
        },
    });
}

export const fetchTmu = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.TmuNoticeOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.TmuNoticeOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.tmuNotice.count({
            where: getWhere(filter),
        }),
        prisma.tmuNotice.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                broadcastedFacilities: {
                    orderBy: {
                        id: 'asc',
                    },
                },
            },
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.TmuNoticeWhereInput => {
    if (!filter) {
        return {};
    }
    switch (filter?.field) {
        case 'facilities':
            return {
                broadcastedFacilities: {
                    some: {
                        id: {
                            [filter.operator]: filter.value as string,
                            mode: 'insensitive',
                        },
                    },
                },
            };
        case 'message':
            return {
                message: {
                    contains: filter.value as string,
                    mode: 'insensitive',
                },
            };
        default:
            return {};
    }
};

export const createOrUpdateTmu = async (formData: FormData) => {
    const tmuZ = z.object({
        id: z.string().optional(),
        message: z.string().min(1, "Message is required"),
        facilities: z.array(z.string()).min(1, "At least one facility must be selected"),
    });

    const result = tmuZ.safeParse({
        id: formData.get('id') as string,
        message: formData.get('message') as string,
        facilities: JSON.parse(formData.get('facilities') as string),
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const tmu = await prisma.tmuNotice.upsert({
        create: {
            message: result.data.message,
            broadcastedFacilities: {
                connect: result.data.facilities.map((id: string) => ({id})),
            },
        },
        update: {
            message: result.data.message,
            broadcastedFacilities: {
                set: result.data.facilities.map((id: string) => ({id})),
            },
        },
        where: {
            id: result.data.id || '',
        },
        include: {
            broadcastedFacilities: true,
        },
    });

    if (result.data.id) {
        await log("UPDATE", "TMU_NOTICE", `Updated TMU Notice ${tmu.message}`);
    } else {
        await log("CREATE", "TMU_NOTICE", `Created TMU Notice ${tmu.message}`);
    }

    revalidatePath('/', "layout");
    return {tmu};
}

export const deleteTmu = async (id: string) => {
    const tmu = await prisma.tmuNotice.delete({
        where: {id},
    });

    await log("DELETE", "TMU_NOTICE", `Deleted TMU Notice ${tmu.message}`);

    revalidatePath('/', "layout");
}

export const updateTmuOrder = async (items: OrderItem[]) => {

    for (const item of items) {
        await prisma.tmuNotice.update({
            where: {id: item.id},
            data: {
                order: item.order,
            },
        });
    }

    await log("UPDATE", "TMU_NOTICE", `Updated TMU order`);

}