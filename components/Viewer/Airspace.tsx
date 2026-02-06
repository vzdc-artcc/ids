'use client';
import React, {useEffect, useState} from 'react';
import {fetchAllAirspaceDiagrams} from "@/actions/airspace";
import {Airport} from "@/generated/prisma/client";
import {Autocomplete, Box, CircularProgress, Stack, TextField} from "@mui/material";
import Image from "next/image";

export default function Airspace() {

    const [allAirspaces, setAllAirspaces] = useState<{
        id: string,
        name: string,
        key: string,
        airport: Airport | null,
        sector: {
            id: string,
            identifier: string,
            radar: {
                id: string,
                facilityId: string,
            },
        } | null,
    }[]>();
    const [selectedAirspace, setSelectedAirspace] = useState<{
        id: string,
        name: string,
        key: string,
        airport: Airport | null,
        sector: {
            id: string,
            identifier: string,
            radar: {
                id: string,
                facilityId: string,
            },
        } | null,
    } | null>();
    const [url, setUrl] = useState<string>();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!allAirspaces) {
            fetchAllAirspaceDiagrams().then((airspaces) => {
                const sortedAirspaces = airspaces.sort((a, b) => {
                    if (a.airport && b.airport) {
                        return a.airport.icao.localeCompare(b.airport.icao) || a.name.localeCompare(b.name);
                    }
                    if (a.airport) return -1;
                    if (b.airport) return 1;
                    if (a.sector && b.sector) {
                        const radarComparison = a.sector.radar.facilityId.localeCompare(b.sector.radar.facilityId);
                        if (radarComparison !== 0) return radarComparison;
                        const sectorComparison = a.sector.identifier.localeCompare(b.sector.identifier);
                        if (sectorComparison !== 0) return sectorComparison;
                        return a.name.localeCompare(b.name);
                    }
                    return 0;
                });
                setAllAirspaces(sortedAirspaces);
            });
        } else if (selectedAirspace) {
            setLoading(true);
            setUrl(`https://utfs.io/f/${selectedAirspace.key}`);
            setLoading(false);
        }
    }, [allAirspaces, selectedAirspace]);

    return (
        <Stack direction="column" spacing={2} sx={{mx: 4,}}>
            <Autocomplete
                options={allAirspaces || []}
                getOptionLabel={(option) => option.airport ? `${option.airport.icao} - ${option.name}` : `${option.sector?.radar.facilityId} - ${option.sector?.identifier} - ${option.name}`}
                value={selectedAirspace}
                onChange={(event, newValue) => setSelectedAirspace(newValue)}
                renderInput={(params) => <TextField {...params} label="Select Airspace" variant="outlined"/>}
            />
            <Box sx={{
                position: 'relative',
                width: '100%',
                minHeight: 400,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {loading ? <CircularProgress/> : selectedAirspace &&
                    <Image src={url || ''} alt={selectedAirspace.name} fill style={{objectFit: 'contain'}}/>}
            </Box>
        </Stack>
    );
}