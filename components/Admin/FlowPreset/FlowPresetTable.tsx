'use client';
import React from 'react';
import {getGridSingleSelectOperators, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/Admin/DataTable/DataTable";
import EditButton from "@/components/Admin/GridButton/EditButton";
import DeleteButton from "@/components/Admin/GridButton/DeleteButton";
import {toast} from "react-toastify";
import {deleteFlowPreset, fetchFlowPresets} from "@/actions/flowPreset";
import {FlowPresetAtisType} from "@/generated/prisma/browser";

export default function FlowPresetTable() {

    const columns: GridColDef[] = [
        {
            field: 'airport',
            headerName: 'Airport',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            renderCell: (params) => params.row.airport.icao,
            sortable: false,
        },
        {
            field: 'atisType',
            headerName: 'vATIS Type',
            type: 'singleSelect',
            flex: 1,
            valueOptions: Object.values(FlowPresetAtisType).map((type) => ({value: type, label: type})),
            filterOperators: getGridSingleSelectOperators().filter((operator) => operator.value === 'is'),
        },
        {
            field: 'presetName',
            headerName: 'Preset Name',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                <EditButton key={params.row.id} id={params.row.id} label="Edit Preset"
                            editUrl={`/admin/flow-presets/${params.row.id}`}/>,
                <DeleteButton key={params.row.id} id={params.row.id} label="Delete Preset"
                              deleteFunction={deleteFlowPreset}
                              onSuccess={() => toast.success('Preset deleted successfully!')}
                              warningMessage="Are you sure you want to delete this preset? Click again to confirm."/>,
            ],
        }
    ];

    return (
        <DataTable columns={columns} fetchData={async (pagination, sort, filter) => {
            const fetchedPresets = await fetchFlowPresets(pagination, sort, filter);
            return {data: fetchedPresets[1], rowCount: fetchedPresets[0]};
        }}/>
    );
}