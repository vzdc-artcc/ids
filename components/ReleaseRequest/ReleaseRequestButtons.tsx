'use client';
import React from 'react';
import {ReleaseRequestWithAll} from "@/components/ReleaseRequest/ReleaseRequestViewer";
import {Button, ButtonGroup, Stack} from "@mui/material";
import {deleteReleaseRequest, setReleaseTime} from "@/actions/release";
import {socket} from "@/lib/socket";
import {toast} from "react-toastify";

export default function ReleaseRequestButtons({ releaseRequest, onUpdate }: { releaseRequest: ReleaseRequestWithAll, onUpdate: () => void }) {

    const onDeleteReleaseRequest = async () => {
        const r = await deleteReleaseRequest(releaseRequest.id);

        if (r) {
            socket.emit('delete-release-request', r.id);
            onUpdate();
        }
    }

    const onInfo = () => {
        toast.info(`Requested by ${releaseRequest.initFacility} - ${releaseRequest.startedBy.firstName} ${releaseRequest.startedBy.lastName} (${releaseRequest.startedBy.cid})`)
    }

    const updateReleaseTime = async (time?: Date) => {
        const r = await setReleaseTime(releaseRequest.id, time);

        socket.emit('refresh-release', r);

        onUpdate();
    }

    return (
        <Stack direction="row" alignItems="center">
            <ButtonGroup variant="outlined" size="small">
                <Button color="success" onClick={() => updateReleaseTime()}>ANY</Button>
                <Button color="success" onClick={() => updateReleaseTime(new Date())}>NOW</Button>
                <Button color="success" onClick={() => updateReleaseTime(new Date((new Date()).getTime() + 1000*60*5))}>5M</Button>
                <Button color="warning" onClick={async () => {
                    const m = Number(prompt("Minutes from NOW"));
                    if (m > 0) {
                        await updateReleaseTime(new Date((new Date()).getTime() + 1000*60*m));
                    }
                }}>MINS</Button>
                <Button color="info" onClick={onInfo}>{releaseRequest.initFacility} - {releaseRequest.startedBy.cid.substring(5)}</Button>
                <Button color="error" onClick={onDeleteReleaseRequest}>DEL</Button>
            </ButtonGroup>
        </Stack>
    );
}