'use client';
import React, {useEffect, useState} from 'react';
import {socket} from "@/lib/socket";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

export default function MessageListener({ facility, cid }: { facility: string, cid: string }) {

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string>();

    useEffect(() => {
        let isMounted = true;
        const currentEvents = [`msg-${facility}`, `msg-${cid}`, 'msg-*'];

        const handleMessage = (msg: string) => {
            if (!isMounted) return;
            setMessage(msg);
            setOpen(true);
            playNewMessage().then();
        };

        currentEvents.forEach(eventName => socket.on(eventName, handleMessage));

        return () => {
            isMounted = false;
            currentEvents.forEach(eventName => socket.off(eventName, handleMessage));
        };
    }, [cid, facility]);

    const playNewMessage = async () => {
        const audio = new Audio(`/sound/new_message.mp3`);
        await audio.play();
    }

    return (
        <Dialog open={open}>
            <DialogTitle>Message from TMU</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)} color="inherit">Close</Button>
            </DialogActions>
        </Dialog>
    );
}