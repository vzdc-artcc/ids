'use client';
import React, {useEffect, useState} from 'react';
import {CallsignData, getCallsign} from "@/actions/callsign";
import {Box, Divider, TextField, Typography} from "@mui/material";


export default function CallsignLookup() {

    const [callsign, setCallsign] = useState<string>('');
    const [result, setResult] = useState<CallsignData>();

    useEffect(() => {
        if (callsign) {
            getCallsign(callsign).then(setResult);
        }
    }, [callsign]);

    return (
        <Box sx={{mx: 1,}}>
            <Typography variant="h6" gutterBottom>Callsign Lookup</Typography>
            <TextField size="small" variant="filled" label="ICAO Code" fullWidth value={callsign}
                       onChange={(e) => setCallsign(e.target.value)}/>
            <Divider sx={{my: 1,}}/>
            {result &&
                <Typography><b>ICAO: </b>{callsign.toUpperCase()}<br/><span
                    style={{color: 'limegreen'}}><b>TELEPHONY: </b>&#34;{result.telephony}&#34;</span><br/><b>NAME: </b>{result.companyName}<br/><b>COUNTRY: </b>{result.country}<br/>{result.isVirtual ?
                    <span style={{color: 'red'}}><b>VIRTUAL AIRLINE</b></span> : <></>}</Typography>
            }
        </Box>
    );
}