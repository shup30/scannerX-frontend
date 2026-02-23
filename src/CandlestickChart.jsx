import React, { useRef, useEffect, useState } from "react";
import { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries, LineSeries } from "lightweight-charts";
import {
    Box, Typography, Card, CardContent, Chip, ToggleButtonGroup, ToggleButton,
    Tooltip, useTheme,
} from "@mui/material";

/**
 * CandlestickChart — Interactive OHLCV chart with indicator overlays
 * and MTF prediction range shading.
 *
 * Props:
 *   candles   - Array of { time, open, high, low, close, volume }
 *   indicators - Object from IndexAnalyzer categories (trend, momentum, etc.)
 *   prediction - MTF prediction for the selected TF (predicted_high/low/close)
 *   price     - Current LTP
 *   indexName - "NIFTY 50" / "BANK NIFTY" / "SENSEX"
 */

// ── Indicator Helpers ──
const calculateEMA = (data, period) => {
    if (!data || data.length === 0) return [];
    const k = 2 / (period + 1);
    let ema = data[0].close;
    return data.map((d, i) => {
        if (i > 0) ema = (d.close * k) + (ema * (1 - k));
        return { time: d.time, value: ema };
    });
};

const calculateVWAP = (data) => {
    let cumVol = 0;
    let cumVWol = 0;
    let currentDay = null;
    return data.map((d) => {
        const dateStr = new Date(d.time * 1000).toDateString();
        // Reset VWAP at the start of each new trading day
        if (dateStr !== currentDay) {
            cumVol = 0;
            cumVWol = 0;
            currentDay = dateStr;
        }
        const typPrice = (d.high + d.low + d.close) / 3;
        const vol = d.volume || 1;
        cumVol += vol;
        cumVWol += typPrice * vol;
        return { time: d.time, value: cumVWol / cumVol };
    });
};

const CandlestickChart = ({ candles, indicators, prediction, price, indexName }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const [overlays, setOverlays] = useState(["ema20", "ema50", "vwap"]);

    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    // Extract indicator values from categories
    const getIndicatorValue = (catKey, name) => {
        const cats = indicators || {};
        const list = cats[catKey] || [];
        const found = list.find((i) => i.name === name);
        return found?.value;
    };

    useEffect(() => {
        if (!chartContainerRef.current || !candles || candles.length === 0) return;

        // Clear previous chart
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const container = chartContainerRef.current;
        const chart = createChart(container, {
            width: container.clientWidth,
            height: 420,
            layout: {
                background: { type: ColorType.Solid, color: isDark ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)" },
                textColor: isDark ? "#d1d5db" : "#374151",
                fontFamily: "'JetBrains Mono', 'Inter', monospace",
                fontSize: 11,
            },
            grid: {
                vertLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
                horzLines: { color: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", style: 0, width: 1 },
                horzLine: { color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)", style: 0, width: 1 },
            },
            rightPriceScale: {
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                scaleMargins: { top: 0.1, bottom: 0.25 },
            },
            timeScale: {
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                timeVisible: true,
                secondsVisible: false,
            },
            handleScale: { axisPressedMouseMove: true },
            handleScroll: { vertTouchDrag: true },
        });
        chartRef.current = chart;

        // ── Candlestick Series ──
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: "#22c55e",
            downColor: "#ef4444",
            borderUpColor: "#16a34a",
            borderDownColor: "#dc2626",
            wickUpColor: "#16a34a",
            wickDownColor: "#dc2626",
        });

        // Normalize timestamps (Dhan returns epoch seconds)
        // Add IST offset (+5:30 = 19800 s) so charting library displays Indian time correctly
        const IST_OFFSET = 19800;
        const normalizedCandles = candles.map((c) => {
            let t = c.time;
            if (typeof t === "number") {
                t = t > 1e12 ? Math.floor(t / 1000) : t;
                t += IST_OFFSET;
            }
            return {
                time: t,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
            };
        });
        candleSeries.setData(normalizedCandles);

        // ── Volume Histogram ──
        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceFormat: { type: "volume" },
            priceScaleId: "volume",
        });
        chart.priceScale("volume").applyOptions({
            scaleMargins: { top: 0.85, bottom: 0 },
        });
        const volumeData = candles.map((c) => {
            let t = c.time;
            if (typeof t === "number") {
                t = t > 1e12 ? Math.floor(t / 1000) : t;
                t += IST_OFFSET;
            }
            return {
                time: t,
                value: c.volume || 0,
                color: c.close >= c.open
                    ? isDark ? "rgba(34,197,94,0.25)" : "rgba(34,197,94,0.35)"
                    : isDark ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.35)",
            };
        });
        volumeSeries.setData(volumeData);

        // ── Indicator Overlays ──
        const emaConfigs = [
            { key: "ema9", name: "EMA (9)", color: "#fbbf24", dash: false, period: 9 },
            { key: "ema20", name: "EMA (20)", color: "#f97316", dash: false, period: 20 },
            { key: "ema50", name: "EMA (50)", color: "#3b82f6", dash: false, period: 50 },
            { key: "ema200", name: "EMA (200)", color: "#a855f7", dash: true, period: 200 },
        ];

        emaConfigs.forEach(({ key, color, dash, period }) => {
            if (!overlays.includes(key)) return;
            const emaData = calculateEMA(normalizedCandles, period);
            if (emaData.length > 0) {
                const ls = chart.addSeries(LineSeries, {
                    color: color,
                    lineWidth: dash ? 1 : 2,
                    lineStyle: dash ? 2 : 0,
                    crosshairMarkerVisible: false,
                    lastValueVisible: false,
                    priceLineVisible: false,
                });
                ls.setData(emaData);
            }
        });

        // VWAP
        if (overlays.includes("vwap")) {
            const vwapData = calculateVWAP(normalizedCandles);
            if (vwapData.length > 0) {
                const ls = chart.addSeries(LineSeries, {
                    color: "#06b6d4",
                    lineWidth: 2,
                    lineStyle: 0,
                    crosshairMarkerVisible: false,
                    lastValueVisible: false,
                    priceLineVisible: false,
                });
                ls.setData(vwapData);
            }
        }

        // Supertrend
        if (overlays.includes("supertrend")) {
            const stVal = getIndicatorValue("trend", "Supertrend (10,3)");
            const stInd = (indicators?.trend || []).find((i) => i.name === "Supertrend (10,3)");
            if (typeof stVal === "number" && stVal > 0) {
                candleSeries.createPriceLine({
                    price: stVal,
                    color: stInd?.signal === "BUY" ? "#22c55e" : "#ef4444",
                    lineWidth: 2,
                    lineStyle: 0,
                    axisLabelVisible: true,
                    title: "ST",
                });
            }
        }

        // Bollinger Bands
        if (overlays.includes("bb")) {
            const bbInd = (indicators?.momentum || []).find((i) => i.name === "Bollinger Bands (20,2)");
            if (bbInd?.value && Array.isArray(bbInd.value) && bbInd.value.length >= 3) {
                const [upper, mid, lower] = bbInd.value;
                [
                    { price: upper, title: "BB+", color: "rgba(139,92,246,0.5)" },
                    { price: mid, title: "BBm", color: "rgba(139,92,246,0.3)" },
                    { price: lower, title: "BB-", color: "rgba(139,92,246,0.5)" },
                ].forEach((line) => {
                    if (typeof line.price === "number") {
                        candleSeries.createPriceLine({
                            price: line.price,
                            color: line.color,
                            lineWidth: 1,
                            lineStyle: 2,
                            axisLabelVisible: false,
                            title: line.title,
                        });
                    }
                });
            }
        }

        // ── Prediction Range Lines ──
        if (prediction && prediction.direction && prediction.direction !== "UNKNOWN") {
            const predColor = prediction.direction === "UP" ? "#22c55e" : prediction.direction === "DOWN" ? "#ef4444" : "#eab308";
            if (prediction.predicted_high) {
                candleSeries.createPriceLine({
                    price: prediction.predicted_high,
                    color: predColor,
                    lineWidth: 1,
                    lineStyle: 2,
                    axisLabelVisible: true,
                    title: "Pred H",
                });
            }
            if (prediction.predicted_low) {
                candleSeries.createPriceLine({
                    price: prediction.predicted_low,
                    color: predColor,
                    lineWidth: 1,
                    lineStyle: 2,
                    axisLabelVisible: true,
                    title: "Pred L",
                });
            }
            if (prediction.predicted_close) {
                candleSeries.createPriceLine({
                    price: prediction.predicted_close,
                    color: predColor,
                    lineWidth: 2,
                    lineStyle: 1,
                    axisLabelVisible: true,
                    title: `Tgt ${prediction.direction}`,
                });
            }
        }

        // Fit content
        chart.timeScale().fitContent();

        // Resize handler
        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, [candles, indicators, prediction, isDark, overlays]);

    if (!candles || candles.length === 0) return null;

    const toggleOverlay = (key) => {
        setOverlays((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const overlayOptions = [
        { key: "ema9", label: "EMA 9", color: "#fbbf24" },
        { key: "ema20", label: "EMA 20", color: "#f97316" },
        { key: "ema50", label: "EMA 50", color: "#3b82f6" },
        { key: "ema200", label: "EMA 200", color: "#a855f7" },
        { key: "vwap", label: "VWAP", color: "#06b6d4" },
        { key: "supertrend", label: "Supertrend", color: "#22c55e" },
        { key: "bb", label: "Bollinger", color: "#8b5cf6" },
    ];

    return (
        <Card sx={{
            mb: 3,
            background: isDark ? "rgba(17,24,39,0.7)" : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
            boxShadow: theme.shadows[4],
            overflow: "hidden",
        }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            📊 {indexName || "Index"} — 5m Candlestick
                        </Typography>
                        <Chip size="small" label={`${candles.length} bars`} sx={{ height: 18, fontSize: "0.6rem" }} />
                        {prediction?.direction && prediction.direction !== "UNKNOWN" && (
                            <Tooltip title={`Predicted: ${prediction.direction} (${(prediction.probability * 100).toFixed(0)}%) — Target: ₹${prediction.predicted_close?.toLocaleString("en-IN")}`} arrow>
                                <Chip
                                    size="small"
                                    label={`${prediction.direction === "UP" ? "↑" : prediction.direction === "DOWN" ? "↓" : "↔"} ${(prediction.probability * 100).toFixed(0)}%`}
                                    color={prediction.direction === "UP" ? "success" : prediction.direction === "DOWN" ? "error" : "warning"}
                                    sx={{ height: 20, fontWeight: "bold", cursor: "help" }}
                                />
                            </Tooltip>
                        )}
                    </Box>

                    {/* Overlay toggles */}
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {overlayOptions.map(({ key, label, color }) => (
                            <Chip
                                key={key}
                                size="small"
                                label={label}
                                onClick={() => toggleOverlay(key)}
                                variant={overlays.includes(key) ? "filled" : "outlined"}
                                sx={{
                                    height: 22, fontSize: "0.58rem", fontWeight: "bold", cursor: "pointer",
                                    bgcolor: overlays.includes(key) ? `${color}22` : "transparent",
                                    color: overlays.includes(key) ? color : "text.secondary",
                                    borderColor: overlays.includes(key) ? color : "divider",
                                    "&:hover": { bgcolor: `${color}33` },
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* Chart container */}
                <Box
                    ref={chartContainerRef}
                    sx={{
                        width: "100%",
                        borderRadius: 2,
                        overflow: "hidden",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                    }}
                />

                {/* Key levels below chart */}
                {prediction?.direction && prediction.direction !== "UNKNOWN" && (
                    <Box sx={{ display: "flex", gap: 2, mt: 1, justifyContent: "center", flexWrap: "wrap" }}>
                        {prediction.predicted_low && (
                            <Typography variant="caption" color="error.main" sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem" }}>
                                Pred Low: ₹{prediction.predicted_low.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                            </Typography>
                        )}
                        {prediction.predicted_close && (
                            <Typography
                                variant="caption"
                                color={prediction.direction === "UP" ? "success.main" : "error.main"}
                                fontWeight="bold"
                                sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem" }}
                            >
                                Target: ₹{prediction.predicted_close.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                            </Typography>
                        )}
                        {prediction.predicted_high && (
                            <Typography variant="caption" color="success.main" sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem" }}>
                                Pred High: ₹{prediction.predicted_high.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default CandlestickChart;
