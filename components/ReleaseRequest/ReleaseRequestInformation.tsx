'use client'
import React, {useState, useEffect, useCallback} from 'react';
import {ReleaseRequestWithAll} from "@/components/ReleaseRequest/ReleaseRequestViewer";
import {socket} from "@/lib/socket";
import {deleteReleaseRequest, fetchReleaseRequestsFiltered} from "@/actions/release";
import {Grid2, IconButton, Tooltip, Typography} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import {toast} from "react-toastify";
import {RemoveCircleOutline} from "@mui/icons-material";
import {shouldKeepReleaseRequest} from "@/lib/releaseRequest";

type ReleaseRequestWithStatus = ReleaseRequestWithAll & {
    status: 'PENDING' | 'SOON' | 'ACTIVE' | 'EXPIRED';
    lowerDate?: Date;
    upperDate?: Date;
}

export default function ReleaseRequestInformation({ facility, cid }: { facility: string, cid: string }) {

    const [releaseRequests, setReleaseRequestsStates] = useState<ReleaseRequestWithStatus[]>();

    const setReleaseRequestsWithStatus = useCallback((releaseRequests: ReleaseRequestWithAll[]) => {
        setReleaseRequestsStates(releaseRequests.filter(shouldKeepReleaseRequest).map((rr) => {



            const lowerDate = rr.releaseTime && new Date(rr.releaseTime.getTime() - 1000*60);
            const upperDate = rr.releaseTime && new Date(rr.releaseTime.getTime() + 1000*60*2);

            let status = 'PENDING';
            const now = new Date();

            if (rr.released && rr.releaseTime && lowerDate && upperDate) {
                if ((rr.condition === 'window' && now.getTime() < lowerDate.getTime())
                    || (rr.condition === 'after' && now.getTime() < rr.releaseTime.getTime())) {
                    status = 'SOON'
                } else if (
                (rr.condition === 'window' && lowerDate.getTime() <= now.getTime() && now.getTime() <= upperDate.getTime())
                || (rr.condition === 'after' && now.getTime() >= rr.releaseTime.getTime())
                || (rr.condition === 'before' && now.getTime() <= rr.releaseTime.getTime())) {
                    status = 'ACTIVE'
                } else {
                    status = 'EXPIRED';
                }
            } else if (rr.released) {
                status = 'ACTIVE';
            }

            return {
                ...rr,
                status,
                lowerDate,
                upperDate,
            } as ReleaseRequestWithStatus;
        }))}, []);

    useEffect(() => {
        if (!releaseRequests) {
            fetchReleaseRequestsFiltered(cid, facility).then(setReleaseRequestsWithStatus);
        }
        socket.on('new-release-request', () => {
            fetchReleaseRequestsFiltered(cid, facility).then(setReleaseRequestsWithStatus);
        });

        socket.on('refresh-release', (rr) => {
            if (rr.startedBy.cid !== cid && rr.initFacility !== facility) return;

            fetchReleaseRequestsFiltered(cid, facility).then(setReleaseRequestsWithStatus);

            toast.info(`Release time for ${rr.callsign} updated to ${rr.releaseTime ? formatZuluDate(rr.releaseTime as Date, true) : 'ANY'}.`, { autoClose: 60 * 1000, closeOnClick: true, theme: "colored", });
            playNewReleaseTime().then();
        });

        socket.on('delete-release-request', () => {
            fetchReleaseRequestsFiltered(cid, facility).then(setReleaseRequestsWithStatus);
        });

        const intervalId = setInterval(() => {
            if (releaseRequests) {
                setReleaseRequestsWithStatus(releaseRequests)
            }
        }, 5*1000);

        return () => {
            clearInterval(intervalId);

            socket.off('new-release-request');
            socket.off('refresh-release');
            socket.off('delete-release-request');
        }
    }, [cid, facility, releaseRequests, setReleaseRequestsWithStatus]);

    const playNewReleaseTime = async () => {
        const audio = new Audio(`/sound/release_time_update.mp3`);
        await audio.play();
    }

    const clickDeleteReleaseRequest = async (id: string) => {
        const rr = await deleteReleaseRequest(id);

        if (!rr) return;

        socket.emit('delete-release-request', rr.id);
    }

    return (
        <Grid2 size={5} sx={{border: 1, overflowY: 'auto',}}>
            <Typography variant="h6">RELEASE</Typography>
            {releaseRequests?.sort((a, b) => {
                const statusOrder = {
                    'ACTIVE': 1,
                    'EXPIRED': 2,
                    'PENDING': 4,
                    'SOON': 3,
                };
                if (a.status === b.status) {
                    if (a.status === 'ACTIVE' && a.lowerDate && b.lowerDate) {
                        if (!a.upperDate) return 1;
                        if (!b.upperDate) return -1;
                        return a.lowerDate.getTime() - b.lowerDate.getTime();
                    }
                    if (a.status === 'EXPIRED' && a.upperDate && b.upperDate) {
                        return a.upperDate.getTime() - b.upperDate.getTime();
                    }
                    if ((a.status === 'PENDING' || a.status === 'SOON') && a.releaseTime && b.releaseTime) {
                        return a.releaseTime.getTime() - b.releaseTime.getTime();
                    }
                    return 0;
                }
                return statusOrder[a.status] - statusOrder[b.status];
            })
                .map((releaseRequest) => (
                <Typography key={releaseRequest.id}
                            color={getColor(releaseRequest.status)} sx={{ backgroundColor: releaseRequest.status === "ACTIVE" ? 'limegreen' : 'inherit'}}>
                    <Tooltip title="Delete release request">
                        <IconButton size="small" sx={{ p: 0, m: 0, mx: 1, }} onClick={() => clickDeleteReleaseRequest(releaseRequest.id)}>
                            <RemoveCircleOutline fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <b>{releaseRequest.callsign}</b> | {getReleaseTimeText(releaseRequest)}
                </Typography>
            ))}
        </Grid2>
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

    console.log(rr.condition);

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