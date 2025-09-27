'use client';
import React from 'react';
import {Airport, AirportRunway} from "@prisma/client";
import {Grid2} from "@mui/material";
import AirportAtisGridItems from "@/components/Airport/AirportAtisGridItems";
import AirportFlowGridItem from "@/components/Airport/AirportFlowGridItem";
import AirportLocalInformation from "@/components/Airport/AirportLocalInformation";

export default function AirportInformationSmall({airport, runways, disableOnlineInformation}: {
    airport: Airport,
    runways: AirportRunway[],
    disableOnlineInformation?: boolean
}) {
    return (
        <Grid2 container columns={10}>
            <AirportAtisGridItems icao={airport.icao} small atisIntegrationDisabled={airport.disableAutoAtis}
                                  disableOnlineInformation={disableOnlineInformation}/>
            <AirportFlowGridItem airport={airport} runways={runways} small/>
            <AirportLocalInformation airport={airport} small disableOnlineInformation={disableOnlineInformation}/>
        </Grid2>
    );
}