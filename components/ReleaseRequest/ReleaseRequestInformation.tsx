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

            toast.warning(`Release time for ${rr.callsign} updated.`);
        });

        socket.on('delete-release-request', () => {
            fetchReleaseRequestsFiltered(cid, facility).then(setReleaseRequests);

            toast.warning(`Some release requests were deleted. Please check the list.`)
        });

        return () => {
            socket.off('new-release-request');
            socket.off('release-time');
            socket.off('delete-release-request');
        }
    }, []);

    return (
        <Grid2 size={5} sx={{border: 1, overflowY: 'auto',}}>
            <Typography variant="h6">RELEASE</Typography>
            {releaseRequests?.map((releaseRequest) => (
                <Typography color={releaseRequest.releaseTime ? 'limegreen' : 'gold'}>{releaseRequest.callsign} -&gt; {releaseRequest.releaseTime ? `RELEASED AT ${formatZuluDate(releaseRequest.releaseTime, true)}` : '-/-'}</Typography>
            ))}
        </Grid2>
    );
}