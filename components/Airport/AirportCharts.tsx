'use client';
import React, {useEffect} from 'react';
import {Box, Button, ButtonGroup, CircularProgress} from "@mui/material";
import {fetchCharts} from "@/actions/charts";
import {usePathname, useRouter} from "next/navigation";
import {toast} from "react-toastify";

export default function AirportCharts({icao}: { icao: string, }) {

    const [charts, setCharts] = React.useState<Record<string, { name: string, url: string,}[]>>();
    const router = useRouter();
    const pathName = usePathname();

    useEffect(() => {
        setCharts(undefined);
        fetchCharts(icao).then((data) => {

            if (!data || !data.airport_data) {
                setCharts({});
                toast.info('No charts found for this airport.');
                return;
            }

            type ChartData = {
                chart_name: string,
                pdf_url: string,
            };

            const { airport_diagram, general, departure, arrival, approach } = data.charts

            setCharts({
                'APD': airport_diagram ? airport_diagram.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
                'GEN': general ? general.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
                'DP': departure ? departure.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
                'STAR': arrival ? arrival.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
                'IAP': approach ? approach.map((chart: ChartData) => ({ name: chart.chart_name, url: chart.pdf_url })) : [],
            });
        });
    }, [icao]);

    const navigateToChart = (url: string) => {
        const search = new URLSearchParams({
            viewer: 'url',
            url,
        });
        router.push(`${pathName}?${search.toString()}#viewer`, {
            scroll: true,
        });
    };

    return (
        <Box sx={{overflowY: 'auto'}}>
            {!charts && <CircularProgress/>}
            {Object.entries(charts || {}).map(([code, charts]) => (
                <ButtonGroup
                    key={icao + 'charts' + code}
                    variant="outlined"
                    size="small"
                    color={getChartColor(code)}
                    sx={{mb: 2, flexWrap: 'wrap', 
                        '& .MuiButtonGroup-middleButton,.MuiButtonGroup-firstButton, .MuiButtonGroup-lastButton': {
                            borderRightColor: "var(--variant-outlinedBorder)",
                            borderTopRightRadius: "inherit",
                            borderBottomRightRadius: "inherit",
                            borderTopLeftRadius: 'inherit',
                            borderBottomLeftRadius: 'inherit',
                            marginLeft: 0,
                            marginBottom: '5px',
                            marginRight: '5px'
                        },
                        marginLeft:'5px'}}
                >
                    {charts.map((chart) => (
                        <Button key={chart.url} onClick={() => navigateToChart(chart.url)}>{chart.name}</Button>
                    ))}
                </ButtonGroup>
            ))}
        </Box>
    );

}

export const getChartColor = (chartCode: string) => {
    switch (chartCode) {
        case 'APD':
            return 'info';
        case 'DP':
            return 'error';
        case 'STAR':
            return 'success';
        case 'IAP':
            return 'warning';
        case 'GEN':
            return 'secondary';
        default:
            return 'inherit';
    }
}