'use server';

import {z} from "zod";
import prisma from "@/lib/db";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {revalidatePath} from "next/cache";

export const fetchReleaseRequestsFiltered = async (cid: string, facility: string) => {
    return prisma.releaseRequest.findMany({
        where: {
            OR: [
                {
                    startedBy: {
                        cid,
                    },
                },
                {
                    initFacility: facility,
                },
            ],
        },
        orderBy: [
            { releaseTime: 'asc', },
            { initTime: 'asc',}
        ],
        include: {
            startedBy: true,
        }
    });
}

export const fetchReleaseRequests = async () => {
    return prisma.releaseRequest.findMany({
        orderBy: {
            initTime: 'asc',
        },
        include: {
            startedBy: true,
        }
    });
}

export const fetchReleaseRequest = async (id: string) => {
    return prisma.releaseRequest.findUnique({
        where: {
            id,
        },
        include: {
            startedBy: true,
        }
    });
}

export const deleteReleaseRequest = async (id: string) => {
    const request = prisma.releaseRequest.delete({
        where: {
            id,
        },
    });

    revalidatePath('/app/tmu');

    return request;
}

export const createReleaseRequest = async (facility: string, formData: FormData) => {

    const releaseRequestZ = z.object({
        callsign: z.string().min(1, "Callsign is required").toUpperCase(),
        origin: z.string().min(3, "Origin must be 3 or 4 characters").max(4, "Origin must be 3 or 4 characters").toUpperCase(),
        destination: z.string().min(3, "Destination must be 3 or 4 characters").max(4, "Destination must be 3 or 4 characters").toUpperCase(),
        aircraftType: z.string().toUpperCase().optional(),
        freeText: z.string().toUpperCase().optional(),
    });

    const result = releaseRequestZ.safeParse({
        callsign: formData.get('callsign'),
        origin: formData.get('origin'),
        destination: formData.get('destination'),
        aircraftType: formData.get('aircraftType'),
        freeText: formData.get('freeText'),
    });

    if (result.error) {
        return { errors: result.error.errors };
    }

    const session = await getServerSession(authOptions);

    if (!session) {
        throw new Error("No session");
    }

    const request = await prisma.releaseRequest.create({
        data: {
            callsign: result.data.callsign,
            origin: result.data.origin.startsWith('K') && result.data.origin.length === 4 ? result.data.origin.substring(1) : result.data.origin,
            destination: result.data.destination.startsWith('K') && result.data.destination.length === 4 ? result.data.destination.substring(1) : result.data.destination,
            aircraftType: result.data?.aircraftType,
            freeText: result.data?.freeText,
            initFacility: facility,
            startedById: session.user.id,
        },
    });

    return { request };
}

export const setReleaseTime = async (id: string, time: Date) => {
    const r = await prisma.releaseRequest.update({
        where: {
            id,
        },
        data: {
            releaseTime: time,
        },
    });

    revalidatePath('/app/tmu');
    return r;
}

export const deleteReleaseRequests = async (onlyPast: boolean) => {
    if (onlyPast) {
        await prisma.releaseRequest.deleteMany({
            where: {
                releaseTime: {
                    lt: new Date((new Date()).getTime() + 1000*60*20),
                },
            },
        });
    } else {
        await prisma.releaseRequest.deleteMany();
    }

    revalidatePath('/', 'layout');
}