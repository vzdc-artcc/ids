'use client';
import React, {useState} from 'react';
import Consolidation from "@/components/Viewer/Consolidation";
import type {Consolidation as RadarConsolidationWithAll} from "@/types";
import {Dialog, DialogContent} from "@mui/material";

export default function RadarConsolidationDialog({ existing }: { existing?: RadarConsolidationWithAll }) {

    const [open, setOpen] = useState(!existing);

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogContent>
                <Consolidation onlyMe onCreateSuccess={() => setOpen(false)} />
            </DialogContent>
            {/*<DialogActions>*/}
            {/*    <Button color="inherit" onClick={() => setOpen(false)}>Close</Button>*/}
            {/*</DialogActions>*/}
        </Dialog>
    );
}