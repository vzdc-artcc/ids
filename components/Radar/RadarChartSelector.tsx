'use client';
import React, {useState} from 'react';
import {Airport} from "@/generated/prisma/client";
import {Autocomplete, Divider, Grid, TextField, Typography} from "@mui/material";
import AirportCharts from "@/components/Airport/AirportCharts";

export default function RadarChartSelector({airports}: { airports: Airport[], }) {

    const [selectedIcao, setSelectedIcao] = useState<string | null>(null);

    return (
        <Grid size={9} height={350} sx={{border: 1, overflowY: 'auto',}}>
            <Typography variant="h6">CHARTS</Typography>
            <Autocomplete
                options={airports.map((airport) => airport.icao)}
                freeSolo
                getOptionLabel={(option) => option}
                value={selectedIcao}
                onChange={(event, newValue) => setSelectedIcao(newValue?.toUpperCase() || null)}
                renderInput={(params) => <TextField {...params} size="small" label="Select Airport"
                                                    placeholder="Ex. KIAD, W29 (you must include the K for ICAO airports)"
                                                    variant="outlined"/>}
                sx={{mx: 2, mt: 1,}}
            />
            <Divider sx={{my: 2,}}/>
            {selectedIcao && <AirportCharts icao={selectedIcao}/>}
        </Grid>
    );
}