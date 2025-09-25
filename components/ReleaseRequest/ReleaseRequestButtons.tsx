'use client';
import React from 'react';
import {ReleaseRequestWithAll} from "@/components/ReleaseRequest/ReleaseRequestViewer";
import {Button, ButtonGroup, Stack} from "@mui/material";
import {deleteReleaseRequest, setReleaseTime} from "@/actions/release";
import {socket} from "@/lib/socket";
import {toast} from "react-toastify";
import {DeleteForever} from "@mui/icons-material";

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

    const updateReleaseTime = async (mode: 'window' | 'before' | 'after', time?: Date,) => {
        const r = await setReleaseTime(releaseRequest.id, mode, time);

        socket.emit('refresh-release', r);

        onUpdate();
    }

    return (
        <Stack direction="row" alignItems="center">
            <ButtonGroup variant="outlined" size="small">
                <Button color="success" onClick={() => updateReleaseTime('window')}>ANY</Button>
                <Button color="success" onClick={() => updateReleaseTime('window', new Date())}>NOW</Button>
                <Button color="success" onClick={() => updateReleaseTime('window', new Date((new Date()).getTime() + 1000*60*5))}>5M</Button>
                <Button color="warning" onClick={async () => {
                    const m = Number(prompt("Released X minutes from NOW:"));
                    if (m > 0) {
                        await updateReleaseTime('window', new Date((new Date()).getTime() + 1000*60*m));
                    }
                }}>MINS</Button>
                <Button color="warning" onClick={async () => {
                    const m = Number(prompt("Released before X minutes from NOW:"));
                    if (m > 0) {
                        await updateReleaseTime('before', new Date((new Date()).getTime() + 1000*60*m));
                    }
                }}>MB</Button>
                <Button color="warning" onClick={async () => {
                    const m = Number(prompt("Released after X minutes from NOW:"));
                    if (m > 0) {
                        await updateReleaseTime('after', new Date((new Date()).getTime() + 1000*60*m));
                    }
                }}>MA</Button>
                <Button color="info" onClick={onInfo}>{releaseRequest.initFacility} - {releaseRequest.startedBy.cid.substring(4)}</Button>
                <Button color="error" onClick={onDeleteReleaseRequest}><DeleteForever fontSize="small" /></Button>
            </ButtonGroup>
        </Stack>
    );
}