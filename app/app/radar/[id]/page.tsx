import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Grid2} from "@mui/material";
import Viewer from "@/components/Viewer/Viewer";
import ButtonsTray from "@/components/Tray/ButtonsTray";
import TmuGridItem from "@/components/Tmu/TmuGridItem";
import AirportInformationSmall from "@/components/Airport/AirportInformationSmall";
import RadarBorderingSectorsGridItem from "@/components/Radar/RadarBorderingSectorsGridItem";

import RadarChartSelector from "@/components/Radar/RadarChartSelector";
import {Metadata} from "next";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import AirportAtisGridItems from '@/components/Airport/AirportAtisGridItems';
import SuaRequestInformation from "@/components/SuaRequest/SuaRequestInformation";
import MessageListener from "@/components/Message/MessageListener";
import ReleaseRequestInformation from "@/components/ReleaseRequest/ReleaseRequestInformation";
import RadarConsolidationDialog from "@/components/RadarConsolidation/RadarConsolidationDialog";
import {Consolidation} from "@/components/Viewer/Consolidation";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const {id} = params;

    const airport = await prisma.radar.findUnique({
        where: {
            facilityId: id,
        },
        select: {
            facilityId: true,
        },
    });

    return {
        title: airport?.facilityId || 'UNKNOWN',
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



    const session = await getServerSession(authOptions);

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
        <Grid2 container columns={12}>
            <RadarConsolidationDialog session={session} existing={myRadarConsolidation as Consolidation }/>
            <MessageListener facility={id} cid={session.user.cid} />
            <Grid2 size={8} height={250} sx={{border: 1, overflowY: 'auto', }}>
                {radar.connectedAirports.map((airport) => (
                    <AirportInformationSmall key={airport.id} airport={airport} runways={airport.runways}/>
                ))}
                <Grid2 container columns={10}>
                    <AirportAtisGridItems icao="" small free/>
                </Grid2>
            </Grid2>
            <RadarBorderingSectorsGridItem user={session.user} radar={radar}/>
            <RadarChartSelector airports={radar.connectedAirports}/>
            <TmuGridItem facility={radar.facility}/>
            <ReleaseRequestInformation facility={id} cid={session.user.cid} />
            {/*<NotamInformation facility={radar.facility} initialNotams={radar.notams} radar/>*/}
            <SuaRequestInformation/>
            <ButtonsTray radar={radar}/>
            <Viewer/>
        </Grid2>
    );
}