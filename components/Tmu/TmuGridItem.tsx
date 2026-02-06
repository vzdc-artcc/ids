'use client';
import React, {useEffect, useState} from 'react';
import {Facility, TmuNotice} from "@/generated/prisma/client";
import {Box, Grid, Typography} from "@mui/material";
import {fetchSingleTmu} from "@/actions/tmu";
import {socket} from "@/lib/socket";
import {toast} from "react-toastify";

export default function TmuGridItem({facility, big}: { facility: Facility, big?: boolean }) {

    const [broadcasts, setBroadcasts] = useState<TmuNotice[]>();

    useEffect(() => {
        let isMounted = true;

        fetchSingleTmu(facility).then((data) => {
            if (isMounted) {
                setBroadcasts(data);
            }
        }).catch((error) => {
            console.error('Error fetching TMU data:', error);
        });

        const handleTmuUpdate = () => {
            fetchSingleTmu(facility).then((data) => {
                if (isMounted) {
                    setBroadcasts(data);
                    toast.info(`${facility.id} TMU broadcasts have been updated.`);
                }
            }).catch((error) => {
                console.error('Error fetching TMU data:', error);
            });
        };

        socket.on(`${facility.id}-tmu`, handleTmuUpdate);

        return () => {
            isMounted = false;
            socket.off(`${facility.id}-tmu`, handleTmuUpdate);
        };
    }, [facility]);

    return (
        <Grid size={big ? 4 : 3} height={250} sx={{border: 1, overflowY: 'auto', }}>
            <Typography variant="h6">TMU</Typography>
            {broadcasts?.map((broadcast) => (
                <Typography key={broadcast.id} color="orange" fontSize={13}>{broadcast.message}</Typography>
            ))}
        </Grid>
    );

}