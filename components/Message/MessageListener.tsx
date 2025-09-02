'use client';
import React, {useEffect, useState} from 'react';
import {socket} from "@/lib/socket";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

export default function MessageListener({ facility, cid }: { facility: string, cid: string }) {

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string>();

    useEffect(() => {
        socket.on(`msg-${facility}`, (msg) => {
            setMessage(msg);
            setOpen(true);
        });
        socket.on(`msg-${cid}`, (msg) => {
            setMessage(msg);
            setOpen(true);
        })

        return () => {
            socket.off(`msg-${facility}`);
            socket.off(`msg-${cid}`);
        }
    }, []);
    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
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