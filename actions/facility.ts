'use server';
import {revalidatePath} from "next/cache";
import {log} from "@/actions/log";
import prisma from "@/lib/prisma";

export const fetchAllFacilities = async () => {
    return prisma.facility.findMany();
}

export const getSopLink = async (id: string) => {
    const facility = await prisma.facility.findUnique({
        where: {
            id,
        },
        include: {
            airport: true,
            radar: true,
        },
    });

    return facility?.airport?.sopLink || facility?.radar?.sopLink;
}

export const deleteFacility = async (id: string) => {

    try {
        const f = await prisma.facility.delete({
            where: {
                id,
            },
            include: {
                airport: true,
                radar: true,
            },
        });

        if (f.airport) {
            await log("DELETE", "AIRPORT", `Deleted airport ${f.airport.icao}`);
        } else if (f.radar) {
            await log("DELETE", "RADAR", `Deleted radar ${f.radar.name}`);
        }
    } catch (e) {
        try {
            await prisma.airport.delete({
                where: {
                    iata: id,
                },
            });
        } catch (e) {
            await prisma.radar.delete({
                where: {
                    identifier: id,
                },
            });
        }
    }


    revalidatePath('/', "layout");
}