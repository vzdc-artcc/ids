'use client';
import React, {useEffect, useState} from 'react';
import {Box, Divider, Grid2, Typography} from "@mui/material";
import {fetchSuaRequests} from "@/actions/sua";
import {formatZuluDate} from "@/lib/date";

export default function SuaRequestInformation() {

    const [suaRequests, setSuaRequests] = useState<{
        id: string;
        start: Date;
        end: Date;
        afiliation: string;
        details: string;
        missionNumber: string;
        user: {
            cid: string;
        };
        airspace: {
            id: string;
            identifier: string;
            bottomAltitude: number;
            topAltitude: number;
        }[];
    }[]>();

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchSuaRequests().then(setSuaRequests);
        }, 60000);

        return () => {
            clearInterval(intervalId);
        };
    });

    const getSuaRequestStatus = (request: {
        start: Date;
        end: Date;
    }): { color: string, text: string, } => {
        const now = new Date();
        if (now < new Date(request.start)) {
            if (new Date(request.start).getTime() - now.getTime() <= 15 * 60 * 1000) {
                return {color: 'cyan', text: 'STARTING'};
            }
            return {color: 'gold', text: 'SCHEDULED'};
        } else if (now >= new Date(request.start) && now <= new Date(request.end)) {
            if (new Date(request.end).getTime() - now.getTime() <= 15 * 60 * 1000) {
                return {color: 'orange', text: 'ENDING'};
            }
            return {color: 'lightgreen', text: 'ACTIVE'};
        } else {
            return {color: 'white', text: 'EXPIRED'};
        }
    }

    return (
        <Grid2 size={5} sx={{border: 1, overflowY: 'auto',}}>
            <Typography variant="h6">SUA (1m)</Typography>
            <Box height={250} sx={{overflow: 'auto',}}>
                <Grid2 container columns={2} spacing={1}>
                    {suaRequests && suaRequests.map((request) => (
                        <Grid2 size={{xs: 2, lg: 1}} key={request.id} sx={{p: 0.5, border: 1, borderColor: 'red',}}>
                            <Typography variant="h6" fontSize={16}
                                        color={getSuaRequestStatus(request).color}>#{request.missionNumber} {getSuaRequestStatus(request).text}</Typography>
                            <Typography variant="body1">
                                {formatZuluDate(request.start)} - {formatZuluDate(request.end)}
                            </Typography>
                            {request.airspace.map((a) => (
                                <Typography variant="body2" key={a.id}>
                                    BLK <b>{a.identifier}</b>: | FL{a.bottomAltitude} - FL{a.topAltitude} |
                                </Typography>
                            ))}
                            <Divider color="white" style={{marginTop: 1,}}/>
                            <Typography variant="body2">- {request.details}</Typography>
                            <Divider color="white" style={{marginBottom: 1,}}/>
                            <Typography variant="caption">POC: {request.user.cid} | {request.afiliation}</Typography>
                        </Grid2>
                    ))}
                </Grid2>
            </Box>
        </Grid2>
    );
}