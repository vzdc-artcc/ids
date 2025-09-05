import React from 'react';
import {Divider, Grid2, Typography} from "@mui/material";
import AirportAtisGridItems from "@/components/Airport/AirportAtisGridItems";
import SuaRequestInformation from "@/components/SuaRequest/SuaRequestInformation";
import ReleaseRequestViewer from "@/components/ReleaseRequest/ReleaseRequestViewer";
import MessageForm from "@/components/ReleaseRequest/MessageForm";
import ReleaseWindow from "@/components/Viewer/ReleaseWindow";

export default async function Page() {

    // const airports = await prisma.airport.findMany({
    //     orderBy: {
    //         icao: 'asc',
    //     },
    //     include: {
    //         runways: true,
    //     },
    // });


    return (
        <Grid2 container columns={6}>
            <Grid2 size={6} sx={{ border: 2, margin: 1, borderColor: 'red', }}>
                <Typography color="red">TRAFFIC MANAGEMENT ONLY</Typography>
            </Grid2>
            <Grid2 size={6} sx={{ border: 1, maxHeight: 500, }}>
                <Typography variant="h6">DEPARTURE RELEASE LIST</Typography>
                <ReleaseRequestViewer />
            </Grid2>
            <Grid2 size={4} sx={{ border: 1, }}>
                <Grid2 container columns={10}>
                    <AirportAtisGridItems icao="" small free/>
                </Grid2>
                {/*{airports.map((airport) => (*/}
                {/*    <AirportInformationSmall key={airport.id} airport={airport} runways={airport.runways}/>*/}
                {/*))}*/}
                <SuaRequestInformation />
                <Divider sx={{ my: 2, }}/>
                <ReleaseWindow facilityId="" />
            </Grid2>
            <Grid2 size={2} sx={{ border: 1, }}>
                <MessageForm />
            </Grid2>
        </Grid2>
    );
}