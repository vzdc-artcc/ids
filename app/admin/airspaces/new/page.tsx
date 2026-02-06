import React from 'react';
import prisma from "@/lib/prisma";
import {Typography} from "@mui/material";
import AirspaceDiagramForm from "@/components/Admin/AirspaceDiagram/AirspaceDiagramForm";

export default async function Page() {

    const allFacilities = await prisma.facility.findMany({
        include: {
            airport: true,
            radar: {
                include: {
                    sectors: true,
                },
            },
        }
    });

    return (
        <>
            <Typography variant="h5" gutterBottom>New Airspace Diagram</Typography>
            <AirspaceDiagramForm allFacilities={allFacilities as never}/>
        </>
    );
}