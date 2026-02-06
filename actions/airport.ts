'use server';

import {z} from "zod";
import prisma from "@/lib/prisma";
import {revalidatePath} from "next/cache";
import {after} from "next/server";
import {GridFilterItem, GridPaginationModel, GridSortModel} from "@mui/x-data-grid";
import {AirportRunway, Prisma} from "@/generated/prisma/client";
import {log} from "@/actions/log";
import {OrderItem} from "@/components/Admin/Order/OrderList";

export const fetchAllAirports = async () => {
    return prisma.airport.findMany({
        orderBy: {
            icao: 'asc',
        },
        include: {
            runways: true,
        },
    });
}

export const updateVatisFlag = async (icao: string, flag: boolean) => {

    await prisma.airport.update({
        where: {
            icao,
        },
        data: {
            disableAutoAtis: flag,
        },
    })

    await log("UPDATE", "FRONTEND_ARP_SET", `${flag ? 'Disabled' : 'Enabled'} vAtis integration for ${icao}`);

    revalidatePath('/', "layout");
}

export const updateFlow = async (icao: string, criteria: {
    [key: string]: { inUseDepartureTypes: string[], inUseApproachTypes: string[] }
}) => {
    const airportZ = z.object({
        id: z.string(),
        runways: z.record(z.string(), z.object({
            inUseDepartureTypes: z.array(z.string()),
            inUseApproachTypes: z.array(z.string()),
        })),
    });

    const result = airportZ.safeParse({
        id: Object.keys(criteria)[0],
        runways: criteria,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    const runways: AirportRunway[] = [];

    for (const [runwayId, runway] of Object.entries(result.data.runways)) {
        const savedRunway = await prisma.airportRunway.update({
            where: {id: runwayId},
            data: {
                inUseDepartureTypes: {set: runway.inUseDepartureTypes},
                inUseApproachTypes: {set: runway.inUseApproachTypes},
            },
        });
        runways.push(savedRunway);
    }

    await log("UPDATE", "FRONTEND_ARP_SET", `Changed flow for ${icao}`);

    revalidatePath('/', "layout");

    return {runways};
}

export const updateLocalSplit = async (airportId: string, localSplit: string[]) => {
    const airport = await prisma.airport.update({
        where: {id: airportId},
        data: {
            localSplit: {set: localSplit},
        },
    });

    await log("UPDATE", "FRONTEND_ARP_SET", `Changed local split for ${airport.icao}`);

    revalidatePath('/', "layout");

    return {airport};
}

export const updateNotams = async (airportId: string, notams: string[]) => {
    const airport = await prisma.airport.update({
        where: {id: airportId},
        data: {
            notams: {set: notams},
        },
    });

    await log("UPDATE", "FRONTEND_ARP_SET", `Changed NOTAMs for ${airport.icao}`);

    revalidatePath('/', "layout");

    return {airport};
}

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
                facility: true,
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
        isHidden: z.boolean().optional(),
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
        primaryRadar: z.string().min(1, "Primary Radar is required"),
    });

    const result = airportZ.safeParse({
        id: formData.get("id") as string,
        isHidden: formData.get("isHidden") === "on",
        icao: formData.get("icao") as string,
        iata: formData.get("iata") as string,
        sopLink: formData.get("sopLink") as string,
        runways: JSON.parse(formData.get("runways") as string),
        radars: JSON.parse(formData.get("radars") as string),
        primaryRadar: formData.get("primaryRadar") as string,
    });

    if (!result.success) {
        return {errors: result.error.issues};
    }

    if (result.data.id) {
        await prisma.airportRunway.deleteMany({
            where: {
                airport: {
                    id: result.data.id || '',
                },
                id: {
                    notIn: result.data.runways.map((runway) => runway.id || ''),
                },
            },
        });
    }

    const airport = await prisma.airport.upsert({
        create: {
            icao: result.data.icao,
            iata: result.data.iata,
            sopLink: result.data.sopLink,
            primaryRadar: {
                connect: {id: result.data.primaryRadar},
            },
            facility: {
                connectOrCreate: {
                    where: {id: result.data.icao},
                    create: {
                        hiddenFromPicker: result.data.isHidden,
                        id: result.data.icao,
                    }
                },
            },
            runways: {
                create: result.data.runways.map((runway) => ({
                    runwayIdentifier: runway.runwayIdentifier,
                    availableDepartureTypes: {set: runway.availableDepartureTypes},
                    availableApproachTypes: {set: runway.availableApproachTypes},
                })),
            },
            radars: {
                connect: result.data.radars.map((radarId) => ({id: radarId})),
            },
        },
        update: {
            icao: result.data.icao,
            iata: result.data.iata,
            sopLink: result.data.sopLink,
            primaryRadar: {
                connect: {id: result.data.primaryRadar},
            },
            facility: {
                update: {
                    id: result.data.icao,
                    hiddenFromPicker: result.data.isHidden,
                },
            },
            radars: {
                set: result.data.radars.map((radarId) => ({id: radarId})),
            },
        },
        where: {
            id: result.data.id || '',
        },
    });

    if (result.data.id) {
        for (const runway of result.data.runways) {
            await prisma.airportRunway.upsert({
                create: {
                    runwayIdentifier: runway.runwayIdentifier,
                    availableDepartureTypes: {set: runway.availableDepartureTypes},
                    availableApproachTypes: {set: runway.availableApproachTypes},
                    airport: {
                        connect: {id: airport.id},
                    },
                },
                update: {
                    runwayIdentifier: runway.runwayIdentifier,
                    availableDepartureTypes: {set: runway.availableDepartureTypes},
                    availableApproachTypes: {set: runway.availableApproachTypes},
                },
                where: {
                    id: runway.id || '',
                },
            });

            after(async () => {
                const flowRunways = await prisma.flowPresetRunway.findMany({
                    where: {
                        runwayId: runway.id,
                    },
                });

                for (const fr of flowRunways) {
                    await prisma.flowPresetRunway.update({
                        where: {id: fr.id},
                        data: {
                            departureTypes: {
                                set: fr.departureTypes.filter((dt) => runway.availableDepartureTypes.includes(dt)),
                            },
                            approachTypes: {
                                set: fr.approachTypes.filter((at) => runway.availableApproachTypes.includes(at)),
                            },
                        },
                    });
                }
            });
        }
    }

    after(async () => {
        if (result.data.id) {
            await log("UPDATE", "AIRPORT", `Updated airport ${result.data.icao}`);
        } else {
            await log("CREATE", "AIRPORT", `Created airport ${result.data.icao}`);
        }
    });

    revalidatePath("/admin/airports");

    return {airport};
}

export const updateAirportOrder = async (items: OrderItem[]) => {

    for (const item of items) {
        await prisma.airport.update({
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

    await log("UPDATE", "AIRPORT", `Updated airport order`);

}