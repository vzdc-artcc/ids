import React from 'react';
import prisma from "@/lib/prisma";
import {Typography} from "@mui/material";
import {notFound} from "next/navigation";
import FlowPresetForm from "@/components/Admin/FlowPreset/FlowPresetForm";

export default async function Page(props: { params: Promise<{ id: string; }>; }) {
    const params = await props.params;

    const {id} = params;

    const flowPreset = await prisma.flowPreset.findUnique({
        where: {
            id,
        },
        include: {
            runways: {
                include: {
                    runway: true,
                },
            },
            airport: {
                include: {
                    runways: {
                        orderBy: {
                            runwayIdentifier: 'asc',
                        },
                    },
                },
            },
        },
    });

    if (!flowPreset) {
        notFound();
    }

    return (
        <>
            <Typography variant="h5" gutterBottom>Edit Flow Preset - {flowPreset.airport.icao}</Typography>
            <FlowPresetForm icao={flowPreset.airport.icao} preset={flowPreset}
                            currentRunways={flowPreset.runways.map((r) => ({...r, id: r.runway.runwayIdentifier,}))}
                            allRunways={flowPreset.airport.runways}/>
        </>
    );
}