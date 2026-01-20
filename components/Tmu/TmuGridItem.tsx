'use client';
import React, {useEffect, useState} from 'react';
import {Facility, TmuNotice} from "@prisma/client";
import {Box, Grid2, Typography} from "@mui/material";
import {fetchSingleTmu} from "@/actions/tmu";
import {socket} from "@/lib/socket";
import {toast} from "react-toastify";

export default function TmuGridItem({facility}: { facility: Facility, }) {

    const [broadcasts, setBroadcasts] = useState<TmuNotice[]>();

    useEffect(() => {
        fetchSingleTmu(facility).then(setBroadcasts);
        socket.on(`${facility.id}-tmu`, () => {
            fetchSingleTmu(facility).then(setBroadcasts);
            toast.info(`${facility.id} TMU broadcasts have been updated.`);
        });

        return () => {
            socket.off(`${facility.id}-tmu`);
        };
    }, [facility]);

    return (
        <Grid2 size={4} height={250} sx={{border: 1, overflowY: 'auto', }}>
            <Typography variant="h6">TMU</Typography>
            <Box sx={{overflow: 'auto',}}>
                {broadcasts?.map((broadcast) => (
                    <Typography key={broadcast.id} color="orange" fontSize={13}>{broadcast.message}</Typography>
                ))}
            </Box>
        </Grid2>
    );

}