import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Box, Typography, Card, CardContent, Grid, Chip, Tooltip, Alert,
    useTheme, CircularProgress, LinearProgress,
} from "@mui/material";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const BIAS_COLOR = {
    BULLISH: "success",
    BEARISH: "error",
    NEUTRAL: "warning",
};

const SEVERITY_ICON = {
    HIGH: "🔴",
    MEDIUM: "🟡",
    LOW: "⚪",
};

/* ── OI Bar — visual horizontal bar for Call vs Put OI ── */
const OIBar = ({ callOI, putOI, maxOI }) => {
    const total = maxOI || 1;
    const cw = (callOI / total) * 100;
    const pw = (putOI / total) * 100;
    return (
        <Box sx={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", width: "100%" }}>
            <Box sx={{ width: `${cw}%`, bgcolor: "error.main", opacity: 0.7, transition: "width 0.4s" }} />
            <Box sx={{ flex: 1, bgcolor: "rgba(150,150,150,0.1)" }} />
            <Box sx={{ width: `${pw}%`, bgcolor: "success.main", opacity: 0.7, transition: "width 0.4s" }} />
        </Box>
    );
};

/* ── Comparison Delta Chip ── */
const DeltaChip = ({ value, suffix = "", invert = false }) => {
    if (value === undefined || value === null) return <Chip size="small" label="—" sx={{ height: 18, fontSize: "0.55rem" }} />;
    const positive = invert ? value < 0 : value > 0;
    const color = positive ? "success" : value === 0 ? "default" : "error";
    const prefix = value > 0 ? "+" : "";
    return (
        <Chip
            size="small"
            label={`${prefix}${typeof value === "number" ? value.toLocaleString("en-IN", { maximumFractionDigits: 4 }) : value}${suffix}`}
            color={color}
            variant="outlined"
            sx={{ height: 18, fontSize: "0.55rem", fontWeight: "bold" }}
        />
    );
};

/* ═══════════════════════════════════════════════════════════════════ */
export default function OptionChainWidget({ selectedIndex }) {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(300);
    const intervalRef = useRef(null);
    const countdownRef = useRef(null);

    const glass = {
        background: isDark ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
        boxShadow: theme.shadows[4],
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: theme.shadows[8] },
    };

    const fetchOC = useCallback(async () => {
        const idx = (selectedIndex || "nifty").toLowerCase();
        if (!["nifty", "banknifty"].includes(idx)) return;
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API}/api/index/option-chain`, { params: { index: idx } });
            if (res.data?.success) {
                setData(res.data.data);
            } else {
                setError("Failed to load option chain data");
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Option chain unavailable");
        } finally {
            setLoading(false);
            setCountdown(300);
        }
    }, [selectedIndex]);

    useEffect(() => {
        fetchOC();
        intervalRef.current = setInterval(fetchOC, 300000); // 5 min
        countdownRef.current = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
        return () => {
            clearInterval(intervalRef.current);
            clearInterval(countdownRef.current);
        };
    }, [fetchOC]);

    // Don't render for sensex
    if ((selectedIndex || "").toLowerCase() === "sensex") return null;

    if (loading && !data) {
        return (
            <Card sx={{ ...glass, mb: 3 }}>
                <CardContent sx={{ textAlign: "center", py: 4 }}>
                    <CircularProgress size={30} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>Loading option chain...</Typography>
                </CardContent>
            </Card>
        );
    }

    if (!data || !data.available) {
        return (
            <Card sx={{ ...glass, mb: 3 }}>
                <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">🔗 Option Chain Analysis</Typography>
                    <Alert severity="info" sx={{ mt: 1, fontSize: "0.75rem" }}>
                        {data?.message || error || "Option chain data is available during market hours (9:15–15:30 IST) for NIFTY and BANKNIFTY."}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const { current, comparisons, signals, composite_signal, oi_based_levels, strike_data, expiry, market_intelligence } = data;
    if (!current) return null;

    const maxOI = Math.max(
        ...((strike_data || []).map((s) => Math.max(s.call_oi || 0, s.put_oi || 0))),
        1
    );

    const formatNum = (n) => {
        if (n >= 10000000) return (n / 10000000).toFixed(2) + " Cr";
        if (n >= 100000) return (n / 100000).toFixed(2) + " L";
        if (n >= 1000) return (n / 1000).toFixed(1) + " K";
        return n?.toLocaleString("en-IN") || "0";
    };

    const countdownMins = Math.floor(countdown / 60);
    const countdownSecs = countdown % 60;

    return (
        <Card sx={{ ...glass, mb: 3 }}>
            {loading && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />}
            <CardContent>
                {/* ── Header ── */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">🔗 Option Chain Analysis</Typography>
                        <Chip size="small" label={composite_signal} color={BIAS_COLOR[composite_signal] || "default"} sx={{ fontWeight: "bold" }} />
                        {market_intelligence?.structure && (
                            <Chip
                                size="small"
                                label={market_intelligence.structure.replace("_", " ")}
                                color={market_intelligence.structure.includes("BULLISH") ? "success" : market_intelligence.structure.includes("BEARISH") ? "error" : "primary"}
                                variant="outlined"
                                sx={{ fontWeight: "bold", borderWidth: 2 }}
                            />
                        )}
                        {expiry && <Chip size="small" label={`Exp: ${expiry}`} variant="outlined" sx={{ fontSize: "0.55rem", height: 20 }} />}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem" }}>
                            Next: {countdownMins}:{countdownSecs.toString().padStart(2, "0")}
                        </Typography>
                        <Tooltip title="Click to refresh now" arrow>
                            <Chip size="small" label="⟳" onClick={fetchOC} sx={{ cursor: "pointer", height: 20, fontSize: "0.7rem" }} />
                        </Tooltip>
                    </Box>
                </Box>

                {/* ── Institutional Edge Alerts ── */}
                {market_intelligence?.setup && market_intelligence.setup !== "NONE" && (
                    <Box sx={{ mb: 2 }}>
                        <Alert
                            severity={market_intelligence.setup.includes("BULL_TRAP") || market_intelligence.setup.includes("RESISTANCE") ? "error" : "success"}
                            variant="filled"
                            sx={{
                                py: 0,
                                '& .MuiAlert-message': { py: 1, fontSize: "0.75rem", fontWeight: "bold" }
                            }}
                        >
                            INSTITUTIONAL SETUP DETECTED: {market_intelligence.setup.replace(/_/g, " ")}
                        </Alert>
                    </Box>
                )}

                {/* ── Key Metrics Row ── */}
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    {[
                        { label: "PCR (OI)", value: current.pcr?.toFixed(4), tip: "Put-Call Ratio by Open Interest. >1 = bullish, <0.7 = bearish", color: current.pcr > 1 ? "success.main" : current.pcr < 0.7 ? "error.main" : "warning.main" },
                        { label: "Vol PCR", value: current.volume_pcr?.toFixed(4), tip: "Put-Call Ratio by Volume", color: current.volume_pcr > 1 ? "success.main" : "text.secondary" },
                        { label: "Max Pain", value: `₹${current.max_pain?.toLocaleString("en-IN")}`, tip: "Strike price where option writers have minimum loss", color: "primary.main" },
                        { label: "OI Resistance", value: `₹${oi_based_levels?.resistance?.toLocaleString("en-IN")}`, tip: "Highest Call OI strike — acts as resistance", color: "error.main" },
                        { label: "OI Support", value: `₹${oi_based_levels?.support?.toLocaleString("en-IN")}`, tip: "Highest Put OI strike — acts as support", color: "success.main" },
                        { label: "IV Skew", value: `${current.iv_skew > 0 ? "+" : ""}${current.iv_skew?.toFixed(2)}%`, tip: "Put IV minus Call IV. +ve = fear (bearish skew)", color: current.iv_skew > 0 ? "error.main" : "success.main" },
                    ].map(({ label, value, tip, color }) => (
                        <Grid item xs={4} sm={2} key={label}>
                            <Tooltip title={tip} arrow placement="top">
                                <Box sx={{ textAlign: "center", p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)", cursor: "help" }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.55rem", display: "block" }}>{label}</Typography>
                                    <Typography variant="body2" fontWeight="bold" sx={{ color, fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem" }}>{value}</Typography>
                                </Box>
                            </Tooltip>
                        </Grid>
                    ))}
                </Grid>

                {/* ── Comparison Deltas ── */}
                {Object.keys(comparisons || {}).length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 1 }}>CHANGE COMPARISON</Typography>
                        <Grid container spacing={1}>
                            {["5m", "15m", "1h"].map((tf) => {
                                const comp = comparisons[tf];
                                if (!comp?.available) return (
                                    <Grid item xs={4} key={tf}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.02)", textAlign: "center" }}>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary">{comp?.label || tf}</Typography>
                                            <Typography variant="caption" color="text.disabled" sx={{ display: "block", fontSize: "0.5rem" }}>No data yet</Typography>
                                        </Box>
                                    </Grid>
                                );
                                return (
                                    <Grid item xs={4} key={tf}>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.02)" }}>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>{comp.label}</Typography>
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.5rem" }}>PCR</Typography>
                                                    <DeltaChip value={comp.pcr_change} />
                                                </Box>
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.5rem" }}>Max Pain</Typography>
                                                    <DeltaChip value={comp.max_pain_change} />
                                                </Box>
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.5rem" }}>Net OI</Typography>
                                                    <DeltaChip value={comp.net_oi_change} />
                                                </Box>
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.5rem" }}>IV Skew</Typography>
                                                    <DeltaChip value={comp.iv_skew_change} suffix="%" invert />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                )}

                {/* ── Signals ── */}
                {signals && signals.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 1 }}>SIGNALS</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            {signals.slice(0, 8).map((sig, i) => (
                                <Tooltip key={i} title={sig.description} arrow placement="top" slotProps={{ tooltip: { sx: { maxWidth: 300, whiteSpace: "pre-line" } } }}>
                                    <Box sx={{
                                        display: "flex", alignItems: "center", gap: 1, p: 0.8, borderRadius: 1.5, cursor: "help",
                                        bgcolor: sig.bias === "BULLISH" ? "rgba(76,175,80,0.06)" : sig.bias === "BEARISH" ? "rgba(244,67,54,0.06)" : "transparent",
                                        borderLeft: "3px solid",
                                        borderColor: sig.bias === "BULLISH" ? "success.main" : sig.bias === "BEARISH" ? "error.main" : "divider",
                                        transition: "background 0.15s",
                                        "&:hover": { bgcolor: sig.bias === "BULLISH" ? "rgba(76,175,80,0.12)" : sig.bias === "BEARISH" ? "rgba(244,67,54,0.12)" : "rgba(0,0,0,0.04)" },
                                    }}>
                                        <Typography variant="caption" sx={{ fontSize: "0.55rem" }}>{SEVERITY_ICON[sig.severity] || "⚪"}</Typography>
                                        <Chip size="small" label={sig.bias} color={BIAS_COLOR[sig.bias] || "default"} sx={{ height: 16, fontSize: "0.5rem", fontWeight: "bold" }} />
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem", flex: 1 }}>{sig.label}</Typography>
                                        <Chip size="small" label={sig.timeframe} variant="outlined" sx={{ height: 16, fontSize: "0.45rem" }} />
                                    </Box>
                                </Tooltip>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* ── OI Distribution Table ── */}
                {strike_data && strike_data.length > 0 && (
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 0.5 }}>OI DISTRIBUTION (±10 strikes)</Typography>
                        <Box sx={{ maxHeight: 280, overflowY: "auto", fontSize: "0.6rem" }}>
                            {/* Header */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, p: 0.5, borderBottom: "1px solid", borderColor: "divider", position: "sticky", top: 0, bgcolor: isDark ? "rgba(17,24,39,0.95)" : "rgba(255,255,255,0.95)", zIndex: 1 }}>
                                <Typography variant="caption" sx={{ width: 55, textAlign: "right", fontSize: "0.5rem", color: "error.main", fontWeight: "bold" }}>Call OI</Typography>
                                <Typography variant="caption" sx={{ width: 40, textAlign: "right", fontSize: "0.5rem", color: "error.main" }}>Δ OI</Typography>
                                <Typography variant="caption" sx={{ width: 30, textAlign: "right", fontSize: "0.5rem", color: "text.disabled" }}>IV</Typography>
                                <Box sx={{ flex: 1, textAlign: "center" }}>
                                    <Typography variant="caption" sx={{ fontSize: "0.5rem", fontWeight: "bold" }}>Call OI ◄ Strike ► Put OI</Typography>
                                </Box>
                                <Typography variant="caption" sx={{ width: 30, textAlign: "left", fontSize: "0.5rem", color: "text.disabled" }}>IV</Typography>
                                <Typography variant="caption" sx={{ width: 40, textAlign: "left", fontSize: "0.5rem", color: "success.main" }}>Δ OI</Typography>
                                <Typography variant="caption" sx={{ width: 55, textAlign: "left", fontSize: "0.5rem", color: "success.main", fontWeight: "bold" }}>Put OI</Typography>
                            </Box>
                            {/* Rows */}
                            {strike_data.map((row) => (
                                <Box
                                    key={row.strike}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 0.5, py: 0.3, px: 0.5, borderRadius: 0.5,
                                        bgcolor: row.is_atm ? (isDark ? "rgba(33,150,243,0.12)" : "rgba(33,150,243,0.08)") : "transparent",
                                        borderBottom: "1px solid", borderColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                                    }}
                                >
                                    <Typography variant="caption" sx={{ width: 55, textAlign: "right", fontSize: "0.55rem", fontFamily: "'JetBrains Mono',monospace", color: "error.main" }}>
                                        {formatNum(row.call_oi)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ width: 40, textAlign: "right", fontSize: "0.5rem", fontFamily: "'JetBrains Mono',monospace", color: row.call_oi_change > 0 ? "error.main" : row.call_oi_change < 0 ? "success.main" : "text.disabled" }}>
                                        {row.call_oi_change > 0 ? "+" : ""}{formatNum(row.call_oi_change)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ width: 30, textAlign: "right", fontSize: "0.5rem", color: "text.disabled" }}>
                                        {row.call_iv ? row.call_iv.toFixed(1) : "—"}
                                    </Typography>
                                    {/* Center: OI bar + strike */}
                                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", px: 0.5 }}>
                                        <OIBar callOI={row.call_oi} putOI={row.put_oi} maxOI={maxOI} />
                                        <Typography variant="caption" sx={{
                                            fontSize: "0.6rem", fontWeight: row.is_atm ? "bold" : "normal",
                                            fontFamily: "'JetBrains Mono',monospace",
                                            color: row.is_atm ? "primary.main" : "text.primary",
                                        }}>
                                            {row.strike.toLocaleString("en-IN")}
                                            {row.is_atm && " ◄ ATM"}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ width: 30, textAlign: "left", fontSize: "0.5rem", color: "text.disabled" }}>
                                        {row.put_iv ? row.put_iv.toFixed(1) : "—"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ width: 40, textAlign: "left", fontSize: "0.5rem", fontFamily: "'JetBrains Mono',monospace", color: row.put_oi_change > 0 ? "success.main" : row.put_oi_change < 0 ? "error.main" : "text.disabled" }}>
                                        {row.put_oi_change > 0 ? "+" : ""}{formatNum(row.put_oi_change)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ width: 55, textAlign: "left", fontSize: "0.55rem", fontFamily: "'JetBrains Mono',monospace", color: "success.main" }}>
                                        {formatNum(row.put_oi)}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 1 }}>
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.45rem" }}>🔴 Call OI (Resistance)</Typography>
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.45rem" }}>🟢 Put OI (Support)</Typography>
                        </Box>
                    </Box>
                )}

                {/* ── Top OI Changes ── */}
                {(current.top_call_oi_change?.length > 0 || current.top_put_oi_change?.length > 0) && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 0.5 }}>TOP OI CHANGES</Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="error.main" fontWeight="bold" sx={{ fontSize: "0.5rem" }}>CALLS (Resistance Build)</Typography>
                                {(current.top_call_oi_change || []).slice(0, 3).map((c, i) => (
                                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 0.2 }}>
                                        <Typography variant="caption" sx={{ fontSize: "0.55rem", fontFamily: "'JetBrains Mono',monospace" }}>{c.strike.toLocaleString("en-IN")}</Typography>
                                        <Typography variant="caption" sx={{ fontSize: "0.55rem", fontFamily: "'JetBrains Mono',monospace", color: c.oi_change > 0 ? "error.main" : "success.main" }}>
                                            {c.oi_change > 0 ? "+" : ""}{formatNum(c.oi_change)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="success.main" fontWeight="bold" sx={{ fontSize: "0.5rem" }}>PUTS (Support Build)</Typography>
                                {(current.top_put_oi_change || []).slice(0, 3).map((p, i) => (
                                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", py: 0.2 }}>
                                        <Typography variant="caption" sx={{ fontSize: "0.55rem", fontFamily: "'JetBrains Mono',monospace" }}>{p.strike.toLocaleString("en-IN")}</Typography>
                                        <Typography variant="caption" sx={{ fontSize: "0.55rem", fontFamily: "'JetBrains Mono',monospace", color: p.oi_change > 0 ? "success.main" : "error.main" }}>
                                            {p.oi_change > 0 ? "+" : ""}{formatNum(p.oi_change)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Grid>
                        </Grid>
                    </Box>
                )}

                <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1.5, fontStyle: "italic", fontSize: "0.48rem" }}>
                    Option chain data from DhanHQ. Auto-refreshes every 5 minutes during market hours. Not financial advice.
                </Typography>
            </CardContent>
        </Card>
    );
}
