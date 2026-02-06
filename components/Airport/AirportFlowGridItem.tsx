'use client';
import React, {useEffect, useState} from 'react';
import {Airport, AirportRunway} from "@/generated/prisma/client";
import {Divider, Grid, Stack, Typography} from "@mui/material";
import {socket} from "@/lib/socket";
import {toast} from "react-toastify";

export default function AirportFlowGridItem({airport, runways, small}: {
    airport: Airport,
    runways: AirportRunway[],
    small?: boolean
}) {

    const [departureRunways, setDepartureRunways] = useState<AirportRunway[]>(runways.filter(runway => runway.inUseDepartureTypes.length > 0));
    const [arrivalRunways, setArrivalRunways] = useState<AirportRunway[]>(runways.filter(runway => runway.inUseApproachTypes.length > 0));

    useEffect(() => {
        let isMounted = true;

        const handleFlowUpdate = (data: AirportRunway[]) => {
            if (isMounted) {
                setDepartureRunways(data.filter(runway => runway.inUseDepartureTypes.length > 0));
                setArrivalRunways(data.filter(runway => runway.inUseApproachTypes.length > 0));
                toast.info(`${airport.icao} flow has been updated.`);
            }
        };

        socket.on(`${airport.facilityId}-flow`, handleFlowUpdate);

        return () => {
            isMounted = false;
            socket.off(`${airport.facilityId}-flow`, handleFlowUpdate);
        };
    }, [airport]);

    if (small) {
        return (
            <>
                <Grid size={3} sx={{border: 1,}}>
                    <Typography variant="h6" textAlign="center">
                        <span
                            style={{color: 'yellow',}}>{arrivalRunways.map((r) => r.runwayIdentifier).join(' ')}</span><span> / </span><span
                        style={{color: 'purple',}}>{departureRunways.map((r) => r.runwayIdentifier).join(' ')}</span>
                    </Typography>
                </Grid>
            </>
        )
    }

    return (
        <Grid size={3} sx={{border: 1,height: 200,}}>
            <Stack direction="column" spacing={1} sx={{color: 'yellow', height: '100%', overflow: 'auto',}}>
                {arrivalRunways.map(runway => (
                    <Typography key={runway.id} variant={arrivalRunways.length > 2 ? 'h6' : 'h4'}>
                        {runway.inUseApproachTypes.join('/')} <b>{runway.runwayIdentifier}</b>
                    </Typography>
                ))}
                <Divider/>
                {departureRunways.map(runway => (
                    <Typography key={runway.id} variant={departureRunways.length > 2 ? 'h6' : 'h4'} color="purple">
                        {runway.inUseDepartureTypes.join('/')} <b>{runway.runwayIdentifier}</b>
                    </Typography>
                ))}
            </Stack>
        </Grid>
    );
}