'use client';
import React from 'react';
import {ReleaseRequestWithAll} from "@/components/ReleaseRequest/ReleaseRequestViewer";
import {Button, ButtonGroup, Stack} from "@mui/material";
import {deleteReleaseRequest, removeReleaseTime, setReleaseTime} from "@/actions/release";
import {socket} from "@/lib/socket";
import {toast} from "react-toastify";
import {Delete} from "@mui/icons-material";

export default function ReleaseRequestButtons({releaseRequest}: { releaseRequest: ReleaseRequestWithAll }) {

    const onDeleteReleaseRequest = async () => {
        const r = await deleteReleaseRequest(releaseRequest.id);

        if (r) {
            socket.emit('delete-release-request', r.id);
        }
    }

    const onInfo = () => {
        toast.info(`Requested by ${releaseRequest.initFacility} - ${releaseRequest.startedBy.firstName} ${releaseRequest.startedBy.lastName} (${releaseRequest.startedBy.cid})`)
    }

    const updateReleaseTime = async (mode: 'window' | 'before' | 'after', time?: Date,) => {
        const r = await setReleaseTime(releaseRequest.id, mode, time);

        socket.emit('refresh-release', r);
    }

    const revokeReleaseTime = async () => {
        const r = await removeReleaseTime(releaseRequest.id);

        socket.emit('refresh-release', r);
    }

    return (
        <Stack direction="column" alignItems="flex-end">
            <ButtonGroup variant="outlined" size="small">
                <Button color="success" onClick={() => updateReleaseTime('window')} sx={{width: 50,}}>ANY</Button>
                <Button color="success" onClick={() => updateReleaseTime('window', new Date())}
                        sx={{width: 50,}}>NOW</Button>
                <Button color="success"
                        onClick={() => updateReleaseTime('window', new Date((new Date()).getTime() + 1000 * 60 * 5))}
                        sx={{width: 50,}}>N+5</Button>

                <Button color="info" onClick={onInfo} sx={{width: 50,}}>{releaseRequest.initFacility}</Button>
                <Button color="error" onClick={revokeReleaseTime} sx={{width: 50,}}>X</Button>
                <Button color="error" onClick={onDeleteReleaseRequest} sx={{width: 50,}}><Delete
                    fontSize="small"/></Button>
            </ButtonGroup>
            <ButtonGroup variant="outlined" size="small">
                <Button color="secondary" onClick={async () => {
                    const m = prompt("Enter ZULU time (Ex. 2300):");
                    if (m) {
                        // convert zulu tieme to date object
                        // if the time is before now, set it to tomorrow
                        const now = new Date();
                        const zuluHour = Number(m.slice(0, 2));
                        const zuluMinute = Number(m.slice(2, 4));
                        let zuluDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), zuluHour, zuluMinute, 0));
                        if (zuluDate.getTime() < now.getTime()) {
                            zuluDate = new Date(zuluDate.getTime() + 1000 * 60 * 60 * 24);
                        }
                        await updateReleaseTime('window', zuluDate);
                    }
                }} sx={{width: 50,}}>TIME</Button>
                <Button color="secondary" onClick={async () => {
                    const m = prompt("Release BEFORE ZULU time (Ex. 2300):");
                    if (m) {
                        const now = new Date();
                        const zuluHour = Number(m.slice(0, 2));
                        const zuluMinute = Number(m.slice(2, 4));
                        let zuluDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), zuluHour, zuluMinute, 0));
                        if (zuluDate.getTime() < now.getTime()) {
                            zuluDate = new Date(zuluDate.getTime() + 1000 * 60 * 60 * 24);
                        }
                        await updateReleaseTime('before', zuluDate);
                    }
                }} sx={{width: 50,}}>TB</Button>
                <Button color="secondary" onClick={async () => {
                    const m = prompt("Release AFTER ZULU time (Ex. 2300):");
                    if (m) {
                        const now = new Date();
                        const zuluHour = Number(m.slice(0, 2));
                        const zuluMinute = Number(m.slice(2, 4));
                        let zuluDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), zuluHour, zuluMinute, 0));
                        if (zuluDate.getTime() < now.getTime()) {
                            zuluDate = new Date(zuluDate.getTime() + 1000 * 60 * 60 * 24);
                        }
                        await updateReleaseTime('after', zuluDate);
                    }
                }} sx={{width: 50,}}>TA</Button>
                <Button color="warning" onClick={async () => {
                    const m = Number(prompt("Released X minutes from NOW:"));
                    if (m > 0) {
                        await updateReleaseTime('window', new Date((new Date()).getTime() + 1000*60*m));
                    }
                }} sx={{width: 50,}}>MINS</Button>
                <Button color="warning" onClick={async () => {
                    const m = Number(prompt("Released before X minutes from NOW:"));
                    if (m > 0) {
                        await updateReleaseTime('before', new Date((new Date()).getTime() + 1000*60*m));
                    }
                }} sx={{width: 50,}}>MB</Button>
                <Button color="warning" onClick={async () => {
                    const m = Number(prompt("Released after X minutes from NOW:"));
                    if (m > 0) {
                        await updateReleaseTime('after', new Date((new Date()).getTime() + 1000*60*m));
                    }
                }} sx={{width: 50,}}>MA</Button>
            </ButtonGroup>
        </Stack>
    );
}