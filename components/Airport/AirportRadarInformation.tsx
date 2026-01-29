'use client';
import React, {useEffect, useState} from 'react';
import {Radar} from "@prisma/client";
import {socket} from "@/lib/socket";
import {Box, Grid2, Typography} from "@mui/material";
import {getColor} from "@/lib/facilityColor";
import {getAirportRelatedConsolidations, SectorStatus} from "@/actions/airport-split";
import {toast} from "react-toastify";

export default function AirportRadarInformation({icao, radars, disableOnlineInformation}: {
    icao: string,
    radars: Radar[],
    disableOnlineInformation?: boolean
}) {

    const [onlineAtc, setOnlineAtc] = useState<{ position: string, frequency: string, facility: number, }[]>();
    const [radarConsolidations, setRadarConsolidations] = useState<SectorStatus[]>();

    useEffect(() => {
        let isMounted = true;

        getAirportRelatedConsolidations(icao).then((data) => {
            if (isMounted) setRadarConsolidations(data);
        });

        const handleRadarConsolidation = () => {
            if (!isMounted) return;
            getAirportRelatedConsolidations(icao).then((data) => {
                if (isMounted) setRadarConsolidations(data);
            });
            toast.info('Radar consolidations updated');
        };

        const handleVatsimData = (data: any) => {
            if (!isMounted) return;
            setOnlineAtc((data.controllers as {
                callsign: string,
                frequency: string,
                facility: number,
            }[])
                .filter((c) => radars.some((r) => r.atcPrefixes.some((prefix) => c.callsign.startsWith(prefix))))
                .filter((c) => c.facility > 4)
                .sort((a, b) => a.callsign.localeCompare(b.callsign))
                .sort((a, b) => a.facility - b.facility)
                .map((controller) => ({
                    position: controller.callsign,
                    frequency: controller.frequency,
                    facility: controller.facility,
                })));
        };

        socket.on('radar-consolidation', handleRadarConsolidation);

        if (!disableOnlineInformation) {
            socket.on('vatsim-data', handleVatsimData);
        }

        return () => {
            isMounted = false;
            socket.off('radar-consolidation', handleRadarConsolidation);
            if (!disableOnlineInformation) {
                socket.off('vatsim-data', handleVatsimData);
            }
        };
    }, [radars, icao, disableOnlineInformation]);

    return (
        <>
            <Grid2 size={2} sx={{border: 1,}}>
                <Typography variant="h6">RADAR ONLINE</Typography>
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
                <Typography variant="h6">RADAR SPLIT</Typography>
                <Box height={250} sx={{overflow: 'auto',}}>
                    {!radarConsolidations && <Typography color="red">ERR: NO PRIM RADAR SET</Typography>}
                    {radarConsolidations?.map((rs) => (
                        <Box key={rs.sector.id} sx={{mb: 0.5,}}>
                            <Typography variant="caption"><span
                                style={{color: 'gold',}}>{rs.sector.identifier}</span> {'->'} <span
                                style={{color: rs.open ? 'lightgreen' : rs.consolidatedTo ? 'cyan' : 'red'}}>{rs.open ? 'OPEN' : rs.consolidatedTo ? rs.consolidatedTo.identifier : 'CLOSED'}</span></Typography>
                        </Box>
                    ))}
                </Box>
            </Grid2>
        </>

    );
}