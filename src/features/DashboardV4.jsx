import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Paper, Chip, LinearProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Zoom
} from '@mui/material';
import {
    TrendingUp, TrendingDown, ShowChart, WarningAmber,
    CheckCircle, RadioButtonChecked, AccountBalance, Speed
} from '@mui/icons-material';

// --- MOCK V4 METRICS FIXTURE ---
const MOCK_FIXTURE = {
    signal_output: {
        action: "BUY",
        confidence: "HIGH",
        score: 0.85,
        pillars_met: ["MOMENTUM", "VOLUME_CONFIRMATION", "OFI_EXPANSION"],
        red_flags: [],
        suggested_sl: 104.2,
        suggested_target: 350.5,
        rr_ratio: 2.5,
        day_quality: "ACTIVE_DAY",
        day_quality_score: 0.82,
        reasoning_text: "High alignment across momentum and options data with robust day quality."
    },
    micro_adaptation: {
        session_character_score: 0.75,
        weights: {
            trend: 0.35,
            vwap_sr: 0.20,
            momentum: 0.30,
            options: 0.15
        }
    },
    heavy_hitters: {
        flag: true,
        ticker: "HDFCBANK",
        volume_ratio: 4.2
    },
    ofi_delta: {
        direction: "BUY",
        delta: 0.68
    },
    pcr_veto: {
        veto_active: false,
        velocity: 1.5,
        writer_bias: "CALL_UNWIND"
    },
    expiry_regime: {
        phase: "MID_CYCLE",
        dealer_bias: -0.1
    }
};

export default function DashboardV4() {
    const [data, setData] = useState(MOCK_FIXTURE);
    const [loading, setLoading] = useState(false);

    // Bloomberg Terminal Dark Theme palette overrides
    const tvColors = {
        bg: '#0F1317',             // Deep matte dark grey
        panelBg: '#181C21',        // Slightly lighter grey for panels
        text: '#E1E4E8',           // Off-white text
        textDim: '#8A94A0',        // Lighter grey text
        accentOrange: '#FF9A00',   // Terminal orange
        grid: '#242830',           // Subtle borders
        green: '#00C853',
        red: '#FF3D00'
    };

    const CardHeader = ({ title }) => (
        <Box sx={{ borderBottom: `1px solid ${tvColors.grid}`, pb: 1, mb: 2, display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{
                fontFamily: '"JetBrains Mono", monospace',
                color: tvColors.accentOrange,
                fontWeight: 'bold',
                letterSpacing: 1
            }}>
                {title.toUpperCase()}
            </Typography>
        </Box>
    );

    const TerminalValue = ({ label, value, valColor = tvColors.text, sub }) => (
        <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ color: tvColors.textDim, fontSize: '0.65rem', fontFamily: '"JetBrains Mono", monospace' }}>
                {label}
            </Typography>
            <Typography sx={{ color: valColor, fontSize: '1.2rem', fontWeight: 900, fontFamily: '"JetBrains Mono", monospace' }}>
                {value}
            </Typography>
            {sub && <Typography sx={{ color: tvColors.textDim, fontSize: '0.6rem', fontFamily: '"JetBrains Mono", monospace' }}>{sub}</Typography>}
        </Box>
    );

    return (
        <Zoom in={true}>
            <Box sx={{ p: 2, bgcolor: tvColors.bg, color: tvColors.text, borderRadius: 2, minHeight: '80vh', border: `1px inset ${tvColors.grid}` }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: '"JetBrains Mono", monospace', letterSpacing: -0.5 }}>
                            INSTITUTIONAL SIGNAL ENGINE V4.0
                        </Typography>
                        <Typography variant="caption" sx={{ color: tvColors.textDim, fontFamily: '"JetBrains Mono", monospace' }}>
                            PROTOTYPE PREVIEW · MOCK DATA
                        </Typography>
                    </Box>
                    <Chip label="LIVE CONNECTED" size="small" sx={{ bgcolor: tvColors.green, color: '#fff', fontWeight: 'bold', fontSize: '0.6rem', fontFamily: '"JetBrains Mono", monospace' }} />
                </Box>

                <Grid container spacing={2}>
                    {/* Main Signal Card */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, bgcolor: tvColors.panelBg, height: '100%', borderRadius: 1, border: `1px solid ${tvColors.grid}` }}>
                            <CardHeader title="System Signal" />
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={3}>
                                    <TerminalValue
                                        label="ACTION"
                                        value={data.signal_output.action}
                                        valColor={data.signal_output.action === 'BUY' ? tvColors.green : tvColors.red}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TerminalValue label="CONFIDENCE" value={data.signal_output.confidence} valColor={tvColors.accentOrange} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TerminalValue label="EST. TARGET" value={data.signal_output.suggested_target} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TerminalValue label="STOP LOSS" value={data.signal_output.suggested_sl} sub={`RR: ${data.signal_output.rr_ratio}`} />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3 }}>
                                <Typography sx={{ color: tvColors.textDim, fontSize: '0.65rem', fontFamily: '"JetBrains Mono", monospace', mb: 1 }}>STRUCTURED REASONING</Typography>
                                <Typography sx={{ fontSize: '0.85rem', color: tvColors.text, lineHeight: 1.5, fontFamily: '"JetBrains Mono", monospace' }}>
                                    {data.signal_output.reasoning_text}
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                    {data.signal_output.pillars_met.map(p => (
                                        <Chip key={p} label={p} size="small" sx={{ bgcolor: 'rgba(0,200,83,0.1)', color: tvColors.green, border: `1px solid ${tvColors.green}40`, fontSize: '0.6rem', fontFamily: '"JetBrains Mono", monospace' }} />
                                    ))}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Day Quality Bar */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, bgcolor: tvColors.panelBg, height: '100%', borderRadius: 1, border: `1px solid ${tvColors.grid}` }}>
                            <CardHeader title="Day Quality" />
                            <Box sx={{ textAlign: 'center', my: 2 }}>
                                <Speed sx={{ fontSize: 64, color: data.signal_output.day_quality_score > 0.6 ? tvColors.green : tvColors.accentOrange, mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"JetBrains Mono", monospace' }}>
                                    {(data.signal_output.day_quality_score * 100).toFixed(0)}
                                </Typography>
                                <Typography sx={{ color: tvColors.textDim, fontSize: '0.7rem', fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>
                                    {data.signal_output.day_quality}
                                </Typography>
                            </Box>
                            <Box sx={{ px: 2 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={data.signal_output.day_quality_score * 100}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: tvColors.grid,
                                        '& .MuiLinearProgress-bar': { bgcolor: tvColors.accentOrange }
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Micro-Adaptation Widget */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, bgcolor: tvColors.panelBg, height: '100%', borderRadius: 1, border: `1px solid ${tvColors.grid}` }}>
                            <CardHeader title="Micro-Adaptation" />
                            <TerminalValue label="SESSION CHARACTER" value={`${(data.micro_adaptation.session_character_score * 100).toFixed(0)}%`} valColor={tvColors.green} />
                            <Box sx={{ mt: 2 }}>
                                {Object.entries(data.micro_adaptation.weights).map(([k, v]) => (
                                    <Box key={k} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography sx={{ flex: 1, fontSize: '0.65rem', color: tvColors.textDim, fontFamily: '"JetBrains Mono", monospace' }}>
                                            {k.toUpperCase()}
                                        </Typography>
                                        <Box sx={{ flex: 2, mx: 1 }}>
                                            <LinearProgress variant="determinate" value={v * 100} sx={{ height: 4, bgcolor: tvColors.grid, '& .MuiLinearProgress-bar': { bgcolor: tvColors.text } }} />
                                        </Box>
                                        <Typography sx={{ width: '30px', textAlign: 'right', fontSize: '0.65rem', fontFamily: '"JetBrains Mono", monospace' }}>
                                            {(v * 100).toFixed(0)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* OFI Delta & Institutional Config */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, bgcolor: tvColors.panelBg, height: '100%', borderRadius: 1, border: `1px solid ${tvColors.grid}` }}>
                            <CardHeader title="Flow Dynamics" />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TerminalValue label="OFI DELTA" value={data.ofi_delta.delta} valColor={data.ofi_delta.direction === 'BUY' ? tvColors.green : tvColors.red} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TerminalValue label="HEAVY HITTER" value={data.heavy_hitters.flag ? "DETECTED" : "NONE"} valColor={data.heavy_hitters.flag ? tvColors.accentOrange : tvColors.textDim} sub={data.heavy_hitters.flag ? `${data.heavy_hitters.ticker} (${data.heavy_hitters.volume_ratio}x)` : ''} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TerminalValue label="PCR VETO" value={data.pcr_veto.veto_active ? "ACTIVE" : "CLEARED"} valColor={data.pcr_veto.veto_active ? tvColors.red : tvColors.textDim} sub={`Bias: ${data.pcr_veto.writer_bias}`} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TerminalValue label="EXPIRY PHASE" value={data.expiry_regime.phase} valColor={tvColors.text} sub={`Dealer Bias: ${data.expiry_regime.dealer_bias}`} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                </Grid>
            </Box>
        </Zoom>
    );
}
