'use client';
import React from 'react';
import {Radar} from "@/generated/prisma/browser";
import {GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/Admin/DataTable/DataTable";
import {Chip} from "@mui/material";
import EditButton from "@/components/Admin/GridButton/EditButton";
import DeleteButton from "@/components/Admin/GridButton/DeleteButton";
import {toast} from "react-toastify";
import {deleteRadarSector, fetchRadarSectors} from "@/actions/radarSector";

export default function RadarSectorTable({radar}: { radar: Radar, }) {

    const columns: GridColDef[] = [
        {
            field: 'identifier',
            headerName: 'Identifier',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'frequency',
            headerName: 'Frequency',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            sortable: false,
        },
        {
            field: 'borderingSectors',
            headerName: 'Bordering Sectors',
            flex: 1,
            filterOperators: [...containsOnlyFilterOperator],
            sortable: false,
            renderCell: (params) => params.row.borderingSectors.map((sector: {
                id: string,
                radar: Radar,
                identifier: string,
            }) => {
                return (
                    <Chip
                        key={sector.id}
                        label={`${sector.radar.identifier} - ${sector.identifier}`}
                        size="small"
                        style={{margin: '2px'}}
                    />
                );
            }),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                <EditButton key={params.row.id} id={params.row.id} label="Edit Radar Sector"
                            editUrl={`/admin/radars/${radar.id}/sectors/${params.row.id}`}/>,
                <DeleteButton key={params.row.id} id={params.row.id} label="Delete Radar Sector"
                              deleteFunction={deleteRadarSector}
                              onSuccess={() => toast.success('Radar deleted successfully!')}
                              warningMessage="Are you sure you want to delete this sector? Click again to confirm."/>,
            ],
        }
    ];

    return (
        <DataTable columns={columns} fetchData={async (pagination, sort, filter) => {
            const fetchedSectors = await fetchRadarSectors(radar, pagination, sort, filter);
            return {data: fetchedSectors[1], rowCount: fetchedSectors[0]};
        }}/>
    );
}