'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {revalidatePath} from "next/cache";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {Prisma} from "@prisma/client";

export const fetchAirports = async (pagination: GridPaginationModel, sort: GridSortModel, filter?: GridFilterItem) => {
    const orderBy: Prisma.AirportOrderByWithRelationInput = {};
    if (sort.length > 0) {
        const sortField = sort[0].field as keyof Prisma.AirportOrderByWithRelationInput;
        orderBy[sortField] = sort[0].sort === 'asc' ? 'asc' : 'desc';
    }

    return prisma.$transaction([
        prisma.airport.count({
            where: getWhere(filter),
        }),
        prisma.airport.findMany({
            orderBy,
            where: getWhere(filter),
            take: pagination.pageSize,
            skip: pagination.page * pagination.pageSize,
            include: {
                radars: {
                    orderBy: {
                        identifier: 'asc',
                    }
                },
                runways: {
                    orderBy: {
                        runwayIdentifier: 'asc',
                    },
                },
            },
        })
    ]);
}

const getWhere = (filter?: GridFilterItem): Prisma.AirportWhereInput => {
    if (!filter) {
        return {};
    }
    switch (filter?.field) {
        case 'icao':
            return {
                icao: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        case 'iata':
            return {
                iata: {
                    [filter.operator]: filter.value as string,
                    mode: 'insensitive',
                },
            };
        default:
            return {};
    }
};

export const createOrUpdateAirport = async (formData: FormData) => {
    const airportZ = z.object({
        id: z.string().optional(),
        icao: z.string().toUpperCase().length(4, "ICAO is required and must be 4 characters long."),
        iata: z.string().toUpperCase().length(3, "IATA is required and must be 3 characters long."),
        sopLink: z.string().url("SOP Link is required and must be a valid URL."),
        runways: z.array(z.object({
            id: z.string().optional(),
            runwayIdentifier: z.string().min(1, "Runway Identifier is required"),
            availableDepartureTypes: z.array(z.string().min(1, "Available Departure Types are required")),
            availableApproachTypes: z.array(z.string().min(1, "Available Approach Types are required")),
        })).min(1, "At least one runway is required"),
        radars: z.array(z.string()),
    });

    const data = airportZ.safeParse({
        id: formData.get("id") as string,
        icao: formData.get("icao") as string,
        iata: formData.get("iata") as string,
        sopLink: formData.get("sopLink") as string,
        runways: JSON.parse(formData.get("runways") as string),
        radars: JSON.parse(formData.get("radars") as string),
    });

    if (!data.success) {
        return {errors: data.error.errors};
    }

    const airport = await prisma.airport.upsert({
        create: {
            icao: data.data.icao,
            iata: data.data.iata,
            sopLink: data.data.sopLink,
            facility: {
                connectOrCreate: {
                    where: {id: data.data.iata},
                    create: {
                        id: data.data.iata,
                    }
                },
            },
            runways: {
                create: data.data.runways.map((runway) => ({
                    runwayIdentifier: runway.runwayIdentifier,
                    availableDepartureTypes: {set: runway.availableDepartureTypes},
                    availableApproachTypes: {set: runway.availableApproachTypes},
                })),
            },
            radars: {
                connect: data.data.radars.map((radarId) => ({id: radarId})),
            },
        },
        update: {
            icao: data.data.icao,
            iata: data.data.iata,
            runways: {
                upsert: data.data.runways.map((runway) => ({
                    create: runway,
                    update: runway,
                    where: {id: runway.id || ''},
                })),
            },
            radars: {
                set: data.data.radars.map((radarId) => ({id: radarId})),
            },
        },
        where: {
            id: data.data.id || '',
        },
    });

    revalidatePath("/admin/airports");

    return {airport};
}