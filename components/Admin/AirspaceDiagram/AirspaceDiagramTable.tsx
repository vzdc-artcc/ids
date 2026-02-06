'use client';
import React from 'react';
import {GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/Admin/DataTable/DataTable";
import EditButton from "@/components/Admin/GridButton/EditButton";
import DeleteButton from "@/components/Admin/GridButton/DeleteButton";
import {toast} from "react-toastify";
import {deleteAirspaceDiagram, fetchAirspaceDiagrams} from "@/actions/airspace";

export default function AirspaceDiagramTable() {

    const columns: GridColDef[] = [
        {
            field: 'airport',
            headerName: 'Airport',
            flex: 1,
            sortable: false,
            renderCell: (params) => params.row.airport?.icao || '',
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'radarSector',
            headerName: 'Radar Sector',
            flex: 1,
            sortable: false,
            renderCell: (params) => `${params.row.sector?.radar.facilityId || ''}${params.row.sector ? ' - ' : ''}${params.row.sector?.identifier || ''}`,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                <EditButton key={params.row.id} id={params.row.id} label="Edit Airspace Diagram"
                            editUrl={`/admin/airspaces/${params.row.id}`}/>,
                <DeleteButton key={params.row.id} id={params.row.id} label="Delete Airspace Diagram"
                              deleteFunction={deleteAirspaceDiagram}
                              onSuccess={() => toast.success('Airspace diagram deleted successfully!')}
                              warningMessage="Are you sure you want to delete this airspace diagram? Click again to confirm."/>,
            ],
        }
    ];

    return (
        <DataTable columns={columns} fetchData={async (pagination, sort, filter) => {
            const fetchedDiagrams = await fetchAirspaceDiagrams(pagination, sort, filter);
            return {data: fetchedDiagrams[1], rowCount: fetchedDiagrams[0]};
        }}/>
    );
}