'use client';
import React, {useEffect, useState} from 'react';
import {fetchAllFacilities, getSopLink} from "@/actions/facility";
import {Facility} from "@/generated/prisma/client";
import {Autocomplete, Card, CardContent, Divider, TextField} from "@mui/material";
import UrlViewer from "@/components/Viewer/UrlViewer";

export default function SopViewer({defaultFacility}: { defaultFacility?: string, }) {

    const [facilities, setFacilities] = useState<Facility[]>();
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
    const [sopLink, setSopLink] = useState<string>();

    useEffect(() => {

        if (!facilities) {
            fetchAllFacilities().then((res) => {
                setFacilities(res);
                if (defaultFacility) {
                    const f = res.find(f => f.id === defaultFacility);
                    setSelectedFacility(f || null);
                }
            });
        }

        if (selectedFacility) {
            getSopLink(selectedFacility.id).then(setSopLink);
        }

    }, [defaultFacility, facilities, selectedFacility]);

    return (
        <>
            <Card sx={{mx: 1,}}>
                <CardContent>
                    <Autocomplete
                        size="small"
                        options={facilities || []}
                        getOptionLabel={(option) => option.id}
                        value={selectedFacility}
                        onChange={(event, newValue) => setSelectedFacility(newValue)}
                        renderInput={(params) => <TextField {...params} label="Facility" variant="outlined"/>}
                    />
                </CardContent>
            </Card>
            <Divider sx={{my: 1,}}/>
            {sopLink && <UrlViewer url={sopLink}/>}
        </>

    );
}