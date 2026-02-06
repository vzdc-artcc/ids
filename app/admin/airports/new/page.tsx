import React from 'react';
import prisma from "@/lib/prisma";
import {Typography} from "@mui/material";
import AirportForm from "@/components/Admin/Airport/AirportForm";

export default async function Page() {

    const allRadars = await prisma.radar.findMany({
        orderBy: {
            identifier: 'asc'
        }
    });

    return (
        <>
            <Typography variant="h5" gutterBottom>New Airport</Typography>
            <AirportForm allRadars={allRadars}/>
        </>
    );
}