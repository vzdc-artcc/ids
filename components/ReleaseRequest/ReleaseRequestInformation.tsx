'use client'
import React, {useCallback, useEffect, useState} from 'react';
import {ReleaseRequestWithAll as ReleaseRequestWithAllBasic} from "@/components/ReleaseRequest/ReleaseRequestViewer";
import {socket} from "@/lib/socket";
import {deleteReleaseRequest, fetchReleaseRequestsFiltered, notifyNewReleaseStatus} from "@/actions/release";
import {
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel, MenuItem, Select, TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import {toast} from "react-toastify";
import {RemoveCircleOutline} from "@mui/icons-material";
import {shouldKeepReleaseRequest} from "@/lib/releaseRequest";
import Form from "next/form";
import {ReleaseRequestAircraftState} from "@/types";

type ReleaseRequestWithAll = ReleaseRequestWithAllBasic & {
    queuePosition: number;
}

type ReleaseRequestWithStatus = ReleaseRequestWithAll & {
    status: 'PENDING' | 'SOON' | 'ACTIVE' | 'EXPIRED';
    lowerDate?: Date;
    upperDate?: Date;
}

const calculateStatus = (rr: ReleaseRequestWithAll): ReleaseRequestWithStatus => {
    const lowerDate = rr.releaseTime ? new Date(rr.releaseTime.getTime() - 1000 * 60) : undefined;
    const upperDate = rr.releaseTime ? new Date(rr.releaseTime.getTime() + 1000 * 60 * 2) : undefined;

    let status: 'PENDING' | 'SOON' | 'ACTIVE' | 'EXPIRED' = 'PENDING';
    const now = new Date();

    if (rr.released && rr.releaseTime && lowerDate && upperDate) {
        if ((rr.condition === 'window' && now.getTime() < lowerDate.getTime())
            || (rr.condition === 'after' && now.getTime() < rr.releaseTime.getTime())) {
            status = 'SOON';
        } else if (
            (rr.condition === 'window' && lowerDate.getTime() <= now.getTime() && now.getTime() <= upperDate.getTime())
            || (rr.condition === 'after' && now.getTime() >= rr.releaseTime.getTime())
            || (rr.condition === 'before' && now.getTime() <= rr.releaseTime.getTime())) {
            status = 'ACTIVE';
        } else {
            status = 'EXPIRED';
        }
    } else if (rr.released) {
        status = 'ACTIVE';
    }

    return { ...rr, status, lowerDate, upperDate };
};

export default function ReleaseRequestInformation({ facility, cid }: { facility: string, cid: string }) {

    const [releaseRequests, setReleaseRequestsStates] = useState<ReleaseRequestWithStatus[]>();
    const [updateReleaseRequest, setUpdateReleaseRequest] = useState<ReleaseRequestWithStatus>();

    const setReleaseRequestsWithStatus = useCallback((releaseRequests: ReleaseRequestWithAll[]) => {
        setReleaseRequestsStates(
            releaseRequests.filter(shouldKeepReleaseRequest).map(calculateStatus)
        );
    }, []);

    const playNewReleaseTime = async () => {
        const audio = new Audio(`/sound/release_time_update.mp3`);
        await audio.play();
    }

    useEffect(() => {
        let isMounted = true;

        const handleNewRelease = () => {
            if (!isMounted) return;
            fetchReleaseRequestsFiltered(cid, facility).then((data) => {
                if (isMounted) setReleaseRequestsWithStatus(data);
            });
        };

        const handleRefreshReleaseWithNotification = (rr: ReleaseRequestWithStatus) => {
            if (!isMounted) return;
            if (rr.startedBy.cid !== cid && rr.initFacility !== facility) return;

            fetchReleaseRequestsFiltered(cid, facility).then((data) => {
                if (isMounted) setReleaseRequestsWithStatus(data);
            });

            toast.info(`Release time for ${rr.callsign} updated to ${rr.released ? (rr.releaseTime ?  formatZuluDate(rr.releaseTime as Date, true) : 'ANY') : 'NONE'}. `, {
                autoClose: 60 * 1000,
                closeOnClick: true,
                theme: "colored",
            });
            playNewReleaseTime().then();
        };

        const handleRefreshReleaseStatusOnly = (rr: ReleaseRequestWithStatus) => {
            if (!isMounted) return;
            if (rr.startedBy.cid !== cid && rr.initFacility !== facility) return;

            fetchReleaseRequestsFiltered(cid, facility).then((data) => {
                if (isMounted) setReleaseRequestsWithStatus(data);
            });
        };

        const handleDeleteRelease = () => {
            if (!isMounted) return;
            fetchReleaseRequestsFiltered(cid, facility).then((data) => {
                if (isMounted) setReleaseRequestsWithStatus(data);
            });
        };

        socket.on('new-release-request', handleNewRelease);
        socket.on('refresh-release', handleRefreshReleaseWithNotification);
        socket.on('refresh-release-status', handleRefreshReleaseStatusOnly);
        socket.on('delete-release-request', handleDeleteRelease);

        return () => {
            isMounted = false;
            socket.off('new-release-request', handleNewRelease);
            socket.off('refresh-release', handleRefreshReleaseWithNotification);
            socket.off('refresh-release-status', handleRefreshReleaseStatusOnly);
            socket.off('delete-release-request', handleDeleteRelease);
        };
    }, [cid, facility, setReleaseRequestsWithStatus]);

    useEffect(() => {
        let isMounted = true;
        fetchReleaseRequestsFiltered(cid, facility).then((data) => {
            if (isMounted) setReleaseRequestsWithStatus(data);
        });
        return () => {
            isMounted = false;
        };
    }, [cid, facility, setReleaseRequestsWithStatus]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setReleaseRequestsStates((prev) => {
                if (!prev) return prev;
                // Re-calculate statuses based on current time
                return prev.filter(shouldKeepReleaseRequest).map(calculateStatus);
            });
        }, 5 * 1000);

        return () => clearInterval(intervalId);
    }, []);


    const clickDeleteReleaseRequest = async (id: string) => {
        const rr = await deleteReleaseRequest(id);
        if (! rr) return;
        socket.emit('delete-release-request', rr.id);
    }

    return (
        <>
            <Grid size={5} sx={{border: 1, height: 250, overflowY: 'auto',}}>
                <Typography variant="h6">RELEASE</Typography>
                {releaseRequests?.sort((a, b) => a.initTime.getTime() - b.initTime.getTime()).sort((a, b) => {
                    const statusOrder = {
                        'ACTIVE': 2,
                        'EXPIRED': 1,
                        'PENDING': 4,
                        'SOON': 3,
                    };
                    if (a.status === b.status) {
                        if (a.status === 'ACTIVE' && a.lowerDate && b.lowerDate) {
                            if (!a.upperDate) return 1;
                            if (!b.upperDate) return -1;
                            return a.lowerDate.getTime() - b.lowerDate.getTime();
                        } else if (a.status === 'ACTIVE') {
                            if (!a.lowerDate && !b.lowerDate) return 0;
                            if (!a.lowerDate) return 1;
                            if (!b.lowerDate) return -1;
                            return a.lowerDate.getTime() - b.lowerDate.getTime();
                        }

                        if (a.status === 'EXPIRED' && a.upperDate && b.upperDate) {
                            return a.upperDate.getTime() - b.upperDate.getTime();
                        }
                        if (a.status === 'PENDING' || a.status === 'SOON') {
                            const states = Object.values(ReleaseRequestAircraftState).filter((item) => {
                                return isNaN(Number(item));
                            });
                            return states.indexOf(b.initState) - states.indexOf(a.initState);
                        }
                        return 0;
                    }
                    return statusOrder[a.status] - statusOrder[b.status];
                })
                    .map((releaseRequest) => (
                        <Typography key={releaseRequest.id}
                                    style={{ cursor: 'pointer', }}
                                    color={getColor(releaseRequest.status)} sx={{ backgroundColor: releaseRequest.status === "ACTIVE" ? 'limegreen' : 'inherit'}}>
                            <Tooltip title="Delete release request">
                                <IconButton size="small" sx={{ p: 0, m: 0, mx: 1, }} onClick={() => clickDeleteReleaseRequest(releaseRequest.id)}>
                                    <RemoveCircleOutline fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <span onClick={() => setUpdateReleaseRequest(releaseRequest)}><b>{releaseRequest.callsign}</b> | <i style={{ color: releaseRequest.freeText ? 'red' : 'inherit', }}>{releaseRequest.initState}&nbsp;</i> {!releaseRequest.released && releaseRequest.queuePosition >= 0 && `(${releaseRequest.destination}-${releaseRequest.queuePosition + 1})`} | {getReleaseTimeText(releaseRequest)}{releaseRequest.initFacility !== facility ? ` | ${releaseRequest.initFacility}` : ''}</span>
                        </Typography>
                    ))}
            </Grid>
            <Dialog open={!!updateReleaseRequest} onClose={() => setUpdateReleaseRequest(undefined)} maxWidth="sm" fullWidth>
                {updateReleaseRequest &&
                    <>
                        <DialogTitle>NEW STATUS - {updateReleaseRequest.callsign}</DialogTitle>
                        <Form action={(data: FormData) => {
                            notifyNewReleaseStatus(updateReleaseRequest.id || '', data.get('status') as string, data.get('freeText') as string).then((r) => {
                                socket.emit('refresh-release-status', r);
                                setUpdateReleaseRequest(undefined);
                                toast.success("New status notified.");
                            });
                        }}>
                            <DialogContent>
                                <FormControl variant="filled" fullWidth>
                                    <InputLabel id="status-label">Status</InputLabel>
                                    <Select
                                        labelId="status-label"
                                        name="status"
                                        defaultValue={updateReleaseRequest.initState}
                                        required
                                    >
                                        {Object.values(ReleaseRequestAircraftState).filter((item) => {
                                            return isNaN(Number(item));
                                        }).map((state) => (
                                            <MenuItem key={state} value={state}>{state}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <TextField
                                    variant="filled"
                                    label="Free Text or NON-STANDARD departure runway (optional)"
                                    helperText="Use only if there will be an impact to release time."
                                    name="freeText"
                                    defaultValue={updateReleaseRequest.freeText || ''}
                                    fullWidth
                                    sx={{ mt: 2, }}
                                    />
                                <DialogActions>
                                    <Button color="inherit" size="small" onClick={() => setUpdateReleaseRequest(undefined)}>Cancel</Button>
                                    <Button variant="contained" size="small" type="submit">Update</Button>
                                </DialogActions>
                            </DialogContent>
                        </Form>
                    </> }
            </Dialog>
        </>

    );
}

const getColor = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'silver';
        case 'SOON':
            return 'gold';
        case 'ACTIVE':
            return 'white';
        case 'EXPIRED':
            return 'red';
    }
}

const getReleaseTimeText = (rr: ReleaseRequestWithStatus): string => {
    if (!rr.released) {
        return '-/-';
    }

    switch (rr.condition) {
        case 'window':
            if (!rr.releaseTime) {
                return 'ANY';
            } else if (rr.releaseTime && rr.lowerDate && rr.upperDate) {
                return `${formatZuluDate(rr.lowerDate, true)} - ${formatZuluDate(rr.upperDate, true).substring(2)}`;
            }
            return 'ERR';
        case 'before':
            if (rr.releaseTime) {
                return `AIRBORNE BEFORE ${formatZuluDate(rr.releaseTime, true)}`;
            }
            return 'ERR';
        case 'after':
            if (rr.releaseTime) {
                return `AIRBORNE AFTER ${formatZuluDate(rr.releaseTime, true)}`;
            }
            return 'ERR';
        default:
            return 'ERR';
    }
}