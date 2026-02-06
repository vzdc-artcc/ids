'use client';
import React from 'react';
import {GridColDef} from "@mui/x-data-grid";
import {fetchAirports} from "@/actions/airport";
import {toast} from "react-toastify";
import {deleteFacility} from "@/actions/facility";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/Admin/DataTable/DataTable";
import EditButton from "@/components/Admin/GridButton/EditButton";
import DeleteButton from "@/components/Admin/GridButton/DeleteButton";

export default function AirportTable() {

    const columns: GridColDef[] = [
        {
            field: 'icao',
            headerName: 'ICAO (Facility ID)',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'iata',
            headerName: 'IATA',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'runways',
            headerName: 'Runways',
            flex: 1,
            renderCell: (params) => params.row.runways.length,
            sortable: false,
            filterable: false,
        },
        {
            field: 'radars',
            headerName: 'Attached Radar Facilities',
            flex: 1,
            renderCell: (params) => params.row.radars.length,
            sortable: false,
            filterable: false,
        },
        {
            field: 'hidden',
            headerName: 'Hidden',
            flex: 1,
            type: 'boolean',
            renderCell: (params) => params.row.facility.hiddenFromPicker ? 'HIDDEN' : '',
            sortable: false,
            filterable: false,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                <EditButton key={params.row.id} id={params.row.id} label="Edit Airport"
                            editUrl={`/admin/airports/${params.row.id}`}/>,
                <DeleteButton key={params.row.id} id={params.row.iata} label="Delete Airport"
                              deleteFunction={deleteFacility}
                              onSuccess={() => toast.success('Airport deleted successfully!')}
                              warningMessage="Deleting this airport will remove all associated runways, TMUs, and flow presets. Click again to confirm."/>,
            ],
            flex: 1,
        }
    ];

    return (
        <DataTable columns={columns} fetchData={async (pagination, sort, filter) => {
            const fetchedAirports = await fetchAirports(pagination, sort, filter);
            return {data: fetchedAirports[1], rowCount: fetchedAirports[0]};
        }}/>
    );
}