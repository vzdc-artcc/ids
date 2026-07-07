'use server';

import prisma from "@/lib/prisma";
import {log} from "@/actions/log";

export const toggleCltLandingDirection= async () => {
    const airport = await prisma.airport.findUnique({
        where: {
            icao: 'KCLT',
        },
        include: {
            runways: true,
        }
    });

    if (!airport) {
        return "ERR";
    }

    const currentOpsRunway = airport.runways.find((r) => r.inUseApproachTypes.length > 0);

    let runwayOps;

    if (currentOpsRunway) {
        runwayOps = currentOpsRunway.runwayIdentifier;
    }

    if (runwayOps === 'NORTH') {
        runwayOps = "SOUTH";
    } else {
        runwayOps = "NORTH";
    }

    let newOpsRunway = airport.runways.find((r) => r.runwayIdentifier === runwayOps);
    if (!newOpsRunway || newOpsRunway.availableApproachTypes.length === 0) {
        return "ERR";
    }

    if (currentOpsRunway) {
        await prisma.airportRunway.update({
            where: {
                id: currentOpsRunway.id,
            },
            data: {
                availableDepartureTypes: [],
                availableApproachTypes: ['USE-ERIDS-BUTTON-INSTEAD'],
                inUseDepartureTypes: [],
                inUseApproachTypes: [],
            },
        });
    }

    newOpsRunway = await prisma.airportRunway.update({
        where: {
            id: newOpsRunway.id,
        },
        data: {
            availableDepartureTypes: [],
            availableApproachTypes: ['USE-ERIDS-BUTTON-INSTEAD'],
            inUseDepartureTypes: [],
            inUseApproachTypes: [newOpsRunway.availableApproachTypes[0]],
        },
    });

    log("UPDATE", "FRONTEND_ARP_SET", `Changed CLT landing direction to ${runwayOps}`).then();

    return {runwayOps, newOpsRunway};
}