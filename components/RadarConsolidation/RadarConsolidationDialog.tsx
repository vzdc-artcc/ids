'use client';
import React, {useState} from 'react';
import Consolidation, {Consolidation as RadarConsolidationWithAll} from "@/components/Viewer/Consolidation";
import {Dialog, DialogContent} from "@mui/material";
import {Session} from "next-auth";
import {SessionProvider} from "next-auth/react";

export default function RadarConsolidationDialog({ session, existing }: { session: Session, existing?: RadarConsolidationWithAll }) {

    const [open, setOpen] = useState(!existing);

    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogContent>
                <SessionProvider session={session}>
                    <Consolidation onlyMe onCreateSuccess={() => setOpen(false)} />
                </SessionProvider>
            </DialogContent>
            {/*<DialogActions>*/}
            {/*    <Button color="inherit" onClick={() => setOpen(false)}>Close</Button>*/}
            {/*</DialogActions>*/}
        </Dialog>
    );
}