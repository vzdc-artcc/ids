'use client'
import React, {useState, useEffect, useCallback} from 'react';
import {ReleaseRequestWithAll} from "@/components/ReleaseRequest/ReleaseRequestViewer";
import {socket} from "@/lib/socket";
import {fetchReleaseRequestsFiltered} from "@/actions/release";
import {Grid2, Typography} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import {toast} from "react-toastify";

type ReleaseRequestWithStatus = ReleaseRequestWithAll & {
    status: 'PENDING' | 'SOON' | 'ACTIVE' | 'EXPIRED';
    lowerDate?: Date;
    upperDate?: Date;
}

export default function ReleaseRequestInformation({ facility, cid }: { facility: string, cid: string }) {

    const [releaseRequests, setReleaseRequestsStates] = useState<ReleaseRequestWithStatus[]>();

    const setReleaseRequestsWithStatus = useCallback((releaseRequests: ReleaseRequestWithAll[]) => {
        setReleaseRequestsStates(releaseRequests.filter((rr) => {
            return !rr.releaseTime || new Date(rr.releaseTime.getTime() + 1000*60*10) > new Date();
        }).map((rr) => {

            const lowerDate = rr.releaseTime && new Date(rr.releaseTime.getTime() - 1000*60);
            const upperDate = rr.releaseTime && new Date(rr.releaseTime.getTime() + 1000*60*2);

            let status = 'PENDING';
            const now = new Date();

            if (rr.releaseTime && lowerDate && upperDate) {
                if (now.getTime() < lowerDate.getTime()) {
                    status = 'SOON'
                } else if (lowerDate.getTime() <= now.getTime() && now.getTime() <= upperDate.getTime()) {
                    status = 'ACTIVE'
                } else {
                    status = 'EXPIRED';
                }
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

            toast.info(`Release time for ${rr.callsign} updated to ${formatZuluDate(rr.releaseTime as Date, true)}.`, { autoClose: false, closeOnClick: true, theme: "colored", });
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

    return (
        <Grid2 size={5} sx={{border: 1, overflowY: 'auto',}}>
            <Typography variant="h6">RELEASE</Typography>
            {releaseRequests?.map((releaseRequest) => (
                <Typography key={releaseRequest.id}
                            color={getColor(releaseRequest.status)} sx={{ backgroundColor: releaseRequest.status === "ACTIVE" ? 'limegreen' : 'inherit'}}><b>{releaseRequest.callsign}</b> | {releaseRequest.releaseTime && releaseRequest.lowerDate && releaseRequest.upperDate ? `RELEASED ${formatZuluDate(releaseRequest.lowerDate, true)} - ${formatZuluDate(releaseRequest.upperDate, true).substring(5)}` : '-/-'}
                </Typography>
            ))}
        </Grid2>
    );
}

const getColor = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'gold';
        case 'SOON':
            return 'darkgreen';
        case 'ACTIVE':
            return 'white';
        case 'EXPIRED':
            return 'red';
    }
}