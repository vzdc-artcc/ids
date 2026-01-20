'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {ReleaseRequest, User} from "@prisma/client";
import {Box, Button, Dialog, DialogContent, DialogTitle, Divider, Grid2, Stack, Typography} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import {socket} from "@/lib/socket";
import {
    deleteReleaseRequest,
    deleteReleaseRequests,
    fetchReleaseRequest,
    fetchReleaseRequests
} from "@/actions/release";
import ReleaseRequestButtons from "@/components/ReleaseRequest/ReleaseRequestButtons";
import {Delete} from "@mui/icons-material";
import {shouldKeepReleaseRequest} from "@/lib/releaseRequest";
import MessageForm from "@/components/ReleaseRequest/MessageForm";
import ReleaseWindow from "@/components/Viewer/ReleaseWindow";
import {toast} from "react-toastify";

export type ReleaseRequestWithAll = ReleaseRequest & {
    startedBy: User,
}

export default function ReleaseRequestViewer() {

    const [releaseRequests, setReleaseRequests] = useState<ReleaseRequestWithAll[]>();
    const [openMessageDialog, setOpenMessageDialog] = useState(false);
    const [openDRRDialog, setOpenDRRDialog] = useState(false);

    const filterExpiredReleases = useCallback((reqs: ReleaseRequestWithAll[]) => {
        return reqs.filter((rr) => {
            const shouldKeep = shouldKeepReleaseRequest(rr);

            if (! shouldKeep) {
                deleteReleaseRequest(rr.id).then();
            }

            return shouldKeep;
        })
    }, []);

    const refreshReleaseRequests = useCallback(async () => {
        const releaseRequests = await fetchReleaseRequests();
        setReleaseRequests(filterExpiredReleases(releaseRequests));
    }, [filterExpiredReleases]);

    useEffect(() => {
        socket.on('new-release-request', (requestId: string) => {
            fetchReleaseRequest(requestId).then((r) => {
                if (! r) return;
                setReleaseRequests((prev) => [... (prev || []), r as ReleaseRequestWithAll]);
            });
        });

        socket.on('delete-release-request', (requestId?:  string) => {
            if (! requestId) return;
            setReleaseRequests((prev) => prev?. filter((r) => r.id !== requestId));
        });

        socket.on('refresh-release', () => {
            fetchReleaseRequests().then((reqs) => {
                setReleaseRequests(reqs. filter(shouldKeepReleaseRequest));
            });
        });

        socket.on('refresh-release-status', (r) => {
            refreshReleaseRequests().then(() => {
                toast.info(`${r.callsign} release status updated.`);
            });
        });

        return () => {
            socket.off('refresh-release');
            socket.off('delete-release-request');
            socket.off('new-release-request');
            socket.off('refresh-release-status');
        };
    }, []);

    useEffect(() => {
        refreshReleaseRequests().then();
    }, [refreshReleaseRequests]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setReleaseRequests((prev) => {
                if (! prev) return prev;
                return prev.filter((rr) => {
                    const shouldKeep = shouldKeepReleaseRequest(rr);
                    if (!shouldKeep) {
                        deleteReleaseRequest(rr.id).then();
                    }
                    return shouldKeep;
                });
            });
        }, 1000 * 10);

        return () => clearInterval(intervalId);
    }, []);

    const deleteAll = async (past: boolean) => {
        deleteReleaseRequests(past).then(() => {
            socket.emit('delete-release-request');
            refreshReleaseRequests();
        });
    }

    const requestGroupedByDestination = releaseRequests?. reduce((acc, curr) => {
        if (!acc[curr.destination]) {
            acc[curr. destination] = [];
        }
        acc[curr.destination]. push(curr);
        return acc;
    }, {} as { [key: string]:  ReleaseRequestWithAll[] });

    return (
        <>
            <Stack direction="row" spacing={2} sx={{ mb: 2, }}>
                <Button variant="outlined" color="error" size="small" startIcon={<Delete />} onClick={() => deleteAll(false)}>Delete All</Button>
                <Button variant="outlined" color="warning" size="small" startIcon={<Delete />} onClick={() => deleteAll(true)}>Delete Past Released -20M</Button>
                <Button variant="contained" color="info" size="small" onClick={() => setOpenMessageDialog(true)}>MSG</Button>
                <Button variant="contained" color="secondary" size="small" onClick={() => setOpenDRRDialog(true)}>DRR</Button>
            </Stack>
            {releaseRequests && releaseRequests.length === 0 &&
                <Typography gutterBottom>No release requests.</Typography>
            }
            {Object.keys(requestGroupedByDestination || {}).sort((a, b) => a.localeCompare(b)).map((dest) => (
                <Box key={dest} sx={{ m: 1, }}>
                    <Typography variant="h5" color="gold" fontWeight="bold" sx={{ border: 1, p: 0.5, px: 1, display: 'inline-block', }}>{dest}</Typography>
                    { requestGroupedByDestination && <Typography color="gold" sx={{ border: 1, p: 0.5, px: 1, display: 'inline-block', }}>{requestGroupedByDestination[dest].length} TOTAL / {(requestGroupedByDestination[dest]).filter((rr) => rr.released).length} REL</Typography> }
                    { requestGroupedByDestination && requestGroupedByDestination[dest].length > requestGroupedByDestination[dest].filter((rr) => rr.released).length && <Typography color="red" sx={{ border: 1, p: 0.5, px: 1, display: 'inline-block', }}>PENDING</Typography> }
                    <Box sx={{ border: 1, borderColor: 'gold', px: 1, height: 300, overflow: 'auto', }}>
                        {requestGroupedByDestination && requestGroupedByDestination[dest].sort((a, b) => {
                            // sort by if there is a release time, then put them first ASC.  If not then sort by init time ASC
                            if (a.releaseTime && b.releaseTime) {
                                return a.releaseTime.getTime() - b.releaseTime.getTime();
                            }
                            if (a.releaseTime && !b.releaseTime) {
                                return -1;
                            }
                            if (!a.releaseTime && b.releaseTime) {
                                return 1;
                            }
                            return a.initTime.getTime() - b.initTime.getTime();
                        }).map((releaseRequest) => (
                            <Box key={releaseRequest.id}>
                                <Divider />
                                <Grid2 container columns={16} spacing={3} alignItems="center" sx={{ minHeight: 50,  }}>
                                    <Grid2 size={1}>
                                        <Typography fontWeight="bold" color="cyan">{releaseRequest.origin}</Typography>
                                    </Grid2>
                                    <Grid2 size={1}>
                                        <Typography>{releaseRequest.callsign}</Typography>
                                    </Grid2>
                                    <Grid2 size={1}>
                                        <Typography>{formatZuluDate(releaseRequest.initTime, true)}</Typography>
                                    </Grid2>
                                    <Grid2 size={2}>
                                        { releaseRequest.releaseTime && <Typography color="limegreen" fontWeight="bold">{getSingleLetterCondition(releaseRequest.condition)} {formatZuluDate(releaseRequest.releaseTime, true)}</Typography> }
                                        { releaseRequest.released && !releaseRequest.releaseTime && <Typography color="limegreen" fontWeight="bold">ANY</Typography> }
                                    </Grid2>
                                    <Grid2 size={2}>
                                        <Box sx={{ overflow: 'auto' }}>
                                            <Typography color="red">{releaseRequest.aircraftType} | {releaseRequest.initState}</Typography>
                                        </Box>
                                    </Grid2>
                                    <Grid2 size={1}>
                                        <Box sx={{ overflow: 'auto' }}>
                                            <Typography color="red">{releaseRequest.freeText}</Typography>
                                        </Box>
                                    </Grid2>
                                    <Grid2 size={8}>
                                        <ReleaseRequestButtons releaseRequest={releaseRequest}/>
                                    </Grid2>
                                </Grid2>
                            </Box>

                        ))}
                    </Box>
                </Box>
            ))}
            <Dialog open={openMessageDialog} onClose={() => setOpenMessageDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Send Message</DialogTitle>
                <DialogContent>
                    <MessageForm onSubmit={() => setOpenMessageDialog(false)} />
                </DialogContent>
            </Dialog>
            <Dialog open={openDRRDialog} onClose={() => setOpenDRRDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>Manually Filed Release Form</DialogTitle>
                <DialogContent>
                    <ReleaseWindow facilityId="" onSubmit={() => setOpenDRRDialog(false)} />
                </DialogContent>
            </Dialog>
        </>
    );
}

const getSingleLetterCondition = (condition?: string | null) => {
    switch (condition) {
        case 'window':
            return '';
        case 'before':
            return 'B';
        case 'after':
            return 'A';
        default:
            return '';
    }
}
