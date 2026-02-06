import React from 'react';
import {Typography} from "@mui/material";
import {fetchAllRadarSectors} from "@/actions/radarSector";
import RadarConsolidationForm from "@/components/Admin/RadarConsolidation/RadarConsolidationForm";

export default async function Page() {

    const allRadarSectors = await fetchAllRadarSectors();

    return (
        <>
            <Typography variant="h5" gutterBottom>New Default Radar Consolidation</Typography>
            <RadarConsolidationForm allSectors={allRadarSectors}/>
        </>
    );

}