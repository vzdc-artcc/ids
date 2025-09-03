'use client'
import React, {useState, useEffect} from 'react';
import {ReleaseRequestWithAll} from "@/components/ReleaseRequest/ReleaseRequestViewer";
import {socket} from "@/lib/socket";
import {fetchReleaseRequestsFiltered} from "@/actions/release";
import {Grid2, Typography} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import {toast} from "react-toastify";

export default function ReleaseRequestInformation({ facility, cid }: { facility: string, cid: string }) {

    const [releaseRequests, setReleaseRequests] = useState<ReleaseRequestWithAll[]>();

    useEffect(() => {
        if (!releaseRequests) {
            fetchReleaseRequestsFiltered(cid, facility).then(setReleaseRequests);
        }
        socket.on('new-release-request', () => {
            fetchReleaseRequestsFiltered(cid, facility).then(setReleaseRequests);
        });

        socket.on('release-time', (rr) => {
            fetchReleaseRequestsFiltered(cid, facility).then(setReleaseRequests);

            toast.warning(`Release time for ${rr.callsign} updated.`, { autoClose: 15*1000 });
            playNewReleaseTime().then();
        });

        socket.on('delete-release-request', () => {
            fetchReleaseRequestsFiltered(cid, facility).then(setReleaseRequests);

            toast.warning(`Some release requests were deleted. Please check the list.`, { autoClose: 10*1000 })
        });

        return () => {
            socket.off('new-release-request');
            socket.off('release-time');
            socket.off('delete-release-request');
        }
    }, [cid, facility, releaseRequests]);

    const playNewReleaseTime = async () => {
        const audio = new Audio(`/sound/release_time_update.mp3`);
        await audio.play();
    }

    return (
        <Grid2 size={5} sx={{border: 1, overflowY: 'auto',}}>
            <Typography variant="h6">RELEASE</Typography>
            {releaseRequests?.map((releaseRequest) => (
                <Typography key={releaseRequest.id} color={releaseRequest.releaseTime ? 'limegreen' : 'gold'}><b>{releaseRequest.callsign}</b> | {releaseRequest.releaseTime ? `RELEASED AT ${formatZuluDate(releaseRequest.releaseTime, true)}` : '-/-'}</Typography>
            ))}
        </Grid2>
    );
}