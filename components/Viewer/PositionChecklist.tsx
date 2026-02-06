import React from 'react';
import {Stack} from "@mui/material";
import Image from "next/image";

export default function PositionChecklist() {
    return (
        <Stack direction="row" justifyContent="center">
            <Image src="/img/pos_relief.png" alt="vZDC-A-01F APPENDIX B. POSITION BRIEFING CHECKLISTS" width={626} height={472} />
        </Stack>
    );
}