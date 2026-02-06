import React from 'react';
import prisma from "@/lib/prisma";
import {notFound} from "next/navigation";
import {Grid} from "@mui/material";
import Viewer from "@/components/Viewer/Viewer";
import ButtonsTray from "@/components/Tray/ButtonsTray";
import TmuGridItem from "@/components/Tmu/TmuGridItem";
import AirportInformationSmall from "@/components/Airport/AirportInformationSmall";

import RadarChartSelector from "@/components/Radar/RadarChartSelector";
import {Metadata} from "next";
import AirportAtisGridItems from '@/components/Airport/AirportAtisGridItems';
import SuaRequestInformation from "@/components/SuaRequest/SuaRequestInformation";
import MessageListener from "@/components/Message/MessageListener";
import ReleaseRequestInformation from "@/components/ReleaseRequest/ReleaseRequestInformation";
import RadarConsolidationDialog from "@/components/RadarConsolidation/RadarConsolidationDialog";
import {Consolidation} from "@/types";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import ConflictProbingInformation from "@/components/ConflictProbing/ConflictProbingInformation";
import RadarBorderingSectorsGridItem from "@/components/Radar/RadarBorderingSectorsGridItem";

const TRAINING_MODE = process.env['TRAINING_MODE'] === 'true';

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const {id} = params;

    return {
        title: `${id} -- IDS`,
    }
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;

    const {id} = params;

    const radar = await prisma.radar.findUnique({
        where: {
            facilityId: id,
        },
        include: {
            facility: true,
            connectedAirports: {
                include: {
                    runways: true,
                },
                orderBy: {
                    facility: {
                        order: 'asc',
                    },
                },
            },
        },
    });

    if (!radar) {
        notFound();
    }



    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return;
    }

    const myRadarConsolidation = await prisma.radarConsolidation.findFirst({
        where: {
            userId: session.user.id,
        },
        include: {
            primarySector: true,
            secondarySectors: true,
            user: true,
        }
    });

    return (
        <Grid container columns={12}>
            <MessageListener facility={id} cid={session.user.cid} />
            <Grid size={8} sx={{border: 1, overflowY: 'auto', height: 250, }}>
                {radar.connectedAirports.map((airport) => (
                    <AirportInformationSmall key={airport.id} airport={airport} runways={airport.runways}
                                             disableOnlineInformation={TRAINING_MODE}/>
                ))}
                <Grid container columns={10}>
                    <AirportAtisGridItems icao="" small free disableOnlineInformation={TRAINING_MODE}/>
                </Grid>
            </Grid>
            <TmuGridItem facility={radar.facility} big />
            <RadarChartSelector airports={radar.connectedAirports}/>
            {radar.isEnrouteFacility &&
                <Grid size={3} height={250} sx={{border: 1, overflowY: 'auto' }}>
                    <ConflictProbingInformation alertsOnly />
                </Grid> }
            {!radar.isEnrouteFacility && <RadarBorderingSectorsGridItem user={session.user} radar={radar}/>}
            <ReleaseRequestInformation facility={id} cid={session.user.cid} />
            {/*<NotamInformation facility={radar.facility} initialNotams={radar.notams} radar/>*/}
            <SuaRequestInformation disabled={TRAINING_MODE}/>
            <ButtonsTray radar={radar}/>
            <Viewer/>
            <RadarConsolidationDialog existing={myRadarConsolidation as Consolidation }/>
        </Grid>
    );
}