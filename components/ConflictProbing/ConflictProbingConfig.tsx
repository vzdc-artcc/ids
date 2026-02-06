import React from 'react';
import {ConflictProbingConfigResponse} from "@/types/conflict-probing";
import {Accordion, AccordionDetails, AccordionSummary, Typography} from "@mui/material";
import {ExpandMore} from "@mui/icons-material";

export default function ConflictProbingConfig({config}: { config: ConflictProbingConfigResponse }) {
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMore/>}>
                <Typography variant="subtitle2">Algorithm Configuration (debug)</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {Object.entries(config).map(([key, value]) => (
                    <Typography key={key} variant="caption"
                                sx={{display: 'block',}}>{key}: {value.toString()}</Typography>
                ))}
            </AccordionDetails>
        </Accordion>
    );
}