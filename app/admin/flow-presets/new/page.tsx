import React from 'react';
import {Button, ButtonGroup, Typography} from "@mui/material";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function Page() {

    const airports = await prisma.airport.findMany({
        select: {
            icao: true,
        },
    });

    return (
        <>
            <Typography variant="h5" gutterBottom>New Flow Preset</Typography>
            <Typography>Select an airport from the list:</Typography>
            <ButtonGroup variant="outlined" color="inherit" orientation="vertical">
                {airports.map((airport) => (
                    <Link key={airport.icao} href={`/admin/flow-presets/new/${airport.icao}`}
                          style={{color: 'inherit',}}>
                        <Button>{airport.icao}</Button>
                    </Link>
                ))}
            </ButtonGroup>
        </>
    );
}