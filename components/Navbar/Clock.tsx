'use client';
import React, {useEffect, useState} from 'react';
import {Box, Stack, Typography} from "@mui/material";
import Link from "next/link";

type TimeParts = {
    hours: number;
    minutes: number;
    seconds: number;
};

const ZONE_OFFSETS = [
    {label: 'UTC', name: '', timeZone: 'UTC'},
    {label: 'ET', name: 'EASTERN', timeZone: 'America/New_York'},
    // {label: 'CT', name: 'CT', timeZone: 'America/Chicago'},
    // {label: 'MT', name: 'MT', timeZone: 'America/Denver'},
    // {label: 'PT', name: 'PT', timeZone: 'America/Los_Angeles'},
];

const getZoneTime = (date: Date, timeZone: string): TimeParts => {
    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone,
    });

    const parts = formatter.formatToParts(date);
    const readPart = (type: 'hour' | 'minute' | 'second') => {
        const value = parts.find((part) => part.type === type)?.value ?? '00';
        return Number(value);
    };

    return {
        hours: readPart('hour'),
        minutes: readPart('minute'),
        seconds: readPart('second'),
    };
};

const buildZoneTimes = (date: Date) => {
    return ZONE_OFFSETS.reduce((acc, zone) => {
        acc[zone.label] = getZoneTime(date, zone.timeZone);
        return acc;
    }, {} as Record<string, TimeParts>);
};

function Clock() {
    const [zoneTimes, setZoneTimes] = useState<Record<string, TimeParts>>(() => buildZoneTimes(new Date()));

    useEffect(() => {
        const updateTimes = () => {
            setZoneTimes(buildZoneTimes(new Date()));
        };

        updateTimes();

        const intervalId = setInterval(() => {
            updateTimes();
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
            <Stack direction="row" spacing={2} alignItems="center" sx={{flexWrap: 'wrap'}}>
                {ZONE_OFFSETS.map((zone, index) => {
                    const time = zoneTimes[zone.label];

                    return (
                        <Stack key={zone.label} direction="column" alignItems="center" sx={{color: index === 0 ? 'red' : index === 1 ? 'orange' : 'inherit'}}>
                            <Typography variant="caption" sx={{fontWeight: 700, lineHeight: 1}}>
                                {zone.name}
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                <Typography variant={index === 0 ? 'h5' : 'body1'} sx={{width: index === 0 ? '2rem' : '1.5rem'}} textAlign="center">
                                    {convertToTwoDigit(time.hours)}
                                </Typography>
                                <Typography variant={index === 0 ? 'h5' : 'body1'}>:</Typography>
                                <Typography variant={index === 0 ? 'h5' : 'body1'} sx={{width: index === 0 ? '2rem' : '1.5rem'}} textAlign="center">
                                    {convertToTwoDigit(time.minutes)}
                                </Typography>
                                {index === 0 && <Typography variant="h5" sx={{width: '2rem', }} textAlign="center">
                                    :{convertToTwoDigit(time.seconds)}
                                </Typography> }
                            </Box>
                        </Stack>
                    );
                })}
            </Stack>

        </Link>

    );
}

export default Clock;