'use client';
import React from 'react';
import {GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/Admin/DataTable/DataTable";
import {Radar} from "@/generated/prisma/browser";
import {Chip} from "@mui/material";
import {deleteDefaultRadarConsolidation, fetchDefaultRadarConsolidations} from "@/actions/defaultRadarConsolidation";
import EditButton from "@/components/Admin/GridButton/EditButton";
import DeleteButton from "@/components/Admin/GridButton/DeleteButton";
import {toast} from "react-toastify";

export default function RadarConsolidationTable() {

    const columns: GridColDef[] = [
        {
            field: 'name',
            flex: 1,
            headerName: 'Name',
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'primarySector',
            flex: 1,
            headerName: 'Primary Sector',
            sortable: false,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            renderCell: (params) => `${params.row.primarySector.radar.identifier} - ${params.row.primarySector.identifier}`,
        },
        {
            field: 'secondarySectors',
            headerName: 'Secondary Sectors',
            flex: 1,
            filterOperators: [...containsOnlyFilterOperator],
            sortable: false,
            renderCell: (params) => params.row.secondarySectors.map((sector: {
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
                <EditButton key={params.row.id} id={params.row.id} label="Edit Default Radar Consolidation"
                            editUrl={`/admin/radar-consolidations/${params.row.id}`}/>,
                <DeleteButton key={params.row.id} id={params.row.id} label="Delete Default Radar Consolidation"
                              deleteFunction={deleteDefaultRadarConsolidation}
                              onSuccess={() => toast.success('Radar consolidation deleted successfully!')}
                              warningMessage="Are you sure you want to delete this radar consolidation? Click again to confirm."/>,
            ],
        },
    ];

    return (
        <DataTable columns={columns} fetchData={async (pagination, sort, filter) => {
            const defaultConsolidations = await fetchDefaultRadarConsolidations(pagination, sort, filter);
            return {data: defaultConsolidations[1], rowCount: defaultConsolidations[0]};
        }}/>
    );

}