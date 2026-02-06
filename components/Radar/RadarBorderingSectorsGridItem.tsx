'use client';
import React, {useEffect, useState} from 'react';
import {Button, CircularProgress, Grid, Typography} from "@mui/material";
import {BorderingSector, fetchBorderingSectors, RadarSectorWithRadar} from "@/actions/borderingSectors";
import {socket} from "@/lib/socket";
import {Radar} from "@/generated/prisma/client";
import {toast} from "react-toastify";
import {Refresh} from "@mui/icons-material";
import {User} from "better-auth";

interface SectorWithBordering {
    primarySector: RadarSectorWithRadar;
    borderingSectors: BorderingSector[];
}

export default function RadarBorderingSectorsGridItem({user, radar}: { user: User, radar: Radar, }) {

    const [borderingSectors, setBorderingSectors] = useState<BorderingSector[] | undefined | null>();

    useEffect(() => {
        let isMounted = true;

        fetchBorderingSectors(user, radar).then((data) => {
            if (isMounted) setBorderingSectors(data);
        });

        const handleRadarConsolidation = () => {
            if (!isMounted) return;
            fetchBorderingSectors(user, radar).then((data) => {
                if (isMounted) setBorderingSectors(data);
            });
            toast.info('Radar consolidations have been updated.  This may or may not include your sectors or bordering sectors.');
        };

        socket.on('radar-consolidation', handleRadarConsolidation);

        return () => {
            isMounted = false;
            socket.off('radar-consolidation', handleRadarConsolidation);
        };
    }, [radar, user]);

    const onlineSectorsOpen = borderingSectors?.filter((sector) => sector.status === "open");
    const onlineSectorsConsolidated = borderingSectors?.filter((sector) => sector.status === "consolidated").map((sector) => sector.consolidatedTo);

    const openSectors = [...(onlineSectorsOpen?.map((sector) => sector.sector) || []), ...(onlineSectorsConsolidated || [])].filter((sector, index, self) =>
            index === self.findIndex((t) => (
                t?.id === sector?.id
            ))
    );

    const sectorsBordering: SectorWithBordering[] = [];

    for (const sector of openSectors) {
        if (!sector) continue;
        const bordering = borderingSectors?.filter((borderingSector) => borderingSector.consolidatedTo?.id === sector?.id) || [];
        sectorsBordering.push({primarySector: sector, borderingSectors: bordering});
    }

    return (
        <Grid size={3} height={250} sx={{border: 1, overflowY: 'auto' }}>
            {/*<Typography variant="h6">BORDERING SECTORS</Typography>*/}
            <Button variant="outlined" color="info" size="small" onClick={() => {
                window.location.reload();
            }} sx={{ width: '100%', fontSize: 10, }} startIcon={<Refresh />}>Refresh METARs/ATIS?</Button>
            <Grid container columns={3}>
                {borderingSectors === null &&
                    <Typography>You have no bordering sectors. Please define a radar consolidation to tell the system
                        what sectors you own and are logged on as.  If you have already done this, then make sure the current I.D.S you are on matches the facility that your primary sector is in. (Ex. PCT (OJAAY) must be in the PCT I.D.S)</Typography>}
                <Grid size={2}>
                    <Grid container columns={2}>
                {sectorsBordering.map((sectorWithBordering) => (
                    <Grid key={sectorWithBordering.primarySector.id} size={1} sx={{border: 1,}}>
                        <Typography
                            sx={{mb: -1,}}
                            fontSize={16}
                            color="gold">{sectorWithBordering.primarySector.radarId !== radar.id ? `${sectorWithBordering.primarySector.radar.identifier} - ${sectorWithBordering.primarySector.identifier}` : sectorWithBordering.primarySector.identifier}</Typography>
                        <Typography variant="subtitle2"
                                    color="lightgreen">{sectorWithBordering.primarySector.frequency}</Typography>
                        {sectorWithBordering.borderingSectors.map((sector) => (
                            <Typography key={sector.sector.id}
                                        variant="body2">{`${sector.sector.radarId !== radar.id ? `${sector.sector.radar.facilityId} - ` : ''} ${sector.sector.identifier}`}</Typography>
                        ))}
                        </Grid>
                    ))}
                    </Grid>
                </Grid>
                {borderingSectors && <Grid size={1} sx={{border: 1,}}>
                    <Typography sx={{mb: -1,}}
                                fontSize={16} color="red">CLOSED</Typography>
                    {borderingSectors?.filter((sector) => sector.status === "closed").length === 0 &&
                        <Typography variant="body2">N/A</Typography>}
                    {borderingSectors?.filter((sector) => sector.status === "closed").map((sector) => (
                        <Typography key={sector.sector.id}
                                    variant="body2">{`${sector.sector.radarId !== radar.id ? `${sector.sector.radar.facilityId} - ` : ''} ${sector.sector.identifier}`}</Typography>
                    ))}
                </Grid>}
            </Grid>
            {borderingSectors === undefined && <CircularProgress/>}
        </Grid>
    );
}
