import React from 'react';
import prisma from "@/lib/prisma";
import {Typography} from "@mui/material";
import AirportForm from "@/components/Admin/Airport/AirportForm";
import {notFound} from "next/navigation";

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {id} = params;

    const airport = await prisma.airport.findUnique({
        where: {
            id,
        },
        include: {
            radars: true,
            runways: true,
            facility: true,
            primaryRadar: true,
        },
    });

    if (!airport) {
        notFound();
    }

    const allRadars = await prisma.radar.findMany({
        orderBy: {
            identifier: 'asc',
        },
    });

    return (
        <>
            <Typography variant="h5" gutterBottom>Edit Airport {airport.icao}</Typography>
            <AirportForm airport={airport} currentRadars={airport.radars} currentRunways={airport.runways}
                         allRadars={allRadars} hidden={airport.facility.hiddenFromPicker}
                         primaryRadar={airport.primaryRadar || undefined}/>
        </>
    );
}