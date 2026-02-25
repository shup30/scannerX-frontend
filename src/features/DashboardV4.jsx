import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Grid, Paper, Chip, LinearProgress, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Zoom, CircularProgress, Alert
} from '@mui/material';
import {
    TrendingUp, TrendingDown, ShowChart, WarningAmber,
    CheckCircle, RadioButtonChecked, AccountBalance, Speed
} from '@mui/icons-material';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function DashboardV4() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await axios.get(`${API}/api/index/v4/analyze`, { params: { index: "nifty", interval: "5", days: 5 } });
            if (res.data?.success) {
                setData(res.data.data);
                setLastRefreshed(new Date().toLocaleTimeString());
            } else {
                setError("Failed to fetch V4 data.");
            }
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "Network error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const iv = setInterval(fetchData, 60000);
        return () => clearInterval(iv);
    }, [fetchData]);

    if (error) {
        return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;
    }

    if (!data) {
        return (
            <Box sx={{ p: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress color="primary" />
                <Typography sx={{ ml: 2, color: 'text.secondary' }}>Initializing AI V4 Engine...</Typography>
            </Box>
        );
    }

    // Mapping real data to the UI structures
    const gated = data.signal_summary?.gated_signal || {};
    const action = gated.action || "NEUTRAL";
    const confidence = gated.confidence || "MEDIUM";
    const targetPrice = gated.target_price || "N/A";
    const stopLoss = gated.stop_loss || "N/A";
    const rrRatio = "N/A"; // Could compute if entry is known
    const reasoningText = gated.reason || "Neutral market state.";

    const dayQualityScore = data.day_character?.day_quality_score || 0.5;
    const dayQuality = data.day_character?.day_quality || "UNKNOWN";

    const sessionCharScore = data.session_context?.session_risk_modifier || 0.5;
    const regime = data.market_regime || "TRANSITIONING";

    const ofiDelta = data.liquidity_context?.ofi_delta || 0;
    const ofiDir = ofiDelta > 0 ? "BUY" : ofiDelta < 0 ? "SELL" : "NEUTRAL";

    const instScorer = data.institutional_signal || {};
    const pcrVetoActive = instScorer.veto?.active || false;
    const writerBias = instScorer.veto?.reason || "CLEARED";
    const pillarsMet = instScorer.components ? Object.entries(instScorer.components)
        .filter(([k, v]) => v.action && v.action !== "NEUTRAL")
        .map(([k, v]) => `${k.toUpperCase()} (${v.action})`) : [];

    const flowCtx = data.flow_context || {};
    const heavyHitterFlag = flowCtx.heavy_hitter_detected || false;
    const hhTicker = heavyHitterFlag ? Object.keys(flowCtx.notable_flows || {})[0] : "";

    // Fallback dictionary for dynamic micro-weights based on regime
    const microWeights = {
        trend: regime === "TRENDING" ? 0.45 : 0.20,
        vwap_sr: regime === "RANGING" ? 0.40 : 0.20,
        momentum: 0.25,
        options: 0.10
    };

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
                                        value={action}
                                        valColor={action === 'BUY' ? tvColors.green : action === 'SELL' ? tvColors.red : tvColors.text}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TerminalValue label="CONFIDENCE" value={confidence} valColor={tvColors.accentOrange} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TerminalValue label="EST. TARGET" value={targetPrice} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <TerminalValue label="STOP LOSS" value={stopLoss} sub={`RR: ${rrRatio}`} />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3 }}>
                                <Typography sx={{ color: tvColors.textDim, fontSize: '0.65rem', fontFamily: '"JetBrains Mono", monospace', mb: 1 }}>STRUCTURED REASONING</Typography>
                                <Typography sx={{ fontSize: '0.85rem', color: tvColors.text, lineHeight: 1.5, fontFamily: '"JetBrains Mono", monospace' }}>
                                    {reasoningText}
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {pillarsMet.length > 0 ? pillarsMet.map(p => (
                                        <Chip key={p} label={p} size="small" sx={{ bgcolor: 'rgba(0,200,83,0.1)', color: tvColors.green, border: `1px solid ${tvColors.green}40`, fontSize: '0.6rem', fontFamily: '"JetBrains Mono", monospace' }} />
                                    )) : <Typography variant="caption" color="text.disabled">No Pillars Aligned</Typography>}
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Day Quality Bar */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, bgcolor: tvColors.panelBg, height: '100%', borderRadius: 1, border: `1px solid ${tvColors.grid}` }}>
                            <CardHeader title="Day Quality" />
                            <Box sx={{ textAlign: 'center', my: 2 }}>
                                <Speed sx={{ fontSize: 64, color: dayQualityScore > 0.6 ? tvColors.green : tvColors.accentOrange, mb: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: '"JetBrains Mono", monospace' }}>
                                    {(dayQualityScore * 100).toFixed(0)}
                                </Typography>
                                <Typography sx={{ color: tvColors.textDim, fontSize: '0.7rem', fontFamily: '"JetBrains Mono", monospace', letterSpacing: 1 }}>
                                    {dayQuality}
                                </Typography>
                            </Box>
                            <Box sx={{ px: 2 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={dayQualityScore * 100}
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
                            <TerminalValue label="SESSION CHARACTER" value={`${(sessionCharScore * 100).toFixed(0)}%`} valColor={tvColors.green} />
                            <Box sx={{ mt: 2 }}>
                                {Object.entries(microWeights).map(([k, v]) => (
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
                                    <TerminalValue label="OFI DELTA" value={ofiDelta.toFixed(3)} valColor={ofiDir === 'BUY' ? tvColors.green : ofiDir === 'SELL' ? tvColors.red : tvColors.textDim} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TerminalValue label="HEAVY HITTER" value={heavyHitterFlag ? "DETECTED" : "NONE"} valColor={heavyHitterFlag ? tvColors.accentOrange : tvColors.textDim} sub={heavyHitterFlag ? `${hhTicker}` : ''} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TerminalValue label="PCR VETO" value={pcrVetoActive ? "ACTIVE" : "CLEARED"} valColor={pcrVetoActive ? tvColors.red : tvColors.textDim} sub={`Bias: ${writerBias}`} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TerminalValue label="EXPIRY PHASE" value={data.expiry_context?.phase || "UNKNOWN"} valColor={tvColors.text} sub={`Dealer Bias: ${data.expiry_context?.dealer_bias || 'N/A'}`} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                </Grid>
            </Box>
        </Zoom>
    );
}
