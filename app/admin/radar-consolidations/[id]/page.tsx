import React from 'react';
import prisma from "@/lib/prisma";
import {Typography} from "@mui/material";
import {notFound} from "next/navigation";
import {fetchAllRadarSectors} from "@/actions/radarSector";
import RadarConsolidationForm from "@/components/Admin/RadarConsolidation/RadarConsolidationForm";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {id} = params;

    const radarConsolidation = await prisma.defaultRadarConsolidation.findUnique({
        where: {
            id,
        },
        include: {
            primarySector: {
                include: {
                    radar: true,
                },
            },
            secondarySectors: {
                include: {
                    radar: true,
                },
            },
        },
    });

    if (!radarConsolidation) {
        notFound();
    }

    const allSectors = await fetchAllRadarSectors();

    return (
        <>
            <Typography variant="h5" gutterBottom>Edit Default Radar Consolidation</Typography>
            <RadarConsolidationForm consolidation={radarConsolidation} allSectors={allSectors}/>
        </>
    );
}