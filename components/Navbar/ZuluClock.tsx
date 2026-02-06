'use client';
import React, {useEffect, useState} from 'react';
import {Stack, Typography} from "@mui/material";
import Link from "next/link";

function ZuluTime() {
    const [time, setTime] = useState({
        minutes: 88,
        hours: 88,
        seconds: 88,
    });

    useEffect(() => {
        const intervalId = setInterval(() => {
            const date = new Date();
            setTime({
                minutes: date.getUTCMinutes(),
                hours: date.getUTCHours(),
                seconds: date.getUTCSeconds(),
            })
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const convertToTwoDigit = (number: number) => {
        return number.toLocaleString('en-US', {
            minimumIntegerDigits: 2
        });
    };


    return (
        <Link href="/" style={{textDecoration: 'none', color: 'inherit',}}>
            <Stack direction="row" justifyContent="center" sx={{color: 'red',}}>
                <Typography variant="h3" sx={{width: '4rem',}}
                            textAlign="center">{convertToTwoDigit(time.hours)}</Typography>
                <Typography variant="h3">:</Typography>
                <Typography variant="h3" sx={{width: '4rem',}}
                            textAlign="center">{convertToTwoDigit(time.minutes)}</Typography>
                <Typography variant="h3">:</Typography>
                <Typography variant="h3" sx={{width: '4rem',}}
                            textAlign="center">{convertToTwoDigit(time.seconds)}</Typography>
            </Stack>
        </Link>

    );
}

export default ZuluTime;