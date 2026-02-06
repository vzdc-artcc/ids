import React from 'react';
import prisma from "@/lib/prisma";
import {Typography} from "@mui/material";
import {notFound} from "next/navigation";
import FlowPresetForm from "@/components/Admin/FlowPreset/FlowPresetForm";

export default async function Page(props: { params: Promise<{ icao: string }> }) {
    const params = await props.params;

    const {icao} = params;

    const allRunways = await prisma.airportRunway.findMany({
        where: {
            airport: {
                icao,
            },
        },
        orderBy: {
            runwayIdentifier: 'asc',
        },
    });

    if (allRunways.length === 0) {
        notFound();
    }

    return (
        <>
            <Typography variant="h5" gutterBottom>New Flow Preset - {icao}</Typography>
            <FlowPresetForm icao={icao} allRunways={allRunways}/>
        </>
    );
}