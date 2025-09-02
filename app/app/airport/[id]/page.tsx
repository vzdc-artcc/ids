import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Grid2, Typography} from "@mui/material";
import AirportAtisGridItems from "@/components/Airport/AirportAtisGridItems";
import AirportFlowGridItem from "@/components/Airport/AirportFlowGridItem";
import AirportLocalInformation from "@/components/Airport/AirportLocalInformation";
import TmuGridItem from "@/components/Tmu/TmuGridItem";
import AirportRadarInformation from "@/components/Airport/AirportRadarInformation";
import AirportCharts from "@/components/Airport/AirportCharts";
import ButtonsTray from "@/components/Tray/ButtonsTray";
import Viewer from "@/components/Viewer/Viewer";
import {Metadata} from "next";
import MessageListener from "@/components/Message/MessageListener";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import ReleaseRequestInformation from "@/components/ReleaseRequest/ReleaseRequestInformation";

export async function generateMetadata(
    {params}: { params: Promise<{ id: string }> },
): Promise<Metadata> {
    const {id} = await params;

    const airport = await prisma.airport.findUnique({
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

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const { id } = await params;

    const airport = await prisma.airport.findUnique({
        where: {
            facilityId: id,
        },
        include: {
            facility: true,
            runways: true,
            radars: true,
            presets: true,
        }
    });

    if (!airport) {
        notFound();
    }

    const session = await getServerSession(authOptions);

    return session?.user && (
        <Grid2 container columns={12}>
            <MessageListener facility={id} cid={session.user.cid} />
            <AirportAtisGridItems icao={airport.icao} atisIntegrationDisabled={airport.disableAutoAtis}/>
            <AirportFlowGridItem airport={airport} runways={airport.runways}/>
            <AirportLocalInformation airport={airport}/>
            <ReleaseRequestInformation facility={id} cid={session.user.cid} />
            {/*<NotamInformation facility={airport.facility} initialNotams={airport.notams}/>*/}
            <TmuGridItem facility={airport.facility}/>
            <AirportRadarInformation icao={airport.icao} radars={airport.radars}/>
            <Grid2 size={6} sx={{border: 1,}}>
                <Typography variant="h6">CHARTS</Typography>
                <AirportCharts icao={airport.icao}/>
            </Grid2>
            <ButtonsTray airport={airport}/>
            <Viewer/>
        </Grid2>
    );
}