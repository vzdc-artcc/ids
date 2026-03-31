'use client';
import React, {useEffect, useState} from 'react';
import {Box, Stack, Typography} from "@mui/material";

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
            <Stack direction="row" flexWrap="wrap" justifyContent="center"
                   sx={{width: '100%', boxSizing: 'border-box'}}>
                <Box sx={{p: 1, boxSizing: 'border-box', flex: '1 1 300px', minWidth: 0, maxWidth: 600}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img key={`ne-${cacheBuster}`} style={{
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                        boxSizing: 'border-box'
                    }} src={`https://radar.weather.gov/ridge/standard/NORTHEAST_loop.gif?t=${cacheBuster}`}
                         alt="Northeast radar"/>
                </Box>

                <Box sx={{p: 1, boxSizing: 'border-box', flex: '1 1 300px', minWidth: 0, maxWidth: 600}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img key={`se-${cacheBuster}`} style={{
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                        boxSizing: 'border-box'
                    }} src={`https://radar.weather.gov/ridge/standard/SOUTHEAST_loop.gif?t=${cacheBuster}`}
                         alt="Southeast radar"/>
                </Box>

                <Box sx={{p: 1, boxSizing: 'border-box', flex: '1 1 600px', minWidth: 0, maxWidth: 900}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img key={`conus-${cacheBuster}`} style={{
                        width: '100%',
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                        boxSizing: 'border-box'
                    }} src={`https://radar.weather.gov/ridge/standard/CONUS_loop.gif?t=${cacheBuster}`}
                         alt="CONUS radar"/>
                </Box>
            </Stack>
        </>

    );
}