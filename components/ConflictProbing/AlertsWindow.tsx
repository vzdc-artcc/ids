import React from 'react';
import {AlertAircraft} from "@/types/conflict-probing";
import {Card, CardContent, Typography} from "@mui/material";

export default function AlertsWindow({alerts}: { alerts: AlertAircraft[] }) {

    const redAlerts = alerts.filter(alert => alert.conflict_level === 'RED').sort(
        (a, b) => a.conflict_time_minutes_ahead - b.conflict_time_minutes_ahead
    );
    const yellowAlerts = alerts.filter(alert => alert.conflict_level === 'YELLOW').sort(
        (a, b) => a.conflict_time_minutes_ahead - b.conflict_time_minutes_ahead
    );

    const longestCallsignLength = Math.max(...alerts.map(a => a.callsign.length), 0);

    const padRight = (s: string) => s + ' '.repeat(Math.max(0, longestCallsignLength - s.length));

    return (
        <Card sx={{height: '100%'}}>
            <CardContent>
                <Typography gutterBottom>Active Alerts</Typography>
                {redAlerts.map((a, i) => (
                    <Typography key={`red-alert-${i}`} variant="h6" sx={{color: 'red'}}>
                        <b>
                    <span style={{whiteSpace: 'pre', fontFamily: 'monospace'}}>
                        {padRight(a.callsign)}
                    </span>
                        </b>
                        {' '}| {a.conflict_time_minutes_ahead.toFixed(2) == '0.00' ? 'ACTIVE' : `${a.conflict_time_minutes_ahead.toFixed(2)} MINUTE${a.conflict_time_minutes_ahead.toFixed(2) != '1.00' ? 'S' : ''}`}
                    </Typography>
                ))}
                {yellowAlerts.map((a, i) => (
                    <Typography key={`yellow-alert-${i}`} variant="h6" sx={{color: 'orange'}}>
                        <b>
                    <span style={{whiteSpace: 'pre', fontFamily: 'monospace'}}>
                        {padRight(a.callsign)}
                    </span>
                        </b>
                        {' '}|{' '}
                        <span
                            style={{fontSize: 12,}}>{a.conflict_time_minutes_ahead.toFixed(2) == '0.00' ? 'ACTIVE' : `${a.conflict_time_minutes_ahead.toFixed(2)} MINUTE${a.conflict_time_minutes_ahead.toFixed(2) != '1.00' ? 'S' : ''}`}</span>
                    </Typography>
                ))}
            </CardContent>
        </Card>
    );
}