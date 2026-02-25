import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefreshed, setLastRefreshed] = useState(null);

    const [signals, setSignals] = useState([]);
    const [activeSignalId, setActiveSignalId] = useState(null);
    const [guideStep, setGuideStep] = useState(1);
    const [wsStatus, setWsStatus] = useState({ snapshot: false, signals: false });

    const fetchData = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await axios.get(`${API}/api/v4/snapshot`, { params: { index: "nifty" } });
            if (res.data?.success && res.data.data) {
                const snap = res.data.data;
                const enginePayload = snap.raw || snap;
                setSnapshot(snap);
                setData(enginePayload);
                setLastRefreshed(new Date().toLocaleTimeString());
            } else {
                setError("Failed to fetch V4 snapshot.");
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

    // ── WebSocket wiring for realtime Nifty snapshot & signals ──
    useEffect(() => {
        let snapshotWs;
        let signalsWs;

        const buildWsUrl = (path) => {
            let wsUrl = API;
            if (wsUrl.startsWith("http")) {
                wsUrl = wsUrl.replace(/^http/, "ws") + path;
            } else {
                const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
                const host = window.location.host;
                wsUrl = `${protocol}//${host}${wsUrl}${path}`;
            }
            return wsUrl;
        };

        const connectSnapshotWs = () => {
            try {
                snapshotWs = new WebSocket(buildWsUrl("/ws/v4/nifty"));
                snapshotWs.onopen = () =>
                    setWsStatus((s) => ({ ...s, snapshot: true }));
                snapshotWs.onclose = () => {
                    setWsStatus((s) => ({ ...s, snapshot: false }));
                    // Auto-reconnect with backoff
                    setTimeout(connectSnapshotWs, 5000);
                };
                snapshotWs.onerror = () =>
                    setWsStatus((s) => ({ ...s, snapshot: false }));
                snapshotWs.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.type === "snapshot" && msg.snapshot) {
                            setSnapshot(msg.snapshot);
                            const enginePayload = msg.snapshot.raw || msg.snapshot;
                            setData(enginePayload);
                            setLoading(false);
                        }
                    } catch {
                        // ignore malformed payload
                    }
                };
            } catch {
                setWsStatus((s) => ({ ...s, snapshot: false }));
            }
        };

        const connectSignalsWs = () => {
            try {
                signalsWs = new WebSocket(buildWsUrl("/ws/v4/signals?index=nifty"));
                signalsWs.onopen = () =>
                    setWsStatus((s) => ({ ...s, signals: true }));
                signalsWs.onclose = () => {
                    setWsStatus((s) => ({ ...s, signals: false }));
                    setTimeout(connectSignalsWs, 7000);
                };
                signalsWs.onerror = () =>
                    setWsStatus((s) => ({ ...s, signals: false }));
                signalsWs.onmessage = (event) => {
                    try {
                        const msg = JSON.parse(event.data);
                        if (msg.type === "signal" && msg.signal) {
                            setSignals((prev) => {
                                const next = [...prev, msg.signal];
                                // Auto-focus newest signal in guide
                                const syntheticId = `${msg.signal.index_id}-${msg.signal.created_at}`;
                                setActiveSignalId(syntheticId);
                                setGuideStep(1);
                                // Attach synthetic id for UI selection
                                return next
                                    .map((s) => ({
                                        ...s,
                                        _id: `${s.index_id}-${s.created_at}`,
                                    }))
                                    .slice(-50);
                            });
                        }
                    } catch {
                        // ignore malformed payload
                    }
                };
            } catch {
                setWsStatus((s) => ({ ...s, signals: false }));
            }
        };

        connectSnapshotWs();
        connectSignalsWs();

        return () => {
            if (snapshotWs) snapshotWs.close();
            if (signalsWs) signalsWs.close();
        };
    }, []);

    const activeSignal = useMemo(() => {
        if (!signals.length) return null;
        const withIds = signals.map((s) => ({
            ...s,
            _id: s._id || `${s.index_id}-${s.created_at}`,
        }));
        if (activeSignalId) {
            return withIds.find((s) => s._id === activeSignalId) || withIds[withIds.length - 1];
        }
        return withIds[withIds.length - 1];
    }, [signals, activeSignalId]);

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

    const RealtimeStrip = () => {
        const lastPrice = snapshot?.last_price ?? data?.ltp ?? null;
        const regimeLabel = snapshot?.regime || regime;
        const wsHealthy = wsStatus.snapshot && wsStatus.signals;

        const now = new Date();
        const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        const istDisplay = istNow.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const day = istNow.getDay(); // 0-6, Sun-Sat
        const hour = istNow.getHours();
        const minute = istNow.getMinutes();
        const isWeekday = day >= 1 && day <= 5;
        const afterOpen = hour > 9 || (hour === 9 && minute >= 15);
        const beforeClose = hour < 15 || (hour === 15 && minute <= 30);
        const marketLive = isWeekday && afterOpen && beforeClose;

        return (
            <Box sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 1,
                border: `1px solid ${tvColors.grid}`,
                bgcolor: '#10151b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <RadioButtonChecked sx={{ fontSize: 14, color: wsHealthy ? tvColors.green : tvColors.accentOrange }} />
                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}>
                        NIFTY 50
                    </Typography>
                    {lastPrice && (
                        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', fontWeight: 900 }}>
                            ₹{lastPrice.toFixed(2)}
                        </Typography>
                    )}
                    <Chip
                        label={regimeLabel}
                        size="small"
                        sx={{
                            ml: 1,
                            height: 20,
                            fontSize: '0.6rem',
                            fontFamily: '"JetBrains Mono", monospace',
                            bgcolor: '#1f2833'
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Chip
                        label={`CONFIDENCE: ${confidence}`}
                        size="small"
                        sx={{
                            height: 22,
                            fontSize: '0.6rem',
                            fontFamily: '"JetBrains Mono", monospace',
                            bgcolor: 'rgba(255,154,0,0.12)',
                            border: `1px solid ${tvColors.accentOrange}55`,
                            color: tvColors.accentOrange
                        }}
                    />
                    <Chip
                        label={marketLive ? 'MARKET LIVE' : 'MARKET CLOSED'}
                        size="small"
                        sx={{
                            height: 22,
                            fontSize: '0.6rem',
                            fontFamily: '"JetBrains Mono", monospace',
                            bgcolor: marketLive ? 'rgba(0,200,83,0.12)' : 'rgba(138,148,160,0.16)',
                            border: `1px solid ${marketLive ? tvColors.green : tvColors.textDim}55`,
                            color: marketLive ? tvColors.green : tvColors.textDim
                        }}
                    />
                    {lastRefreshed && (
                        <>
                            <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', color: tvColors.textDim }}>
                                {istDisplay} · IST
                            </Typography>
                            <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', color: tvColors.textDim }}>
                                LAST SNAPSHOT · {lastRefreshed}
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>
        );
    };

    const SignalTimeline = () => {
        const withIds = (signals || []).map((s) => ({
            ...s,
            _id: s._id || `${s.index_id}-${s.created_at}`,
        })).slice(-20);
        if (!withIds.length) {
            return (
                <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color: tvColors.textDim }}>
                    Waiting for first V4 signal...
                </Typography>
            );
        }
        return (
            <Box sx={{ maxHeight: 260, overflowY: 'auto' }}>
                {withIds.map((s) => {
                    const isActive = activeSignal && activeSignal._id === s._id;
                    const color = s.action === 'BUY' ? tvColors.green : s.action === 'SELL' ? tvColors.red : tvColors.textDim;
                    return (
                        <Box
                            key={s._id}
                            onClick={() => {
                                setActiveSignalId(s._id);
                                setGuideStep(1);
                            }}
                            sx={{
                                mb: 1,
                                p: 1,
                                borderRadius: 1,
                                border: `1px solid ${isActive ? color : tvColors.grid}`,
                                bgcolor: isActive ? 'rgba(15,187,120,0.08)' : 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color }}>
                                {s.action} · {s.confidence} · {(s.score ?? 0).toFixed(2)}
                            </Typography>
                            <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', color: tvColors.textDim }}>
                                {new Date(s.created_at).toLocaleTimeString()}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        );
    };

    const TradingGuidePanel = () => {
        const signal = activeSignal;
        const hasSignal = !!signal;
        const stepLabels = [
            "1. Understand context",
            "2. Validate checklist",
            "3. Execute or skip",
            "4. Post-trade review"
        ];

        return (
            <Paper sx={{ p: 2, bgcolor: tvColors.panelBg, height: '100%', borderRadius: 1, border: `1px solid ${tvColors.grid}` }}>
                <CardHeader title="Trading Guide" />
                {!hasSignal && (
                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color: tvColors.textDim }}>
                        No active signal selected. The next V4 signal will appear here with a guided checklist.
                    </Typography>
                )}
                {hasSignal && (
                    <>
                        <Chip
                            label={`${signal.action} · ${signal.confidence}`}
                            size="small"
                            sx={{
                                mb: 1.5,
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: '0.65rem',
                                bgcolor: 'rgba(0,200,83,0.08)',
                                border: `1px solid ${tvColors.green}40`,
                                color: tvColors.green
                            }}
                        />
                        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', color: tvColors.textDim, mb: 1 }}>
                            {signal.reasoning_text || 'Review the structured reasoning in the main panel, then step through this flow.'}
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem', color: tvColors.textDim, mb: 0.5 }}>
                            CURRENT STEP
                        </Typography>
                        <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem', mb: 1 }}>
                            {stepLabels[guideStep - 1]}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            {stepLabels.map((label, idx) => (
                                <Box
                                    key={label}
                                    onClick={() => setGuideStep(idx + 1)}
                                    sx={{
                                        flex: 1,
                                        p: 0.5,
                                        borderRadius: 1,
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        bgcolor: guideStep === idx + 1 ? 'rgba(255,154,0,0.16)' : 'transparent',
                                        border: `1px solid ${guideStep === idx + 1 ? tvColors.accentOrange : tvColors.grid}`
                                    }}
                                >
                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.6rem', color: tvColors.textDim }}>
                                        {idx + 1}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            {guideStep === 1 && (
                                <>
                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', mb: 1 }}>
                                        Context checklist
                                    </Typography>
                                    <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                        <li><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem' }}>Session regime &amp; day quality align with your playbook.</Typography></li>
                                        <li><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem' }}>Dealer / PCR veto is not flashing a hard conflict.</Typography></li>
                                    </ul>
                                </>
                            )}
                            {guideStep === 2 && (
                                <>
                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', mb: 1 }}>
                                        Execution checklist
                                    </Typography>
                                    <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                        <li><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem' }}>Size position as per risk plan (1–2% per trade).</Typography></li>
                                        <li><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem' }}>Place SL near suggested level, do not move wider.</Typography></li>
                                        <li><Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem' }}>Avoid chasing if price has already moved &gt;½ ATR.</Typography></li>
                                    </ul>
                                </>
                            )}
                            {guideStep === 3 && (
                                <>
                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', mb: 1 }}>
                                        Execute or stand aside
                                    </Typography>
                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem', color: tvColors.textDim }}>
                                        Decide whether this setup cleanly matches your playbook. If anything feels forced, skip and wait for the next aligned signal.
                                    </Typography>
                                </>
                            )}
                            {guideStep === 4 && (
                                <>
                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem', mb: 1 }}>
                                        Post-trade notes
                                    </Typography>
                                    <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.65rem', color: tvColors.textDim, mb: 1 }}>
                                        After the trade completes, jot down 1–2 lines on execution quality and emotional state. This helps the attribution engine context and your personal iteration loop.
                                    </Typography>
                                </>
                            )}
                        </Box>
                    </>
                )}
            </Paper>
        );
    };

    return (
        <Zoom in={true}>
            <Box sx={{ p: 2, bgcolor: tvColors.bg, color: tvColors.text, borderRadius: 2, minHeight: '80vh', border: `1px inset ${tvColors.grid}` }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: '"JetBrains Mono", monospace', letterSpacing: -0.5 }}>
                            INSTITUTIONAL SIGNAL ENGINE V4.0
                        </Typography>
                        <Typography variant="caption" sx={{ color: tvColors.textDim, fontFamily: '"JetBrains Mono", monospace' }}>
                            LIVE LIQUIDITY ENGINE · NIFTY FOCUS
                        </Typography>
                    </Box>
                    <Chip label="LIVE CONNECTED" size="small" sx={{ bgcolor: tvColors.green, color: '#fff', fontWeight: 'bold', fontSize: '0.6rem', fontFamily: '"JetBrains Mono", monospace' }} />
                </Box>

                <RealtimeStrip />

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

                {/* Signal timeline + trading guide */}
                <Box sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 2, bgcolor: tvColors.panelBg, borderRadius: 1, border: `1px solid ${tvColors.grid}` }}>
                                <CardHeader title="V4 Signal Timeline" />
                                <SignalTimeline />
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TradingGuidePanel />
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Zoom>
    );
}
