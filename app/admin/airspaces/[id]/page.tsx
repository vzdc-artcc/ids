import React from 'react';
import prisma from "@/lib/prisma";
import {Typography} from "@mui/material";
import AirspaceDiagramForm from "@/components/Admin/AirspaceDiagram/AirspaceDiagramForm";
import {notFound} from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {id} = params;

    const airspaceDiagram = await prisma.airspaceDiagram.findUnique({
        where: {
            id,
        },
    });

    if (!airspaceDiagram) {
        notFound();
    }

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
            <Typography variant="h5" gutterBottom>Edit Airspace Diagram</Typography>
            <AirspaceDiagramForm airspaceDiagram={airspaceDiagram} allFacilities={allFacilities as never}/>
        </>
    );
}