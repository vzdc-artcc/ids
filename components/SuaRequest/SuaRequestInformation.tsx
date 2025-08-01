'use client';
import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Divider, Grid2, Switch, Tooltip, Typography} from "@mui/material";
import {fetchSuaRequests} from "@/actions/sua";
import {socket} from "@/lib/socket";
import {formatZuluDate} from "@/lib/date";
import {toast} from "react-toastify";

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
    const [activeSuas, setActiveSua] = useState<string[]>([]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchSuaRequests().then(setSuaRequests);
        }, 5000);

        socket.on("sua-activate", (id: string) => {
            setActiveSua((prev) => [...prev, id]);
            toast.info('SUA requests updated.');
        });

        socket.on("sua-deactivate", (id: string) => {
            setActiveSua((prev) => prev.filter((suaId) => suaId !== id));
            toast.info('SUA requests updated.');
        });

        return () => {
            clearInterval(intervalId);

            socket.off("sua-activate");
            socket.off("sua-deactivate");
        };
    });

    const toggleActiveSuaRequest = (id: string) => {
        if (activeSuas.includes(id)) {
            socket.emit("sua-deactivate", id);
            return;
        }
        socket.emit("sua-activate", id);
    }

    return (
        <Grid2 size={5} sx={{border: 1, overflowY: 'auto',}}>
            <Typography variant="h6">SUA</Typography>
            <Box height={250} sx={{overflow: 'auto',}}>
                {!suaRequests && <CircularProgress/>}
                {!suaRequests && <Typography>Loading will take at least 1 minute.</Typography>}
                <Grid2 container columns={2} spacing={1}>
                    {suaRequests && suaRequests.map((request) => (
                        <Grid2 size={{xs: 2, lg: 1}} key={request.id} sx={{p: 0.5, border: 1, borderColor: 'red',}}>
                            <Typography variant="h6" fontSize={16}
                                        color={activeSuas.includes(request.id) ? 'lightgreen' : 'gold'}>#{request.missionNumber} {activeSuas.includes(request.id) ? 'ACTIVE' : (new Date(request.start) > new Date() ? 'SCHEDULED' : 'INACTIVE')}</Typography>
                            <Tooltip title="Toggle Active">
                                <Switch
                                    checked={activeSuas.includes(request.id)}
                                    onChange={() => toggleActiveSuaRequest(request.id)}
                                    size="small"
                                    color="info"
                                />
                            </Tooltip>
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