'use client';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    DataGrid,
    getGridStringOperators,
    GridColDef,
    GridFilterItem,
    GridFilterModel,
    GridPaginationModel,
    GridSortModel,
    GridToolbar
} from "@mui/x-data-grid";
import {toast} from "react-toastify";
import {Box} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";

export const equalsOnlyFilterOperator = getGridStringOperators().filter((operator) => operator.value === 'equals');
export const containsOnlyFilterOperator = getGridStringOperators().filter((operator) => operator.value === 'contains');

export default function DataTable<T>(
    {
        columns,
        initialPagination = {page: 0, pageSize: 10},
        pageSizeOptions = [5, 10, 20],
        initialFilter,
        initialSort,
        fetchData
    }:
        {
            columns: GridColDef[],
            initialPagination?: GridPaginationModel,
            pageSizeOptions?: number[],
            initialFilter?: GridFilterItem,
            initialSort?: GridSortModel,
            fetchData: (pagination: GridPaginationModel, sortModel: GridSortModel, filter?: GridFilterItem) => Promise<{
                data: T[],
                rowCount: number,
            }>,
        }
) {

    const searchParams = useSearchParams();
    const router = useRouter();

    // Compute initial values from URL params using useMemo to avoid re-computation
    const initialPaginationFromUrl = useMemo(() => {
        const page = Number(searchParams.get('page')) || initialPagination.page;
        const pageSize = Number(searchParams.get('pageSize')) || initialPagination.pageSize;
        return {page, pageSize};
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only compute once on mount

    const initialFilterFromUrl = useMemo(() => {
        const filterField = searchParams.get('filterField');
        const filterValue = searchParams.get('filterValue');
        const filterOperator = searchParams.get('filterOperator');
        return filterField && filterValue && filterOperator
            ? {field: filterField, value: filterValue, operator: filterOperator}
            : initialFilter;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only compute once on mount

    const initialSortFromUrl = useMemo(() => {
        const sortField = searchParams.get('sortField');
        const sortDirection = searchParams.get('sortDirection');
        return sortField && sortDirection
            ? [{field: sortField, sort: sortDirection as 'asc' | 'desc'}]
            : initialSort || [];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only compute once on mount

    const [data, setData] = useState<T[]>();
    const [pagination, setPagination] = useState<GridPaginationModel>(initialPaginationFromUrl);
    const [rowCount, setRowCount] = useState(0);
    const [filter, setFilter] = useState<GridFilterItem | undefined>(initialFilterFromUrl);
    const [sortModel, setSortModel] = useState<GridSortModel>(initialSortFromUrl);

    const updateQueryParams = useCallback((params: Record<string, string>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            newParams.set(key, value);
        });
        router.push(`?${newParams.toString()}`);
    }, [router, searchParams]);

    useEffect(() => {
        let ignore = false;

        fetchData(pagination, sortModel, filter)
            .then(({data, rowCount}) => {
                if (!ignore) {
                    setData(data);
                    setRowCount(rowCount);
                }
            })
            .catch(() => {
                if (!ignore) {
                    toast.error('Failed to fetch data');
                }
            });

        return () => {
            ignore = true;
        };
    }, [fetchData, filter, pagination, sortModel]);


    const handleFilterChange = (newFilters: GridFilterModel) => {
        const newFilter = newFilters.items[0];
        setFilter(newFilter);
        updateQueryParams({
            filterField: newFilter?.field || '',
            filterValue: newFilter?.value?.toString() || '',
            filterOperator: newFilter?.operator || ''
        });
    };

    const handlePaginationModelChange = (newPagination: GridPaginationModel) => {
        setPagination(newPagination);
        updateQueryParams({
            page: newPagination.page.toString(),
            pageSize: newPagination.pageSize.toString()
        });
    };

    const handleSortChange = (newSortModel: GridSortModel) => {
        setSortModel(newSortModel);
        if (newSortModel.length > 0) {
            updateQueryParams({
                sortField: newSortModel[0].field,
                sortDirection: newSortModel[0].sort || 'asc'
            });
        } else {
            updateQueryParams({
                sortField: '',
                sortDirection: ''
            });
        }
    };

    return (
        <Box sx={{boxSizing: 'border-box', width: '100%',}}>
            <DataGrid
                sx={{mt: 2,}}
                loading={!data}
                rows={data || []}
                autoHeight
                columns={columns}
                pagination
                paginationMode="server"
                filterMode="server"
                sortingMode="server"
                paginationModel={pagination}
                rowCount={rowCount}
                onPaginationModelChange={handlePaginationModelChange}
                onFilterModelChange={handleFilterChange}
                sortModel={sortModel}
                onSortModelChange={handleSortChange}
                pageSizeOptions={pageSizeOptions}
                slots={{
                    toolbar: GridToolbar,
                }}
                disableRowSelectionOnClick
            />
        </Box>
    );
}