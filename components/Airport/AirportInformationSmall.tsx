'use client';
import React from 'react';
import {Airport, AirportRunway} from "@/generated/prisma/client";
import {Grid} from "@mui/material";
import AirportAtisGridItems from "@/components/Airport/AirportAtisGridItems";
import AirportFlowGridItem from "@/components/Airport/AirportFlowGridItem";
import AirportLocalInformation from "@/components/Airport/AirportLocalInformation";

export default function AirportInformationSmall({airport, runways, height, disableOnlineInformation,}: {
    airport: Airport,
    runways: AirportRunway[],
    height: number | string,
    disableOnlineInformation?: boolean
}) {
    return (
        <Grid container columns={10} sx={{ height, }}>
            <AirportAtisGridItems icao={airport.icao} small atisIntegrationDisabled={airport.disableAutoAtis}
                                  disableOnlineInformation={disableOnlineInformation}/>
            <AirportFlowGridItem airport={airport} runways={runways} small/>
            <AirportLocalInformation airport={airport} small disableOnlineInformation={disableOnlineInformation}/>
        </Grid>
    );
}