'use client';
import React, {useEffect, useState} from 'react';
import {Box, CircularProgress, Divider, Grid2, Stack, TextField, Tooltip, Typography} from "@mui/material";
import {AtisUpdate} from "@/types";
import {fetchMetar} from "@/actions/atis";
import {socket} from "@/lib/socket";
import {getMetarColor} from "@/lib/metar";
import {toast} from "react-toastify";

export default function AirportAtisGridItems({icao, small, free, atisIntegrationDisabled, disableOnlineInformation}: {
    icao: string,
    small?: boolean,
    free?: boolean,
    atisIntegrationDisabled?: boolean,
    disableOnlineInformation?: boolean,
}) {

    const [airportIcao, setairportIcao] = useState<string>(icao);
    const [combinedAtis, setCombinedAtis] = useState<AtisUpdate>();
    const [departureAtis, setDepartureAtis] = useState<AtisUpdate>();
    const [arrivalAtis, setArrivalAtis] = useState<AtisUpdate>();
    const [atisDisabled, setAtisDisabled] = useState<boolean>(atisIntegrationDisabled ?? false);

    const [metar, setMetar] = useState<string>();

    useEffect(() => {
        const handleAtis = (data: AtisUpdate) => {
            switch (data.atisType) {
                case 'combined':
                    setCombinedAtis(data);
                    break;
                case 'departure':
                    setDepartureAtis(data);
                    break;
                case 'arrival':
                    setArrivalAtis(data);
                    break;
            }
        };

        const handleVatsimData = (data: any) => {
            if (!disableOnlineInformation) {
                fetchMetar(airportIcao).then(setMetar).catch((error) => {
                    console.error('Error fetching METAR:', error);
                });
                const atis = (data.atis as {
                    atis_code: string,
                    callsign: string,
                    frequency: string,
                    text_atis: string[],
                }[])
                    .filter((atis) => airportIcao.length === 4 ? atis.callsign.startsWith(airportIcao) : false);

                if (atis.length === 0) {
                    setCombinedAtis(undefined);
                    setDepartureAtis(undefined);
                    setArrivalAtis(undefined);
                    return;
                }

                atis.forEach((atis) => {
                    const atisLetter = atis.atis_code || ((atis.text_atis as string[]) || [''])[0]?.match(/ATIS INFO ([A-Z])/i)?.[1] || '-';

                    const atisUpdate = {
                        atisLetter,
                        airportConditions: atis.text_atis?.join(' ') || 'N/A',
                        notams: 'N/A',
                    } as AtisUpdate;

                    // more than 5 minutes old
                    const tenMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                    if (atis.callsign.includes('_D_')) {
                        setDepartureAtis((prev) => !prev || new Date(prev.timestamp) < tenMinutesAgo ? atisUpdate : prev);
                    } else if (atis.callsign.includes('_A_')) {
                        setArrivalAtis((prev) => !prev || new Date(prev.timestamp) < tenMinutesAgo ? atisUpdate : prev);
                    } else {
                        setCombinedAtis((prev) => !prev || new Date(prev.timestamp) < tenMinutesAgo ? atisUpdate : prev);
                    }
                });
            }
        }

        const handleVatisIntegration = (enabled: boolean) => {
            if (!disableOnlineInformation) {
                setAtisDisabled(!enabled);
                toast.warning(`ATIS Mode changed for ${airportIcao}`);
            }
        };

        if (!free) {
            socket.on(`${airportIcao}-atis`, handleAtis);
            socket.on('vatsim-data', handleVatsimData);
        }

        socket.on(`${airportIcao}-vatis-integration`, handleVatisIntegration);

        return () => {
            socket.off(`${airportIcao}-vatis-integration`, handleVatisIntegration);
            socket.off('vatsim-data', handleVatsimData);
            socket.off(`${airportIcao}-atis`, handleAtis);
        };
    }, [airportIcao, free, disableOnlineInformation]);

    useEffect(() => {
        let isMounted = true;

        if (!free && !disableOnlineInformation) {
            fetchMetar(airportIcao).then((metar) => {
                if (isMounted) {
                    setMetar(metar);
                }
            }).catch((error) => {
                if (isMounted) {
                    console.error('Error fetching METAR:', error);
                }
            });
        }

        return () => {
            isMounted = false;
        };
    }, [airportIcao, free, disableOnlineInformation]);

    const {wind, altimeter} = getWindAndAltimeter(metar || '');

    const handleAirportIcaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newIcao = e.target.value.toUpperCase();
        setairportIcao(newIcao);
        fetchMetar(newIcao).then(setMetar).catch((error) => {
            console.error('Error fetching METAR:', error);
        });
    }

    if (small) {
        return (
            <>
                <Grid2 size={1} sx={{border: 1,}}>
                    {free &&
                        <TextField variant="outlined" label="ICAO" size="small" value={airportIcao}
                                   onChange={handleAirportIcaoChange} sx={{width: '100%',}}/>
                    }
                    {!free && !atisDisabled &&
                        <Typography variant="h6" textAlign="center">{airportIcao.toUpperCase()}</Typography>}
                    {!free && atisDisabled &&
                        <Tooltip title="vATIS Integration Disabled.  Enable it in airport settings.">
                            <Typography variant="h6" color="orange"
                                        textAlign="center">{airportIcao.toUpperCase()}</Typography>
                        </Tooltip>}
                </Grid2>
                <Grid2 size={1} sx={{border: 1,}}>
                    {!free && !metar && !disableOnlineInformation &&
                        <Stack direction="column" justifyContent="center" alignItems="center">
                            <CircularProgress size={25}/>
                        </Stack>
                    }
                    {!free && (metar || disableOnlineInformation) && <Tooltip title={metar} arrow>
                        <Box>
                            {!combinedAtis && !departureAtis && !arrivalAtis &&
                                <Typography variant="h5" textAlign="center" color={getMetarColor(metar || '')}
                                            fontWeight="bold">-</Typography>}
                            {combinedAtis &&
                                <Typography variant="h5" textAlign="center" color={getMetarColor(metar || '')}
                                            fontWeight="bold">{combinedAtis.atisLetter}</Typography>}
                            {(departureAtis || arrivalAtis) && !combinedAtis && <Typography variant="h6"><span
                                style={{color: 'green'}}>{departureAtis?.atisLetter || '-'}</span>/<span
                                style={{color: 'red'}}>{arrivalAtis?.atisLetter || '-'}</span></Typography>}
                        </Box>
                    </Tooltip>}
                    {free && <Tooltip title={metar} arrow>
                        <Typography variant="h6" textAlign="center" color={getMetarColor(metar || '')}
                                    fontWeight="bold">UNK</Typography>
                    </Tooltip>}
                </Grid2>
                <Grid2 size={2} sx={{border: 1,}}>
                    <Typography textAlign="center" variant="h6">{wind}</Typography>
                </Grid2>
                <Grid2 size={1} sx={{border: 1,}}>
                    <Typography textAlign="center" variant="h6"
                                sx={{
                                    textDecoration: 'underline',
                                    textDecorationColor: 'orange',
                                }}>{altimeter}</Typography>
                </Grid2>
            </>
        )
    }

    return (
        <>
            <Grid2 size={2} sx={{border: 1,}}>
                <Typography variant="h3" textAlign="center">{airportIcao.toUpperCase()}</Typography>
                {atisDisabled &&
                    <Typography textAlign="center" color="orange" fontWeight="bold">AUTO FLOW DISABLED</Typography>}
                {(!metar && !disableOnlineInformation) &&
                    <Stack direction="column" alignItems="center">
                        <CircularProgress size={80}/>
                        <Typography variant="subtitle2" textAlign="center">Loading may take up to 15
                            seconds</Typography>
                    </Stack>
                }
            </Grid2>
            <Grid2 size={1} sx={{border: 6, borderColor: getMetarColor(metar || ''),}}>
                {!combinedAtis && !departureAtis && !arrivalAtis &&
                    <Typography variant="h1" textAlign="center" color={getMetarColor(metar || '')}
                                fontWeight="bold">-</Typography>}
                {combinedAtis && <Typography variant="h1" textAlign="center" color={getMetarColor(metar || '')}
                                             fontWeight="bold">{combinedAtis.atisLetter}</Typography>}
                {departureAtis && <Typography variant="h3" textAlign="center" color="green"
                                              fontWeight="bold">{departureAtis.atisLetter}</Typography>}
                {arrivalAtis && <Typography variant="h3" textAlign="center" color="red"
                                            fontWeight="bold">{arrivalAtis.atisLetter}</Typography>}
                <Typography variant="h6" textAlign="center">{wind}</Typography>
                <Typography variant="h6" textAlign="center"
                            sx={{textDecoration: 'underline', textDecorationColor: 'orange',}}>{altimeter}</Typography>
            </Grid2>
            <Grid2 size={6} sx={{border: 1,}}>
                <Typography variant="h6" color={getMetarColor(metar || '')}>{metar}</Typography>
                <Divider/>
                {!combinedAtis && !departureAtis && !arrivalAtis &&
                    <Typography variant="subtitle2">ATIS NOT AVAILABLE.</Typography>}
                {combinedAtis && <Typography
                    variant="subtitle2">{combinedAtis.airportConditions} NOTAMS {combinedAtis.notams}</Typography>}
                {!combinedAtis && departureAtis && <Typography variant="subtitle2"
                                                               color="green">{departureAtis.airportConditions} NOTAMS {departureAtis.notams}</Typography>}
                {!combinedAtis && arrivalAtis &&
                    <Typography variant="subtitle2"
                                color="red">{arrivalAtis.airportConditions} NOTAMS {arrivalAtis.notams}</Typography>}
            </Grid2>
        </>
    );


}

export const getWindAndAltimeter = (metar: string) => {
    const wind = metar.match(/(\d{3}|VRB)\d{2}(G\d{2})?KT/);
    const altimeter = metar.match(/A\d{4}/);

    return {
        wind: wind ? wind[0] : '-',
        altimeter: altimeter ? altimeter[0] : '-',
    };
}