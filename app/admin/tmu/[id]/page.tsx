import React from 'react';
import prisma from "@/lib/prisma";
import {Typography} from "@mui/material";
import {notFound} from "next/navigation";
import TmuForm from "@/components/Admin/TMU/TmuForm";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {id} = params;

    const tmu = await prisma.tmuNotice.findUnique({
        where: {
            id,
        },
        include: {
            broadcastedFacilities: {
                orderBy: {
                    id: 'asc',
                },
            },
        },
    });

    if (!tmu) {
        notFound();
    }

    const allFacilities = await prisma.facility.findMany({
        orderBy: {
            id: 'asc',
        },
    });

    return (
        <>
            <Typography variant="h5" gutterBottom>Edit T.M.U Notice</Typography>
            <TmuForm tmu={tmu} currentFacilities={tmu.broadcastedFacilities} allFacilities={allFacilities}/>
        </>
    );
}