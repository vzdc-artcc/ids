'use client';
import {socket} from "@/lib/socket";
import {Box, Typography} from "@mui/material";
import React, {useEffect, useState} from 'react';

function RealtimeStatus() {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    return (
        <Box sx={{ml: 4, p: 0.5, border: 1,}}>
            <Typography color={isConnected ? 'limegreen' : 'red'}
                        sx={{textDecoration: !isConnected ? 'line-through' : 'none',}}>IDS REALTIME DATA</Typography>
        </Box>
    );
}

export default RealtimeStatus;