'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {ReleaseRequest, User} from "@/generated/prisma/client";
import {Box, Button, Dialog, DialogContent, DialogTitle, Divider, Grid, Stack, Typography} from "@mui/material";
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
import {ReleaseRequestAircraftState} from "@/types";

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
                deleteReleaseRequest(rr.id).then().catch((error) => {
                    console.error('Error deleting release request:', error);
                });
            }

            return shouldKeep;
        })
    }, []);

    const refreshReleaseRequests = useCallback(async () => {
        try {
            const releaseRequests = await fetchReleaseRequests();
            setReleaseRequests(filterExpiredReleases(releaseRequests));
        } catch (error) {
            console.error('Error refreshing release requests:', error);
        }
    }, [filterExpiredReleases]);

    useEffect(() => {
        let isMounted = true;

        const handleNewReleaseRequest = (requestId: string) => {
            fetchReleaseRequest(requestId).then((r) => {
                if (! r || !isMounted) return;
                setReleaseRequests((prev) => [... (prev || []), r as ReleaseRequestWithAll]);
            }).catch((error) => {
                console.error('Error fetching release request:', error);
            });
        };

        const handleDeleteReleaseRequest = (requestId?:  string) => {
            if (! requestId || !isMounted) return;
            setReleaseRequests((prev) => prev?. filter((r) => r.id !== requestId));
        };

        const handleRefreshRelease = () => {
            fetchReleaseRequests().then((reqs) => {
                if (!isMounted) return;
                setReleaseRequests(reqs. filter(shouldKeepReleaseRequest));
            }).catch((error) => {
                console.error('Error fetching release requests:', error);
            });
        };

        const handleRefreshReleaseStatus = (r: any) => {
            refreshReleaseRequests().then(() => {
                if (isMounted) {
                    toast.info(`${r.callsign} release status updated.`);
                }
            }).catch((error) => {
                console.error('Error refreshing release requests:', error);
            });
        };

        socket.on('new-release-request', handleNewReleaseRequest);
        socket.on('delete-release-request', handleDeleteReleaseRequest);
        socket.on('refresh-release', handleRefreshRelease);
        socket.on('refresh-release-status', handleRefreshReleaseStatus);

        return () => {
            isMounted = false;
            socket.off('new-release-request', handleNewReleaseRequest);
            socket.off('delete-release-request', handleDeleteReleaseRequest);
            socket.off('refresh-release', handleRefreshRelease);
            socket.off('refresh-release-status', handleRefreshReleaseStatus);
        };
    }, [refreshReleaseRequests]);

    useEffect(() => {
        let isMounted = true;

        const loadInitialReleaseRequests = async () => {
            try {
                const requests = await fetchReleaseRequests();
                if (isMounted) {
                    setReleaseRequests(filterExpiredReleases(requests));
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error loading initial release requests:', error);
                }
            }
        };

        loadInitialReleaseRequests();

        return () => {
            isMounted = false;
        };
    }, [filterExpiredReleases]);

    useEffect(() => {
        let isMounted = true;

        const intervalId = setInterval(() => {
            if (!isMounted) return;

            setReleaseRequests((prev) => {
                if (! prev) return prev;
                return prev.filter((rr) => {
                    const shouldKeep = shouldKeepReleaseRequest(rr);
                    if (!shouldKeep) {
                        deleteReleaseRequest(rr.id).catch((error) => {
                            console.error('Error deleting expired release request:', error);
                        });
                    }
                    return shouldKeep;
                });
            });
        }, 1000 * 10);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const deleteAll = async (past: boolean) => {
        try {
            await deleteReleaseRequests(past);
            // socket.emit('delete-release-request');
            await refreshReleaseRequests();
        } catch (error) {
            console.error('Error deleting release requests:', error);
            toast.error('Failed to delete release requests');
        }
    }

    const requestGroupedByDestination = releaseRequests?. reduce((acc, curr) => {
        if (!acc[curr.destination]) {
            acc[curr. destination] = [];
        }
        acc[curr.destination].push(curr);
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
                        {requestGroupedByDestination && requestGroupedByDestination[dest].sort((a,b) => a.initTime.getTime() - b.initTime.getTime()).sort((a, b) => {
                            if (a.released && b.released) {
                                return (a.releaseTime || new Date()).getTime() - (b.releaseTime || new Date()).getTime();
                            } else if (a.released && !b.released) {
                                return -1;
                            } else if (!a.released && b.released) {
                                return 1;
                            } else {
                                const states = Object.values(ReleaseRequestAircraftState).filter((item) => {
                                    return isNaN(Number(item));
                                });
                                return states.indexOf(b.initState) - states.indexOf(a.initState);
                            }
                        }).map((releaseRequest) => (
                            <Box key={releaseRequest.id}>
                                <Divider />
                                <Grid container columns={16} spacing={3} alignItems="center" sx={{ minHeight: 50,  }}>
                                    <Grid size={1}>
                                        <Typography fontWeight="bold" color="cyan">{releaseRequest.origin}</Typography>
                                    </Grid>
                                    <Grid size={1}>
                                        <Typography>{releaseRequest.callsign}</Typography>
                                    </Grid>
                                    <Grid size={1}>
                                        <Typography>{formatZuluDate(releaseRequest.initTime, true)}</Typography>
                                    </Grid>
                                    <Grid size={2}>
                                        { releaseRequest.releaseTime && <Typography color="limegreen" fontWeight="bold">{getSingleLetterCondition(releaseRequest.condition)} {formatZuluDate(releaseRequest.releaseTime, true)}</Typography> }
                                        { releaseRequest.released && !releaseRequest.releaseTime && <Typography color="limegreen" fontWeight="bold">ANY</Typography> }
                                    </Grid>
                                    <Grid size={2}>
                                        <Box sx={{ overflow: 'auto' }}>
                                            <Typography color="red">{releaseRequest.aircraftType} | {releaseRequest.initState}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={1}>
                                        <Box sx={{ overflow: 'auto' }}>
                                            <Typography color="red">{releaseRequest.freeText}</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={8}>
                                        <ReleaseRequestButtons releaseRequest={releaseRequest}/>
                                    </Grid>
                                </Grid>
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
