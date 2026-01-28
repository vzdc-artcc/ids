'use client';
import React, {useEffect, useState} from 'react';
import {Box, Grid2, Tooltip, Typography} from "@mui/material";
import {getColor} from "@/lib/facilityColor";
import {Airport} from "@prisma/client";
import {socket} from "@/lib/socket";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";

export default function AirportLocalInformation({airport, small, disableOnlineInformation}: {
    airport: Airport,
    small?: boolean,
    disableOnlineInformation?: boolean,
}) {

    const [onlineAtc, setOnlineAtc] = useState<{ position: string, frequency: string, facility: number, }[]>();
    const [localSplit, setLocalSplit] = useState<string[]>(airport.localSplit);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;

        const handleVatsimData = (data: any) => {
            if (isMounted) {
                setOnlineAtc((data.controllers as {
                    callsign: string,
                    frequency: string,
                    facility: number,
                }[])
                    .filter((c) => c.callsign.startsWith(airport.iata))
                    .filter((c) => c.facility > 0 && c.facility < 5)
                    .sort((a, b) => a.callsign.localeCompare(b.callsign))
                    .sort((a, b) => a.facility - b.facility)
                    .map((controller) => ({
                        position: controller.callsign,
                        frequency: controller.frequency,
                        facility: controller.facility,
                    })));
            }
        };

        const handleLocalSplitUpdate = (data: string[]) => {
            if (isMounted) {
                setLocalSplit(data);
                toast.info(`${airport.icao} local split has been updated.`);
            }
        };

        if (!disableOnlineInformation) {
            socket.on('vatsim-data', handleVatsimData);
        }
        socket.on(`${airport.facilityId}-lcl-split`, handleLocalSplitUpdate);

        return () => {
            isMounted = false;
            if (!disableOnlineInformation) {
                socket.off('vatsim-data', handleVatsimData);
            }
            socket.off(`${airport.facilityId}-lcl-split`, handleLocalSplitUpdate);
        };
    }, [router, airport, disableOnlineInformation]);

    if (small) {
        let highestFacility = null;
        if (onlineAtc && onlineAtc.length > 0) {
            highestFacility = onlineAtc.reduce((prev, current) => (prev.facility > current.facility) ? prev : current);
        }

        return (
            <Grid2 size={2} sx={{border: 1, }}>
                <Tooltip title={<div style={{whiteSpace: 'pre-line'}}>{localSplit.join('\n')}</div>}>
                    {!disableOnlineInformation ? <Typography variant="h6" textAlign="center"
                                                             color={getColor(highestFacility?.facility || 0)}>{highestFacility?.position.substring(highestFacility?.position.length - 3) || 'CLSD'}/{localSplit.length === 0 ? highestFacility?.frequency || 'CTAF' : 'SPLIT'}</Typography> :
                        <Typography variant="h6" textAlign="center"
                                    color="gray">{localSplit.length === 0 ? highestFacility?.frequency || '' : 'SPLIT'}</Typography>}

                </Tooltip>
            </Grid2>
        )
    }

    return (
        <>
            <Grid2 size={2} sx={{border: 1,}}>
                <Typography variant="h6">LCL ONLINE</Typography>
                <Box height={250} sx={{overflow: 'auto',}}>
                    {onlineAtc?.map((atc) => (
                        <Typography key={atc.position} color={getColor(atc.facility)}>
                            <b>{atc.position}</b> {'--->'} {atc.frequency}
                        </Typography>
                    ))}
                    {disableOnlineInformation && <Typography color="gray">DISABLED FOR TRAINING</Typography>}
                </Box>
            </Grid2>
            <Grid2 size={2} sx={{border: 1,}}>
                <Typography variant="h6">LCL SPLIT</Typography>
                <Box height={250} sx={{overflow: 'auto',}}>
                    {localSplit.length > 0 &&
                        <Typography color="hotpink" fontWeight="bold">{airport.facilityId}</Typography>}
                    {localSplit.map((s, idx) => (
                        <Typography key={airport.icao + idx + 'LCLSPLIT'}>{s}</Typography>
                    ))}
                </Box>
            </Grid2>
        </>

    );
}