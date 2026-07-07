'use client';
import React, {useEffect, useState} from 'react';
import {Button} from "@mui/material";
import {toggleCltLandingDirection} from "@/actions/custom";
import {toast} from "react-toastify";
import {socket} from "@/lib/socket";

export default function CharlotteLandingDirection() {

    const [loading, setLoading] = useState(false);

    const handleClick = () => {
        setLoading(true);
        toggleCltLandingDirection().then((res) => {
            if (res === 'ERR') {
                toast.error("An error occurred changing CLT landing direction.");
                return;
            }

            socket.emit(`KCLT-flow`, [res.newOpsRunway]);
        }).finally(() => {
            setLoading(false);
        })
    }

    return (
        <Button variant="outlined" size="small" color="info" loading={loading} sx={{ ml: 1, fontWeight: 'bold', fontSize: '0.7rem', }} onClick={handleClick}>
            <span style={{ fontSize: '1rem', }}>CLT</span>&nbsp;LDG DIR
        </Button>
    );
}