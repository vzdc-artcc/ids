'use client';
import React, {useEffect} from 'react';
import {ReleaseRequest, User} from "@prisma/client";
import {Box, Button, Grid2, Typography} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import {socket} from "@/lib/socket";
import {deleteReleaseRequests, fetchReleaseRequest, fetchReleaseRequests} from "@/actions/release";
import ReleaseRequestButtons from "@/components/ReleaseRequest/ReleaseRequestButtons";
import {Delete} from "@mui/icons-material";

export type ReleaseRequestWithAll = ReleaseRequest & {
    startedBy: User,
}

export default function ReleaseRequestViewer() {

    const [releaseRequests, setReleaseRequests] = React.useState<ReleaseRequestWithAll[]>();

    useEffect(() => {
        if (!releaseRequests) {
            fetchReleaseRequests().then((r) => setReleaseRequests(r as ReleaseRequestWithAll[]));
        }

        socket.on('new-release-request', (requestId: string) => {
            fetchReleaseRequest(requestId).then((r) => {
                if (!r) return;

                setReleaseRequests((prev) => [...(prev || []), r as ReleaseRequestWithAll]);
            });
        });

        return () => {
            socket.off('new-release-request');
        }
    }, [releaseRequests]);

    const deleteAll = async (past: boolean) => {
        deleteReleaseRequests(past).then(() => {
            socket.emit('delete-release-request');

            window.location.reload();
        });
    }

    return (
        <>
            <Button variant="outlined" color="error" size="small" startIcon={<Delete />} sx={{ mb: 2, mr: 2, }} onClick={() => deleteAll(false)}>Delete All</Button>
            <Button variant="contained" color="warning" size="small" startIcon={<Delete />} sx={{ mb: 2, }} onClick={() => deleteAll(true)}>Delete Past Released -20M</Button>
            {releaseRequests?.map((releaseRequest) => (
                <Grid2 container columns={13} key={releaseRequest.id} spacing={3} alignItems="center" sx={{ borderTop: 1, minHeight: 50, mx: 2, }}>
                    <Grid2 size={1}>
                        <Typography fontWeight="bold" color="cyan">{releaseRequest.origin}</Typography>
                    </Grid2>
                    <Grid2 size={1}>
                        <Typography fontWeight="bold" color="gold">{releaseRequest.destination}</Typography>
                    </Grid2>
                    <Grid2 size={1}>
                        <Typography>{releaseRequest.callsign}</Typography>
                        { releaseRequest.releaseTime && <Typography variant="caption" color="limegreen">{formatZuluDate(releaseRequest.releaseTime, true)}</Typography> }
                    </Grid2>
                    <Grid2 size={1}>
                        <Typography>{formatZuluDate(releaseRequest.initTime, true)}</Typography>
                    </Grid2>
                    <Grid2 size={1}>
                        <Typography color="red">{releaseRequest.aircraftType}</Typography>
                    </Grid2>
                    <Grid2 size={4}>
                        <Box sx={{ overflow: 'auto' }}>
                            <Typography color="red">{releaseRequest.freeText}</Typography>
                        </Box>
                    </Grid2>
                    <Grid2 size={4}>
                        <ReleaseRequestButtons releaseRequest={releaseRequest} />
                    </Grid2>
                </Grid2>
            ))}
        </>
    );
}
