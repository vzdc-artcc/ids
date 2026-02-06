'use client';
import React, {useEffect, useState} from 'react';
import {Stack, Typography} from "@mui/material";

export default function Weather() {
    const [cacheBuster, setCacheBuster] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setCacheBuster(Date.now());
        }, 60000); // Refresh images every 60 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Typography textAlign="center" variant="subtitle2">Page might need to be refreshed for up to date data.
                Check the footer of each feed to confirm that it is current.</Typography>
            <Stack direction="row" flexWrap="wrap" justifyContent="center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={`ne-${cacheBuster}`} style={{padding: '1rem', width: 600, height: 600}} src={`https://radar.weather.gov/ridge/standard/NORTHEAST_loop.gif?t=${cacheBuster}`}
                       alt="Radar"/>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={`se-${cacheBuster}`} style={{padding: '1rem', width: 600, height: 600}} src={`https://radar.weather.gov/ridge/standard/SOUTHEAST_loop.gif?t=${cacheBuster}`}
                       alt="Radar"/>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={`conus-${cacheBuster}`} style={{padding: '1rem', width: 900, height: 600}} src={`https://radar.weather.gov/ridge/standard/CONUS_loop.gif?t=${cacheBuster}`}
                       alt="Radar"/>
            </Stack>
        </>

    );
}