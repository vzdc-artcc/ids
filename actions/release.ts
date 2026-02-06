'use server';

import {z} from "zod";
import {revalidatePath} from "next/cache";
import prisma from "@/lib/prisma";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {ReleaseRequest} from "@/generated/prisma/client";
import {ReleaseRequestAircraftState} from "@/types";

const getQueuePosition = (releaseRequests: ReleaseRequest[], releaseRequest: ReleaseRequest) => {
    const sortedReleaseRequests = releaseRequests.sort((a, b) => a.initTime.getTime() - b.initTime.getTime())
        .sort((a, b) => {
            const states = Object.values(ReleaseRequestAircraftState).filter((item) => {
                return isNaN(Number(item));
            });
            return states.indexOf(b.initState) - states.indexOf(a.initState);
        });

    return sortedReleaseRequests.findIndex(r => r.id === releaseRequest.id);
}

export const fetchReleaseRequestsFiltered = async (cid: string, facility: string) => {
    const allReleaseRequests = await prisma.releaseRequest.findMany({
        include: {
            startedBy: true,
        },
    });

    const toReturn = []
    for (const rr of allReleaseRequests) {
        toReturn.push({
            ...rr,
            queuePosition: getQueuePosition(
                allReleaseRequests.filter(r => !r.released && r.destination === rr.destination),
                rr,
            ),
        });
    }

    return toReturn.filter((rr) => {
        return rr.startedBy.cid === cid || rr.initFacility === facility;
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

    const existing = await prisma.releaseRequest.findUnique({
        where: {
            id,
        }
    });

    if (!existing) {
        return;
    }

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
        initState: z.string().toUpperCase().min(1, "Initial state is required"),
        freeText: z.string().toUpperCase().optional(),
    });

    const result = releaseRequestZ.safeParse({
        callsign: formData.get('callsign'),
        origin: formData.get('origin'),
        destination: formData.get('destination'),
        aircraftType: formData.get('aircraftType'),
        initState: formData.get('initState'),
        freeText: formData.get('freeText'),
    });

    if (result.error) {
        return { errors: result.error.issues };
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

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
            initFacility: facility.toUpperCase(),
            initState: result.data.initState,
            startedById: session.user.id,
        },
    });

    return { request };
}

export const setReleaseTime = async (id: string, mode: 'window' | 'before' | 'after', time?: Date,) => {
    const r = await prisma.releaseRequest.update({
        where: {
            id,
        },
        data: {
            releaseTime: time || null,
            released: true,
            condition: mode,
        },
        include: {
            startedBy: true,
        },
    });

    revalidatePath('/app/tmu');
    return r;
}

export const removeReleaseTime = async (id: string) => {
    const r = await prisma.releaseRequest.update({
        where: {
            id,
        },
        data: {
            releaseTime: null,
            released: false,
            condition: null,
        },
        include: {
            startedBy: true,
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
                    gt: new Date((new Date()).getTime() + 1000*60*20),
                },
            },
        });
    } else {
        await prisma.releaseRequest.deleteMany();
    }

    revalidatePath('/', 'layout');
}

export const notifyNewReleaseStatus = async (id: string, status: string, freeText: string) => {
    return prisma.releaseRequest.update({
        where: {
            id,
        },
        data: {
            initState: status,
            freeText: freeText,
        },
        include: {
            startedBy: true,
        },
    });
}