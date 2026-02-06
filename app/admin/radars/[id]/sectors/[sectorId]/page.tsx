import React from 'react';
import prisma from "@/lib/prisma";
import {notFound} from "next/navigation";
import {Card, CardContent, Typography} from "@mui/material";
import RadarSectorForm from "@/components/Admin/RadarSector/RadarSectorForm";

export default async function Page(props: { params: Promise<{ id: string, sectorId: string }> }) {
    const params = await props.params;

    const {id, sectorId} = params;

    const radarSector = await prisma.radarSector.findUnique({
        where: {
            id: sectorId,
            radarId: id,
        },
        include: {
            radar: true,
            borderingSectors: true,
        },
    });

    if (!radarSector) {
        notFound();
    }

    const allRadars = await prisma.radar.findMany({
        include: {
            sectors: {
                orderBy: {
                    identifier: 'asc',
                },
            },
        },
        orderBy: {
            identifier: 'asc',
        },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">Edit Radar Sector - {radarSector.radar.identifier}</Typography>
                <Typography variant="caption" gutterBottom>SECTOR ID: {radarSector.id}</Typography>
                <RadarSectorForm radarSector={radarSector} borderingSectors={radarSector.borderingSectors}
                                 radar={radarSector.radar} allRadars={allRadars}
                                 allRadarSectors={allRadars.flatMap(radar => radar.sectors)}/>
            </CardContent>
        </Card>
    );
}