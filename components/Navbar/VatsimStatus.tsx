'use client';
import React, {useEffect, useState} from 'react';
import {socket} from "@/lib/socket";
import {Box, Typography} from "@mui/material";

export default function VatsimStatus() {

    const [updateTime, setUpdateTime] = useState<Date>();
    const [diffSeconds, setDiffSeconds] = useState<number>();

    useEffect(() => {
        socket.on('vatsim-data', (data: { general: { update_timestamp: Date } }) => {
            console.log(data);
            setUpdateTime(data.general.update_timestamp);
        });

        return () => {
            socket.off('vatsim-data');
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!updateTime) {
                setDiffSeconds(undefined);
                return;
            }

            setDiffSeconds(Math.floor((new Date().getTime() - new Date(updateTime).getTime()) / 1000));
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, [updateTime]);

    return (
        <Box sx={{ml: 4, p: 0.5, border: 1,}}>
            <Typography
                color={!updateTime || !diffSeconds || diffSeconds > 120 ? 'red' : diffSeconds > 60 ? 'orange' : 'limegreen'}
                sx={{textDecoration: !updateTime ? 'line-through' : 'none',}}>VATSIM DATA
                AGE: {diffSeconds ? `${diffSeconds}s` : 'XXs'}</Typography>
        </Box>
    );
}