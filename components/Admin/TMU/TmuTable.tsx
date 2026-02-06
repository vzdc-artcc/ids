'use client';
import React from 'react';
import {GridColDef} from "@mui/x-data-grid";
import DataTable, {containsOnlyFilterOperator, equalsOnlyFilterOperator} from "@/components/Admin/DataTable/DataTable";
import EditButton from "@/components/Admin/GridButton/EditButton";
import DeleteButton from "@/components/Admin/GridButton/DeleteButton";
import {toast} from "react-toastify";
import {deleteTmu, fetchTmu} from "@/actions/tmu";
import {Facility} from "@/generated/prisma/browser";
import {Chip} from "@mui/material";
import {socket} from "@/lib/socket";

export default function TmuTable() {

    const columns: GridColDef[] = [
        {
            field: 'facilities',
            headerName: 'Facilities',
            renderCell: (params) => params.row.broadcastedFacilities.map((facility: Facility) => {
                return (
                    <Chip
                        key={facility.id}
                        label={facility.id}
                        size="small"
                        style={{margin: '2px'}}
                    />
                );
            }), flex: 1,
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            sortable: false,
        },
        {
            field: 'message',
            headerName: 'Message',
            filterOperators: [...equalsOnlyFilterOperator, ...containsOnlyFilterOperator],
            flex: 1,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            getActions: (params) => [
                <EditButton key={params.row.id} id={params.row.id} label="Edit Notice"
                            editUrl={`/admin/tmu/${params.row.id}`}/>,
                <DeleteButton key={params.row.id} id={params.row.id} label="Delete Notice" deleteFunction={deleteTmu}
                              onSuccess={() => {
                                  toast.success('Notice deleted successfully!');
                                  for (const facility of params.row.broadcastedFacilities) {
                                      socket.emit(`${facility.id}-tmu`);
                                  }
                              }}
                              warningMessage="Are you sure you want to delete this notice? Click again to confirm."/>,
            ],
            flex: 1,
        }
    ];

    return (
        <DataTable columns={columns} fetchData={async (pagination, sort, filter) => {
            const fetchedTmu = await fetchTmu(pagination, sort, filter);
            return {data: fetchedTmu[1], rowCount: fetchedTmu[0]};
        }}/>
    );

}