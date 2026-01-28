'use client';
import React, {useEffect, useState} from 'react';
import {Facility} from "@prisma/client";
import {Box, Grid2, Typography} from "@mui/material";
import {socket} from "@/lib/socket";
import {toast} from "react-toastify";

export default function NotamInformation({facility, initialNotams, radar,}: {
    facility: Facility,
    initialNotams: string[],
    radar?: boolean,
}) {

    const [notams, setNotams] = useState<string[]>(initialNotams);

    useEffect(() => {
        let isMounted = true;

        const handleNotamUpdate = (data: string[]) => {
            if (isMounted) {
                setNotams(data);
                toast.info(`${facility.id} NOTAMs have been updated.`);
            }
        };

        socket.on(`${facility.id}-notam`, handleNotamUpdate);

        return () => {
            isMounted = false;
            socket.off(`${facility.id}-notam`, handleNotamUpdate);
        };
    }, [facility]);

    return (
        <Grid2 size={radar ? 5 : 5} sx={{border: 1, overflowY: 'auto',}}>
            <Typography variant="h6">NOTAM</Typography>
            <Box height={250} sx={{overflow: 'auto',}}>
                {notams.map((notam, idx) => (
                    <Typography key={facility.id + idx + 'NOTAM'} color="gray">{notam}</Typography>
                ))}
            </Box>
        </Grid2>
    );
}