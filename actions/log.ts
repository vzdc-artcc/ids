'use server';

import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {LogModel, LogType, Prisma} from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export const log = async (type: LogType, model: LogModel, message: string) => {

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        await prisma.log.create({
            data: {
                user: {
                    connect: {
                        id: session.user.id,
                    }
                },
                timestamp: new Date(),
                type,
                model,
                message,
            }
        })
    }
}

export const fetchLogs = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem, onlyModels?: LogModel[]) => {
    const orderBy: Prisma.LogOrderByWithRelationInput = {};
    if (sort.length > 0) {
        orderBy.timestamp = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    const where = getWhere(filter, onlyModels);

    return prisma.$transaction([
        prisma.log.count({where}),
        prisma.log.findMany({
            orderBy,
            include: {
                user: true,
            },
            where,
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
        }),
    ]);
};

const getWhere = (filter?: GridFilterItem, onlyModels?: LogModel[]): Prisma.LogWhereInput => {
    if (!filter) {
        return {
            model: {
                in: onlyModels || Object.values(LogModel),
            },
        };
    }

    if (filter.field === 'model') {
        return {
            model: {
                in: [filter.value as LogModel].filter((v) => !!v),
            },
        };
    }

    if (filter.field === 'user') {
        return {
            model: {
                in: onlyModels || Object.values(LogModel),
            },
            user: {
                OR: [
                    {
                        cid: {
                            [filter.operator]: filter.value as string,
                            mode: 'insensitive',
                        },
                    },
                    {
                        fullName: {
                            [filter.operator]: filter.value as string,
                            mode: 'insensitive',
                        },
                    },
                ],
            } as Prisma.UserWhereInput,
        };
    }

    return {
        model: {
            in: onlyModels || Object.values(LogModel),
        },
        [filter.field]: {
            equals: filter.value,
        },
    };
};