'use client';
import React, {useEffect, useState} from 'react';
import {Divider, Grid, Switch, Tooltip, Typography} from "@mui/material";
import {fetchSuaRequests} from "@/actions/sua";
import {socket} from "@/lib/socket";
import {formatZuluDate} from "@/lib/date";

export default function SuaRequestInformation({disabled}: { disabled?: boolean }) {

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
        let isMounted = true;

        const handleSuaActivate = (id: string) => {
            if (!isMounted) return;
            setActiveSua((prev) => [...prev, id]);
        };

        const handleSuaDeactivate = (id: string) => {
            if (!isMounted) return;
            setActiveSua((prev) => prev.filter((suaId) => suaId !== id));
        };

        socket.on("sua-activate", handleSuaActivate);
        socket.on("sua-deactivate", handleSuaDeactivate);

        return () => {
            isMounted = false;
            socket.off("sua-activate", handleSuaActivate);
            socket.off("sua-deactivate", handleSuaDeactivate);
        };
    }, []);

    useEffect(() => {
        if (disabled) return;

        let isMounted = true;

        fetchSuaRequests().then((data) => {
            if (isMounted) setSuaRequests(data);
        });

        const intervalId = setInterval(() => {
            fetchSuaRequests().then((data) => {
                if (isMounted) setSuaRequests(data);
            });
        }, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [disabled]);

    const toggleActiveSuaRequest = (id: string) => {
        if (activeSuas.includes(id)) {
            socket.emit("sua-deactivate", id);
            return;
        }
        socket.emit("sua-activate", id);
    }

    return (
        <Grid size={5} sx={{border: 1, height: 250, overflowY: 'auto',}}>
            <Typography variant="h6">SUA</Typography>
            {disabled && <Typography color="gray">DISABLED FOR TRAINING</Typography>}
            <Grid container columns={2} spacing={1}>
                {suaRequests && suaRequests.map((request) => (
                    <Grid size={{xs: 2, lg: 1}} key={request.id} sx={{p: 0.5, border: 1, borderColor: 'red',}}>
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
                    </Grid>
                ))}
            </Grid>
        </Grid>
    );
}