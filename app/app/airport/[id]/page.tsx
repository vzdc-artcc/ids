import React from 'react';
import prisma from "@/lib/prisma";
import {notFound} from "next/navigation";
import {Grid, Typography} from "@mui/material";
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
import ReleaseRequestInformation from "@/components/ReleaseRequest/ReleaseRequestInformation";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

const TRAINING_MODE = process.env['TRAINING_MODE'] === 'true';

export async function generateMetadata(
    {params}: { params: Promise<{ id: string }> },
): Promise<Metadata> {
    const {id} = await params;

    return {
        title: `${id} -- IDS`,
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

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    return session?.user && (
        <Grid container columns={12}>
            <AirportAtisGridItems icao={airport.icao} atisIntegrationDisabled={airport.disableAutoAtis}
                                  disableOnlineInformation={TRAINING_MODE}/>
            <AirportFlowGridItem airport={airport} runways={airport.runways}/>
            <AirportLocalInformation airport={airport} disableOnlineInformation={TRAINING_MODE}/>
            <ReleaseRequestInformation facility={id} cid={session.user.cid} />
            {/*<NotamInformation facility={airport.facility} initialNotams={airport.notams}/>*/}
            <TmuGridItem facility={airport.facility}/>
            <AirportRadarInformation icao={airport.icao} radars={airport.radars}
                                     disableOnlineInformation={TRAINING_MODE}/>
            <Grid size={6} sx={{border: 1, height: 250, overflow: 'auto',}}>
                <AirportCharts icao={airport.icao}/>
            </Grid>
            <ButtonsTray airport={airport}/>
            <Viewer/>
            <MessageListener facility={id} cid={session.user.cid} />
        </Grid>
    );
}