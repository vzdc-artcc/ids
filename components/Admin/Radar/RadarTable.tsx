'use client';
import React from 'react';
import {GridActionsCellItem, GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/Admin/DataTable/DataTable";
import {Chip} from "@mui/material";
import EditButton from "@/components/Admin/GridButton/EditButton";
import DeleteButton from "@/components/Admin/GridButton/DeleteButton";
import {deleteFacility} from "@/actions/facility";
import {toast} from "react-toastify";
import {fetchRadars} from "@/actions/radar";
import {Map} from "@mui/icons-material";
import {useRouter} from "next/navigation";

export default function RadarTable() {

    const router = useRouter();

    const columns: GridColDef[] = [
        {
            field: 'identifier',
            headerName: 'Identifier',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
        },
        {
            field: 'atcPrefixes',
            headerName: 'A.T.C Prefixes',
            renderCell: (params) => params.row.atcPrefixes.map((prefix: string) => {
                return (
                    <Chip
                        key={prefix}
                        label={prefix}
                        size="small"
                        style={{margin: '2px'}}
                    />
                );
            }),
            flex: 1,
            filterOperators: [...containsOnlyFilterOperator],
            sortable: false,
        },
        {
            field: 'isEnrouteFacility',
            type: 'boolean',
            headerName: 'Enroute Facility',
            flex: 1,
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
            field: 'connectedAirports',
            headerName: 'Connected Airports',
            renderCell: (params) => params.row.connectedAirports.length,
            filterOperators: [...containsOnlyFilterOperator],
            sortable: false,
            flex: 1,
        },
        {
            field: 'sectors',
            headerName: 'Sectors',
            renderCell: (params) => params.row.sectors.length,
            filterOperators: [...containsOnlyFilterOperator],
            sortable: false,
            flex: 1,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                <GridActionsCellItem
                    key={params.row.id}
                    icon={<Map/>}
                    label="Radar Sectors"
                    onClick={() => router.push(`/admin/radars/${params.row.id}/sectors`)}
                />,
                <EditButton key={params.row.id} id={params.row.identifier} label="Edit Radar"
                            editUrl={`/admin/radars/${params.row.id}`}/>,
                <DeleteButton key={params.row.id} id={params.row.identifier} label="Delete Radar"
                              deleteFunction={deleteFacility}
                              onSuccess={() => toast.success('Radar deleted successfully!')}
                              warningMessage="Deleting this radar will remove all associated sectors, positions, and consolidations. Click again to confirm."/>,
            ],
        }
    ];

    return (
        <DataTable columns={columns} fetchData={async (pagination, sort, filter) => {
            const fetchedFacilities = await fetchRadars(pagination, sort, filter);
            return {data: fetchedFacilities[1], rowCount: fetchedFacilities[0]};
        }}/>
    );
}