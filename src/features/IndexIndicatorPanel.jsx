import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box, Typography, Card, CardContent, Grid, Chip, CircularProgress,
  IconButton, Tooltip, useTheme, Accordion, AccordionSummary,
  AccordionDetails, Alert, Switch, FormControlLabel,
  Select, MenuItem, FormControl, InputLabel, Skeleton, LinearProgress,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TimelineIcon from "@mui/icons-material/Timeline";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import axios from "axios";
import CandlestickChart from './CandlestickChart';
import OptionChainWidget from './OptionChainWidget';
import GatedSignalPanel from './GatedSignalPanel';
import InstitutionalSignalPanel from './InstitutionalSignalPanel';
import SystemHealthPanel from './SystemHealthPanel';
import ContextMatrixPanel from './ContextMatrixPanel';
import LLMReportPanel from './LLMReportPanel';

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const CAT_NAMES = { trend: "Trend & Moving Averages", momentum: "Momentum & Oscillators", volatility_volume: "Volatility & Volume", support_resistance: "Support/Resistance & Pivots" };
const WEIGHTS = { VWAP: 3, "EMA (200)": 2.5, "Supertrend (10,3)": 2, "ADX (14)": 2, "Ichimoku Cloud": 2, "MACD (12,26,9)": 1.5, "RSI (7)": 1.5, "Squeeze Momentum": 1.5, "VWAP SD Bands": 1.5, "EMA (50)": 1.2 };
const TREND_IND = ["EMA (9)", "EMA (20)", "EMA (50)", "EMA (200)", "Supertrend (10,3)", "Ichimoku Cloud", "DEMA (20)", "TEMA (20)", "HMA (9)", "KAMA", "ALMA", "Parabolic SAR"];
const MR_IND = ["Bollinger Bands (20,2)", "RSI (7)", "Stoch RSI", "Williams %R (14)", "CCI (14)"];
const TF_LABELS = { "5m": "5 Min", "15m": "15 Min", "1h": "1 Hour" };
const SCORE_AFTER_MS = { "5m": 5 * 60 * 1000, "15m": 15 * 60 * 1000, "1h": 60 * 60 * 1000 };

const SCORE_TIPS = {
  trend_alignment: "How many trend-following indicators (EMAs, Supertrend, Ichimoku) agree on direction",
  momentum_state: "Combined momentum oscillator reading — RSI, MACD, Stochastic signals",
  volatility_regime: "Position within volatility bands — Bollinger, ATR, Squeeze status",
  vwap_position: "Price position relative to VWAP and its ±1σ / ±2σ bands",
  sr_proximity: "Proximity to key support/resistance levels like pivots and PDH/PDL",
  constituent_bias: "Weighted sentiment of constituent stocks — shows underlying breadth",
};
const LEVEL_TIPS = {
  key: "Key Level — Previous Day High/Low, critical intraday reference",
  pivot: "Traditional Pivot Point — central S/R from prior day OHLC",
  cpr: "Central Pivot Range — narrow = trending day, wide = consolidation",
  vwap: "VWAP — Volume-Weighted Average Price, institutional fair value",
  sd: "VWAP Std Dev Band — statistical price zones around VWAP",
  cam: "Camarilla Pivot — counter-trend entry levels",
  fib: "Fibonacci Retracement — swing-based support/resistance level",
};
const SIGNAL_TIPS = {
  BUY: "BUY — Indicator suggests bullish / upward momentum",
  SELL: "SELL — Indicator suggests bearish / downward momentum",
  NEUTRAL: "NEUTRAL — No clear directional bias from this indicator",
  "STRONG BUY": "STRONG BUY — Very strong bullish signal",
  "STRONG SELL": "STRONG SELL — Very strong bearish signal",
};

/* ── Squeeze Histogram SVG ─────────────────────────────────────────── */
const SqueezeHistogram = ({ histData }) => {
  if (!histData || histData.length === 0) return null;
  const mx = Math.max(...histData.map(Math.abs), 0.01);
  const w = 160, h = 48, bw = w / histData.length - 1;
  const latest = histData[histData.length - 1];
  const prevVal = histData.length > 1 ? histData[histData.length - 2] : 0;
  const trend = latest > prevVal ? "↑ increasing" : latest < prevVal ? "↓ decreasing" : "→ flat";
  return (
    <Box>
      <svg width={w} height={h} style={{ display: "block", margin: "4px 0" }}>
        {histData.map((v, i) => {
          const bh = Math.max(Math.abs(v) / mx * (h / 2 - 2), 1);
          const y = v >= 0 ? h / 2 - bh : h / 2;
          const pv = histData[i - 1] || 0;
          const c = v >= 0 ? (v > pv ? "#4caf50" : "#81c784") : (v < pv ? "#f44336" : "#e57373");
          const mom = v > pv ? "increasing" : v < pv ? "decreasing" : "flat";
          return <rect key={i} x={i * (bw + 1)} y={y} width={bw} height={bh} fill={c} rx={1}><title>{`Bar ${i + 1}: ${v >= 0 ? "+" : ""}${v.toFixed(3)} — Momentum ${mom}`}</title></rect>;
        })}
        <line x1={0} x2={w} y1={h / 2} y2={h / 2} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
        <text x={2} y={8} fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="Inter, sans-serif">Bullish</text>
        <text x={2} y={h - 2} fill="rgba(255,255,255,0.3)" fontSize="6" fontFamily="Inter, sans-serif">Bearish</text>
      </svg>
      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem" }}>
        Latest: {latest >= 0 ? "+" : ""}{latest.toFixed(3)} ({trend})
      </Typography>
    </Box>
  );
};

/* ── VWAP Bands Visual ─────────────────────────────────────────────── */
const VWAPBandsDisplay = ({ bands, currentPrice }) => {
  if (!Array.isArray(bands) || bands.length < 5) return null;
  const [vwap, p1, p2, m1, m2] = bands;
  const rng = p2 - m2 || 1;
  const pct = v => Math.max(2, Math.min(98, ((v - m2) / rng * 100)));
  const levels = [
    { v: p2, label: "+2σ", c: "#f44336", desc: "Upper 2nd std dev — overbought zone" },
    { v: p1, label: "+1σ", c: "#ff9800", desc: "Upper 1st std dev — mild resistance" },
    { v: vwap, label: "VWAP", c: "#2196f3", desc: "Volume-Weighted Average Price — fair value" },
    { v: m1, label: "-1σ", c: "#ff9800", desc: "Lower 1st std dev — mild support" },
    { v: m2, label: "-2σ", c: "#4caf50", desc: "Lower 2nd std dev — oversold zone" }
  ];
  const cpPct = Math.max(2, Math.min(98, pct(currentPrice)));
  const distStr = (v) => { const d = currentPrice - v; const dp = (d / v * 100); return `Distance: ${d >= 0 ? "+" : ""}₹${d.toFixed(1)} (${dp >= 0 ? "+" : ""}${dp.toFixed(2)}%)`; };
  return (
    <Box sx={{ position: "relative", height: 70, my: 1, px: 1 }}>
      {levels.map(({ v, label, c, desc }) => (
        <Tooltip key={label} title={`${desc}\n₹${typeof v === "number" ? v.toLocaleString("en-IN", { maximumFractionDigits: 1 }) : v}\n${distStr(v)}`} placement="left" arrow>
          <Box sx={{ position: "absolute", left: 0, right: 0, top: `${100 - pct(v)}%`, borderTop: `1px solid ${c}40`, cursor: "help", "&:hover": { borderTopColor: `${c}99` } }}>
            <Typography variant="caption" sx={{ position: "absolute", right: 0, top: -8, fontSize: "0.6rem", color: c }}>
              {label}: {typeof v === "number" ? v.toLocaleString("en-IN", { maximumFractionDigits: 1 }) : v}
            </Typography>
          </Box>
        </Tooltip>
      ))}
      <Tooltip title={`Current Price: ₹${currentPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} arrow>
        <Box sx={{ position: "absolute", left: "40%", top: `${100 - cpPct}%`, width: "20%", height: 3, bgcolor: "text.primary", borderRadius: 1, boxShadow: "0 0 6px rgba(255,255,255,0.6)", cursor: "help" }} />
      </Tooltip>
    </Box>
  );
};

/* ── Timeframe Signal Bar ──────────────────────────────────────────── */
const TimeframeSignalBar = ({ timeframeSignals, glass }) => {
  if (!timeframeSignals) return null;
  const tfs = [{ key: "5m", label: "5 Min" }, { key: "15m", label: "15 Min" }, { key: "1h", label: "1 Hour" }];
  const gc = s => s === "STRONG BUY" || s === "BUY" ? "success" : s === "STRONG SELL" || s === "SELL" ? "error" : "default";
  return (
    <Card sx={{ ...glass, mb: 3 }}>
      <CardContent sx={{ py: 1.5 }}>
        <Tooltip title="Aggregated signals across 5-minute, 15-minute, and 1-hour timeframes. Higher timeframe alignment increases conviction." placement="top" arrow>
          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 1, cursor: "help" }}>MULTI-TIMEFRAME SIGNALS</Typography>
        </Tooltip>
        <Grid container spacing={2}>
          {tfs.map(({ key, label }) => {
            const sig = timeframeSignals[key];
            if (!sig) return null;
            const ws = sig.weighted_score || 0;
            const bc = sig.counts?.BUY || 0, nc = sig.counts?.NEUTRAL || 0, sc = sig.counts?.SELL || 0;
            const total = bc + nc + sc || 1;
            const buyW = (bc / total) * 100;
            const neutralW = (nc / total) * 100;
            const sellW = (sc / total) * 100;
            return (
              <Grid item xs={4} key={key}>
                <Tooltip title={`${label} Signals:\n🟢 ${bc} Buy\n⚪ ${nc} Neutral\n🔴 ${sc} Sell\n\nWeighted Score: ${ws > 0 ? "+" : ""}${ws.toFixed(3)}\nSignal: ${sig.composite_signal}`} placement="top" arrow slotProps={{ tooltip: { sx: { maxWidth: 200, whiteSpace: 'pre-line' } } }}>
                  <Box sx={{ cursor: "help" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, alignItems: "center" }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="bold">{label}</Typography>
                      <Typography variant="caption" fontWeight="bold" color={ws > 0 ? "success.main" : ws < 0 ? "error.main" : "text.secondary"}>
                        {sig.composite_signal}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", mb: 0.5 }}>
                      <Box sx={{ width: `${buyW}%`, bgcolor: "success.main" }} />
                      <Box sx={{ width: `${neutralW}%`, bgcolor: "rgba(150,150,150,0.3)" }} />
                      <Box sx={{ width: `${sellW}%`, bgcolor: "error.main" }} />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem" }}>
                        Score: {ws > 0 ? "+" : ""}{ws.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem" }}>
                        🟢{bc} ⚪{nc} 🔴{sc}
                      </Typography>
                    </Box>
                  </Box>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

/* ── Global Context Panel ──────────────────────────────────────────── */
const GlobalContextPanel = ({ globalContext, glass }) => {
  const [showAll, setShowAll] = useState(false);
  if (!globalContext?.signals?.length) return null;
  const { signals, macro_mood } = globalContext;
  const mood = macro_mood || {};
  const catIcons = { FUTURES: "🔮", US_EQUITY: "🇺🇸", ASIA: "🌏", COMMODITY: "🛢", CURRENCY: "💱", VOLATILITY: "📊", RATE: "📈" };
  const catLabels = { FUTURES: "Futures", US_EQUITY: "US Equity", ASIA: "Asia Pacific", COMMODITY: "Commodity", CURRENCY: "Currency", VOLATILITY: "Volatility", RATE: "Interest Rate" };
  const criticalFirst = [...signals].sort((a, b) => ({ CRITICAL: 0, HIGH: 1, MEDIUM: 2 }[a.relevance] || 2) - ({ CRITICAL: 0, HIGH: 1, MEDIUM: 2 }[b.relevance] || 2));
  const displayed = showAll ? criticalFirst : criticalFirst.filter(s => s.relevance !== "MEDIUM");
  return (
    <Card sx={{ ...glass, mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Tooltip title="Global macro indicators that impact Indian markets — futures, commodities, currencies, and international indices" arrow>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ cursor: "help" }}>🌍 Global Macro Context</Typography>
          </Tooltip>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={`Macro Mood: ${mood.label || "N/A"}\nScore: ${mood.score !== undefined ? (mood.score > 0 ? "+" : "") + mood.score.toFixed(2) : "N/A"}\n\nPositive = global tailwinds for Indian markets\nNegative = global headwinds`} arrow>
              <Chip size="small" label={mood.label || "—"} color={mood.color || "default"} sx={{ fontWeight: "bold", cursor: "help" }} />
            </Tooltip>
            {mood.score !== undefined && <Typography variant="caption" color="text.secondary">{mood.score > 0 ? "+" : ""}{mood.score?.toFixed(2)}</Typography>}
          </Box>
        </Box>
        {mood.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontStyle: "italic", fontSize: "0.78rem" }}>{mood.description}</Typography>}
        {mood.alerts?.length > 0 && <Box sx={{ mb: 2 }}>{mood.alerts.map((a, i) => <Alert key={i} severity={a.type || "info"} sx={{ mb: 0.5, py: 0.3, fontSize: "0.7rem" }}>{a.msg}</Alert>)}</Box>}
        <Grid container spacing={1}>
          {displayed.map(s => {
            const up = s.change_pct > 0.1, dn = s.change_pct < -0.1;
            const tooltipContent = `${s.symbol} — ${s.name}\nCategory: ${catLabels[s.category] || s.category}\nValue: ${s.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\nChange: ${s.change_pct > 0 ? "+" : ""}${s.change_pct.toFixed(2)}%\nRelevance: ${s.relevance}\n\n🇮🇳 India Impact: ${s.india_implication}`;
            return (
              <Grid item xs={6} sm={4} md={3} lg={2} key={s.symbol}>
                <Tooltip title={tooltipContent} placement="top" arrow>
                  <Box sx={{
                    p: 1, borderRadius: 2, textAlign: "center", cursor: "default",
                    bgcolor: up ? "rgba(76,175,80,0.08)" : dn ? "rgba(244,67,54,0.08)" : "rgba(0,0,0,0.04)",
                    border: "1px solid", borderColor: up ? "rgba(76,175,80,0.25)" : dn ? "rgba(244,67,54,0.25)" : "divider"
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.55rem", display: "block", mb: 0.3 }}>{catIcons[s.category] || ""} {s.name}</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: up ? "success.main" : dn ? "error.main" : "text.secondary", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem" }}>
                      {s.change_pct > 0 ? "+" : ""}{s.change_pct.toFixed(2)}%
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem" }}>{s.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</Typography>
                    {s.relevance === "CRITICAL" && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "error.main", margin: "2px auto 0", opacity: 0.7 }} />}
                  </Box>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>
        {signals.length > displayed.length && <Box sx={{ mt: 1.5, textAlign: "center" }}>
          <Tooltip title={showAll ? "Hide medium-relevance signals" : `Show ${signals.length - displayed.length} more signals with MEDIUM relevance — these have lower direct impact on Indian markets`} arrow>
            <Chip size="small" variant="outlined" onClick={() => setShowAll(!showAll)}
              label={showAll ? "Show less" : `+ ${signals.length - displayed.length} more signals`}
              sx={{ fontSize: "0.6rem", cursor: "pointer" }} />
          </Tooltip>
        </Box>}
      </CardContent>
    </Card>
  );
};

/* ── Constituent Panel ─────────────────────────────────────────────── */
const ConstituentPanel = ({ constituentAnalysis, glass }) => {
  const [showStocks, setShowStocks] = useState(false);
  if (!constituentAnalysis?.summary) return null;
  const { snapshots, summary } = constituentAnalysis;
  const biasColor = summary.bias_label === "BULLISH" ? "success" : summary.bias_label === "BEARISH" ? "error" : "warning";
  const sorted = [...snapshots].sort((a, b) => b.weight - a.weight);
  return (
    <Card sx={{ ...glass, mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">🏛 Constituent Analysis ({summary.total_analyzed} stocks)</Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {summary.heavyweight_divergence && <Tooltip title="Heavyweight Divergence — Top weighted stocks are signalling opposite to the broader index trend. This often precedes index reversals." arrow><Chip size="small" label="⚠ HW DIVERGING" color="warning" sx={{ fontWeight: "bold", fontSize: "0.6rem", cursor: "help" }} /></Tooltip>}
            <Tooltip title={`${summary.bias_label} — Constituent stocks are weighted ${summary.bias_label === "BULLISH" ? "towards buy signals" : summary.bias_label === "BEARISH" ? "towards sell signals" : "evenly between buy and sell"}\nBias Score: ${summary.bias_score > 0 ? "+" : ""}${summary.bias_score.toFixed(3)} (range: -1 to +1)`} arrow>
              <Chip size="small" label={summary.bias_label} color={biasColor} sx={{ fontWeight: "bold", cursor: "help" }} />
            </Tooltip>
            <Typography variant="caption" color="text.secondary">{summary.bias_score > 0 ? "+" : ""}{summary.bias_score.toFixed(3)}</Typography>
          </Box>
        </Box>
        {summary.heavyweight_divergence && (
          <Alert severity="warning" sx={{ mb: 1.5, fontSize: "0.72rem" }}>
            Top stocks ({summary.top3.map(t => t.symbol).join(", ")}) showing {summary.top3.map(t => t.signal).join(", ")} — diverging from broad trend. Potential index reversal signal.
          </Alert>
        )}
        <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
          <Chip size="small" label={`🟢 ${summary.counts.bullish}`} color="success" variant="outlined" />
          <Chip size="small" label={`⚪ ${summary.counts.neutral}`} />
          <Chip size="small" label={`🔴 ${summary.counts.bearish}`} color="error" variant="outlined" />
        </Box>
        <Tooltip title={`Weighted Constituent Bias\nScore: ${summary.bias_score > 0 ? "+" : ""}${summary.bias_score.toFixed(3)}\n${summary.counts.bullish} Bullish, ${summary.counts.neutral} Neutral, ${summary.counts.bearish} Bearish\n\nWeighted by index composition — heavier stocks have more influence`} arrow>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem", cursor: "help" }}>Weighted Constituent Bias</Typography>
        </Tooltip>
        <Box sx={{ position: "relative", height: 10, borderRadius: 5, bgcolor: "rgba(0,0,0,0.12)", mt: 0.5, mb: 1.5 }}>
          <Box sx={{
            position: "absolute", left: "50%", height: "100%", width: `${Math.abs(summary.bias_score) * 50}%`, borderRadius: 5,
            transform: summary.bias_score >= 0 ? "none" : "translateX(-100%)",
            bgcolor: summary.bias_score >= 0 ? "success.main" : "error.main", transition: "width 0.6s"
          }} />
          <Box sx={{ position: "absolute", left: "50%", width: 2, height: "100%", bgcolor: "text.disabled" }} />
        </Box>
        {Object.entries(summary.sectors || {}).length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
            {Object.entries(summary.sectors).map(([sec, d]) => {
              const dom = d.bullish > d.bearish ? "success" : d.bearish > d.bullish ? "error" : "default";
              return <Tooltip key={sec} title={`${sec} Sector: ${d.bullish} bullish, ${d.bearish} bearish stocks\n${d.bullish > d.bearish ? "Sector leaning bullish" : d.bearish > d.bullish ? "Sector leaning bearish" : "Sector is mixed"}`} arrow>
                <Chip size="small" color={dom} variant="outlined" label={`${sec}: ${d.bullish}↑ ${d.bearish}↓`} sx={{ fontSize: "0.58rem", height: 20, cursor: "help" }} />
              </Tooltip>;
            })}
          </Box>
        )}
        <Chip size="small" variant="outlined" onClick={() => setShowStocks(!showStocks)}
          label={showStocks ? "▲ Hide stocks" : `▼ Show all ${snapshots.length} stocks`}
          sx={{ fontSize: "0.6rem", cursor: "pointer", mb: showStocks ? 1 : 0 }} />
        {showStocks && (
          <Box sx={{ mt: 1, maxHeight: 260, overflowY: "auto" }}>
            {sorted.map(s => (
              <Box key={s.symbol} sx={{
                display: "flex", alignItems: "center", gap: 1.5, py: 0.4, px: 1, borderRadius: 1, mb: 0.3,
                borderLeft: "3px solid", borderColor: s.signal === "BULLISH" ? "success.main" : s.signal === "BEARISH" ? "error.main" : "divider",
                bgcolor: s.signal === "BULLISH" ? "rgba(76,175,80,0.04)" : s.signal === "BEARISH" ? "rgba(244,67,54,0.04)" : "transparent"
              }}>
                <Typography variant="caption" color="text.disabled" sx={{ width: 32, fontSize: "0.55rem", textAlign: "right" }}>{(s.weight * 100).toFixed(1)}%</Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ width: 88, fontSize: "0.7rem" }}>{s.symbol}</Typography>
                <Typography variant="caption" sx={{ fontSize: "0.65rem", width: 52, color: s.change_pct >= 0 ? "success.main" : "error.main" }}>
                  {s.change_pct > 0 ? "+" : ""}{s.change_pct.toFixed(2)}%
                </Typography>
                <Box sx={{ display: "flex", gap: 0.4, ml: "auto" }}>
                  {[
                    { val: s.above_vwap, label: "VWAP", tip: s.above_vwap ? "Above VWAP ✔ (bullish)" : "Below VWAP ✘ (bearish)" },
                    { val: s.above_ema50, label: "EMA50", tip: s.above_ema50 ? "Above EMA50 ✔ (bullish)" : "Below EMA50 ✘ (bearish)" },
                    { val: s.macd_positive, label: "MACD", tip: s.macd_positive ? "MACD positive ✔ (bullish)" : "MACD negative ✘ (bearish)" },
                    { val: s.above_ema20, label: "EMA20", tip: s.above_ema20 ? "Above EMA20 ✔ (bullish)" : "Below EMA20 ✘ (bearish)" },
                    { val: s.rsi_bullish, label: "RSI", tip: s.rsi_bullish ? "RSI > 50 ✔ (bullish)" : "RSI < 50 ✘ (bearish)" },
                  ].map((dot, i) => (
                    <Tooltip key={i} title={`${dot.label}: ${dot.tip}`} arrow placement="top">
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: dot.val ? "success.main" : "error.main", opacity: 0.9, cursor: "help", transition: "transform 0.15s", "&:hover": { transform: "scale(1.5)" } }} />
                    </Tooltip>
                  ))}
                </Box>
                <Typography variant="caption" sx={{
                  width: 54, textAlign: "right", fontSize: "0.6rem", fontWeight: "bold",
                  color: s.signal === "BULLISH" ? "success.main" : s.signal === "BEARISH" ? "error.main" : "text.secondary"
                }}>{s.signal}</Typography>
              </Box>
            ))}
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.5rem", mt: 1, display: "block" }}>Dots: VWAP · EMA50 · MACD · EMA20 · RSI&gt;50</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/* ── MTF Predictor Panel ───────────────────────────────────────────── */
const MTFPredictorPanel = ({ mtfPrediction, glass, accuracyRates, predHistories }) => {
  const [expanded, setExpanded] = useState("5m");
  if (!mtfPrediction || !mtfPrediction["5m"]?.direction) return null;

  const preds = { "5m": mtfPrediction["5m"], "15m": mtfPrediction["15m"], "1h": mtfPrediction["1h"] };
  const { mtf_bias, confluence_note, all_aligned } = mtfPrediction;
  const cc = { HIGH: "#4caf50", MEDIUM: "#ff9800", LOW: "#9e9e9e" };
  const dc = d => d === "UP" ? "success" : d === "DOWN" ? "error" : "warning";
  const di = d => d === "UP" ? "↑" : d === "DOWN" ? "↓" : "↔";

  return (
    <Card sx={{ ...glass, mb: 3 }}>
      <CardContent>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`}</style>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">📈 Multi-Timeframe Forecast</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {all_aligned && <Chip size="small" label="🎯 ALL ALIGNED" color="primary" sx={{ fontWeight: "bold", animation: "pulse 2s infinite" }} />}
            <Chip size="small" label={mtf_bias}
              color={mtf_bias.includes("BULLISH") ? "success" : mtf_bias.includes("BEARISH") ? "error" : "warning"}
              variant="outlined" sx={{ fontWeight: "bold" }} />
          </Box>
        </Box>

        <Alert severity={all_aligned ? "success" : "info"} sx={{ mb: 2, py: 0.5, fontSize: "0.75rem" }}>{confluence_note}</Alert>

        {/* Timeframe tabs */}
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {["5m", "15m", "1h"].map(tf => (
            <Chip key={tf} label={TF_LABELS[tf]} onClick={() => setExpanded(tf)}
              variant={expanded === tf ? "filled" : "outlined"} color={expanded === tf ? "primary" : "default"}
              size="small" sx={{ fontWeight: "bold" }} />
          ))}
        </Box>

        {/* Quick summary row */}
        <Grid container spacing={1} sx={{ mb: 2 }}>
          {["5m", "15m", "1h"].map(tf => {
            const p = preds[tf];
            if (!p || !p.direction) return null;
            const acc = accuracyRates?.[tf];
            return (
              <Grid item xs={4} key={tf}>
                <Tooltip title={`${TF_LABELS[tf]} Prediction\n\nDirection: ${p.direction} (${(p.probability * 100).toFixed(0)}% probability)\nConfidence: ${p.confidence}\n${acc !== null ? `Accuracy (last ${(predHistories[tf] || []).filter(x => x.outcome !== null).length} predictions): ${acc}%` : "Accuracy: Insufficient data (need 3+ scored predictions)"}`} arrow placement="top" slotProps={{ tooltip: { sx: { maxWidth: 250, whiteSpace: 'pre-line' } } }}>
                  <Box sx={{
                    textAlign: "center", p: 1, borderRadius: 2, border: "1px solid", cursor: "pointer",
                    borderColor: expanded === tf ? "primary.main" : "divider",
                    bgcolor: expanded === tf ? "rgba(33,150,243,0.05)" : "transparent",
                    transition: "all 0.2s", "&:hover": { borderColor: "primary.main" }
                  }}
                    onClick={() => setExpanded(tf)}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem", display: "block" }}>{TF_LABELS[tf]}</Typography>
                    <Typography variant="h5" color={`${dc(p.direction)}.main`} fontWeight="900">{di(p.direction)}</Typography>
                    <Typography variant="caption" fontWeight="bold" color={`${dc(p.direction)}.main`}>{(p.probability * 100).toFixed(0)}%</Typography>
                    <Chip size="small" label={p.confidence} sx={{ display: "block", mt: 0.3, height: 14, fontSize: "0.5rem", bgcolor: cc[p.confidence] + "22", color: cc[p.confidence] }} />
                    {acc !== null && <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.5rem" }}>acc: {acc}%</Typography>}
                  </Box>
                </Tooltip>
              </Grid>
            );
          })}
        </Grid>

        {/* Expanded detail */}
        {preds[expanded] && preds[expanded].direction && (() => {
          const p = preds[expanded];
          return (
            <Box>
              <Tooltip title={`${TF_LABELS[expanded]} Predicted Price Range\nATR (1-bar): ${p.atr_1bar} points\n\nLow: ₹${p.predicted_low?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\nTarget: ₹${p.predicted_close?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\nHigh: ₹${p.predicted_high?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} arrow placement="top" slotProps={{ tooltip: { sx: { maxWidth: 250, whiteSpace: 'pre-line' } } }}>
                <Box sx={{ bgcolor: "rgba(0,0,0,0.06)", borderRadius: 2, p: 1.5, mb: 1.5, cursor: "help" }}>
                  <Typography variant="caption" color="text.secondary">{TF_LABELS[expanded]} Predicted Range (ATR: {p.atr_1bar})</Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 0.5 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption" color="error.main" sx={{ fontSize: "0.6rem" }}>LOW</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "'JetBrains Mono',monospace" }}>₹{p.predicted_low?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, mx: 1.5 }}>
                      <Box sx={{ position: "relative", height: 10, bgcolor: "divider", borderRadius: 5 }}>
                        <Box sx={{ position: "absolute", left: "20%", right: "20%", height: "100%", borderRadius: 5, bgcolor: `${dc(p.direction)}.main`, opacity: 0.4 }} />
                        <Box sx={{ position: "absolute", left: "50%", top: -2, width: 4, height: 14, bgcolor: "text.primary", borderRadius: 2, transform: "translateX(-50%)" }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", fontSize: "0.6rem", mt: 0.3 }}>
                        Target: ₹{p.predicted_close?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption" color="success.main" sx={{ fontSize: "0.6rem" }}>HIGH</Typography>
                      <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "'JetBrains Mono',monospace" }}>₹{p.predicted_high?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
              {/* Score breakdown mini bars */}
              {
                p.score_breakdown && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem", mb: 0.5, display: "block" }}>SCORE BREAKDOWN</Typography>
                    {Object.entries(p.score_breakdown).map(([key, val]) => (
                      <Tooltip key={key} title={`${key.replace(/_/g, " ").toUpperCase()}: ${val > 0 ? "+" : ""}${val.toFixed(3)}\n${SCORE_TIPS[key] || "Component score for the prediction model"}\n${val > 0.3 ? "🟢 Strong bullish contribution" : val < -0.3 ? "🔴 Strong bearish contribution" : "⚪ Mild contribution"}`} arrow placement="top" slotProps={{ tooltip: { sx: { maxWidth: 220, whiteSpace: 'pre-line', textAlign: 'center' } } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4, cursor: "help", borderRadius: 1, py: 0.2, px: 0.5, transition: "background 0.15s", "&:hover": { bgcolor: "rgba(255,255,255,0.04)" } }}>
                          <Typography variant="caption" color="text.secondary" sx={{ width: 120, fontSize: "0.6rem", textTransform: "uppercase", fontWeight: 600 }}>{key.replace(/_/g, " ")}</Typography>
                          <Box sx={{ flex: 1, position: "relative", height: 8, bgcolor: "divider", borderRadius: 4 }}>
                            <Box sx={{ position: "absolute", left: val >= 0 ? "50%" : `${50 + val * 50}%`, width: `${Math.abs(val) * 50}%`, height: "100%", borderRadius: 4, bgcolor: val >= 0 ? "success.main" : "error.main", opacity: 0.85 }} />
                            <Box sx={{ position: "absolute", left: "50%", top: -1, width: 1.5, height: 10, bgcolor: "text.disabled", borderRadius: 1 }} />
                          </Box>
                          <Typography variant="caption" sx={{ width: 42, textAlign: "right", fontSize: "0.62rem", fontWeight: "bold", color: val > 0 ? "success.main" : val < 0 ? "error.main" : "text.secondary" }}>
                            {val > 0 ? "+" : ""}{val.toFixed(2)}
                          </Typography>
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                )
              }
              {
                p.reasoning?.length > 0 && (
                  <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 1 }}>
                    {p.reasoning.map((r, i) => (
                      <Typography key={i} variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.4, fontSize: "0.63rem" }}>• {r}</Typography>
                    ))}
                  </Box>
                )
              }
            </Box>
          );
        })()}
        <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1.5, fontStyle: "italic", fontSize: "0.52rem" }}>
          Probabilistic confluence estimate only. Not financial advice. Past accuracy from live session tracking.
        </Typography>
      </CardContent>
    </Card >
  );
};

/* ── Build S/R Price Ladder Levels with deduplication ───────────────── */
const buildLevels = (cats, cp) => {
  const levels = [];
  const addLevel = (level) => {
    if (typeof level.val !== "number" || isNaN(level.val)) return;
    const isDuplicate = levels.some(l => Math.abs(l.val - level.val) / Math.max(l.val, 1) < 0.0005);
    if (!isDuplicate) levels.push(level);
  };
  const sr = cats.support_resistance || [], trend = cats.trend || [], vol = cats.volatility_volume || [];
  const pdhl = sr.find(i => i.name === "Previous Day H/L");
  const pivotInd = sr.find(i => i.name === "Daily Pivots (Trad)");
  const cpr = sr.find(i => i.name === "Central Pivot Range (CPR)");
  const cam = sr.find(i => i.name === "Camarilla Pivots");
  const vwapInd = trend.find(i => i.name === "VWAP");
  const vwapSd = vol.find(i => i.name === "VWAP SD Bands");
  const fib = sr.find(i => i.name === "Fibonacci Auto");

  if (pdhl?.value) { addLevel({ label: "PDH", val: pdhl.value[0], color: "#f44336", type: "key" }); addLevel({ label: "PDL", val: pdhl.value[1], color: "#4caf50", type: "key" }); }
  if (pivotInd) addLevel({ label: "PP", val: typeof pivotInd.value === "number" ? pivotInd.value : (Array.isArray(pivotInd.value) ? pivotInd.value[0] : parseFloat(pivotInd.value)), color: "#2196f3", type: "pivot" });
  if (cpr?.value && Array.isArray(cpr.value)) { addLevel({ label: "TC", val: cpr.value[0], color: "#9c27b0", type: "cpr" }); addLevel({ label: "BC", val: cpr.value[2], color: "#9c27b0", type: "cpr" }); }
  if (vwapInd) addLevel({ label: "VWAP", val: vwapInd.value, color: "#ff9800", type: "vwap" });
  if (vwapSd?.value && Array.isArray(vwapSd.value) && vwapSd.value.length >= 5) {
    addLevel({ label: "+2σ", val: vwapSd.value[2], color: "#f44336", type: "sd" });
    addLevel({ label: "+1σ", val: vwapSd.value[1], color: "#ff9800", type: "sd" });
    addLevel({ label: "-1σ", val: vwapSd.value[3], color: "#ff9800", type: "sd" });
    addLevel({ label: "-2σ", val: vwapSd.value[4], color: "#4caf50", type: "sd" });
  }
  if (cam?.value && Array.isArray(cam.value)) { addLevel({ label: "H3", val: cam.value[1], color: "#ff5722", type: "cam" }); addLevel({ label: "L3", val: cam.value[2], color: "#8bc34a", type: "cam" }); }
  if (fib?.value && Array.isArray(fib.value)) {
    ["0%", "38.2%", "50%", "61.8%", "100%"].forEach((l, i) => { if (fib.value[i] != null) addLevel({ label: `F${l}`, val: fib.value[i], color: "#607d8b", type: "fib" }); });
  }
  return levels.sort((a, b) => b.val - a.val);
};

/* ══════════════════════════════════════════════════════════════════════ */
export default function IndexIndicatorPanel({ llmEnabled, llmLoading }) {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState("nifty");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [regimeFilter, setRegimeFilter] = useState(true);
  const [showDivergences, setShowDivergences] = useState(true);
  const [pivotType, setPivotType] = useState("All");
  const lastProcessedTs = useRef(null);
  const [predHistories, setPredHistories] = useState(() => {
    try {
      return {
        "5m": JSON.parse(localStorage.getItem(`pred_history_${selectedIndex}_5m`) || "[]"),
        "15m": JSON.parse(localStorage.getItem(`pred_history_${selectedIndex}_15m`) || "[]"),
        "1h": JSON.parse(localStorage.getItem(`pred_history_${selectedIndex}_1h`) || "[]"),
      };
    } catch { return { "5m": [], "15m": [], "1h": [] }; }
  });

  const indices = [{ id: "nifty", name: "NIFTY 50" }, { id: "banknifty", name: "BANK NIFTY" }, { id: "sensex", name: "SENSEX" }];

  // Reset predHistories when switching indices
  useEffect(() => {
    try {
      setPredHistories({
        "5m": JSON.parse(localStorage.getItem(`pred_history_${selectedIndex}_5m`) || "[]"),
        "15m": JSON.parse(localStorage.getItem(`pred_history_${selectedIndex}_15m`) || "[]"),
        "1h": JSON.parse(localStorage.getItem(`pred_history_${selectedIndex}_1h`) || "[]"),
      });
    } catch {
      setPredHistories({ "5m": [], "15m": [], "1h": [] });
    }
    lastProcessedTs.current = null;
  }, [selectedIndex]);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [mainRes, constituentRes, globalRes] = await Promise.allSettled([
        axios.get(`${API}/api/index/analyze`, { params: { index: selectedIndex, interval: "5", days: 5 } }),
        axios.get(`${API}/api/index/constituents`, { params: { index: selectedIndex } }),
        axios.get(`${API}/api/market/global-context`),
      ]);
      const mainData = mainRes.status === "fulfilled" ? mainRes.value.data?.data : null;
      if (!mainData) {
        const errDetail = mainRes.reason?.response?.data?.detail
          || mainRes.reason?.message
          || "Failed to load indicator data";
        setError(errDetail);
        return;
      }
      const constituentData = constituentRes.status === "fulfilled" ? constituentRes.value.data?.data : null;
      const globalData = globalRes.status === "fulfilled" ? globalRes.value.data?.data : null;
      setData({ ...mainData, constituent_analysis: constituentData, global_context: globalData });
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) { setError(err.response?.data?.detail || "Network error"); }
    finally { setLoading(false); }
  }, [selectedIndex]);

  useEffect(() => { fetchData(); const iv = setInterval(fetchData, 60000); return () => clearInterval(iv); }, [fetchData]);

  const [renewLoading, setRenewLoading] = useState(false);
  const renewAuth = useCallback(async () => {
    setRenewLoading(true);
    try {
      await axios.post(`${API}/api/auth/renew`);
      setError(null);
      fetchData();
    } catch (e) {
      setError(e.response?.data?.detail || "Token renewal failed — check server logs");
    } finally {
      setRenewLoading(false);
    }
  }, [fetchData]);

  // Per-TF prediction tracking with race condition fix
  useEffect(() => {
    if (!data || !data.last_candle_timestamp || !data.mtf_prediction) return;
    const ts = data.last_candle_timestamp;
    if (lastProcessedTs.current === ts) return;
    lastProcessedTs.current = ts;
    const currTs = typeof ts === "number" ? ts * 1000 : new Date(ts).getTime();

    setPredHistories(prev => {
      const next = { ...prev };
      ["5m", "15m", "1h"].forEach(tf => {
        const hist = [...(next[tf] || [])];
        for (let i = 0; i < hist.length; i++) {
          if (!hist[i].outcome && hist[i].candle_time) {
            const predTs = typeof hist[i].candle_time === "number" ? hist[i].candle_time * 1000 : new Date(hist[i].candle_time).getTime();
            if (currTs - predTs >= SCORE_AFTER_MS[tf]) {
              const actual = data.price > hist[i].price ? "UP" : data.price < hist[i].price ? "DOWN" : "SIDEWAYS";
              hist[i] = { ...hist[i], outcome: actual, correct: actual === hist[i].direction };
            }
          }
        }
        const tfPred = data.mtf_prediction?.[tf];
        if (tfPred && tfPred.direction && tfPred.direction !== "UNKNOWN") {
          hist.push({ time: new Date().toISOString(), candle_time: ts, price: data.price, direction: tfPred.direction, probability: tfPred.probability, confidence: tfPred.confidence, outcome: null, correct: null });
        }
        next[tf] = hist.slice(-30);
        localStorage.setItem(`pred_history_${selectedIndex}_${tf}`, JSON.stringify(next[tf]));
      });
      return next;
    });
  }, [data]);

  const accuracyRates = {};
  ["5m", "15m", "1h"].forEach(tf => {
    const scored = (predHistories[tf] || []).filter(p => p.outcome !== null);
    accuracyRates[tf] = scored.length >= 3 ? (scored.filter(p => p.correct).length / scored.length * 100).toFixed(1) : null;
  });

  const gc = s => s === "BUY" || s === "STRONG BUY" ? theme.palette.success.main : s === "SELL" || s === "STRONG SELL" ? theme.palette.error.main : theme.palette.text.secondary;
  const glass = {
    background: theme.palette.mode === "dark" ? "rgba(30,41,59,0.7)" : "rgba(255,255,255,0.7)",
    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
    border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
    boxShadow: theme.shadows[4], transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": { transform: "translateY(-2px)", boxShadow: theme.shadows[8] },
  };
  const regime = data?.market_regime, ws = data?.signal_summary?.weighted_score || 0;
  const divs = data?.signal_summary?.divergences;
  const hasDivergence = divs && (divs.rsi?.type !== "none" || divs.macd?.type !== "none");
  const isSuppressed = name => { if (!regimeFilter || !regime) return false; if (regime === "RANGING" && TREND_IND.includes(name)) return true; if (regime === "TRENDING" && MR_IND.includes(name)) return true; return false; };
  const regimeIcon = regime === "TRENDING" ? "⚡" : regime === "RANGING" ? "↔" : "~";
  const regimeColor = regime === "TRENDING" ? "success" : regime === "RANGING" ? "warning" : "info";

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, height: "100%", overflow: "auto" }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

      {/* Top loading bar during refresh */}
      {loading && data && <LinearProgress sx={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }} />}

      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {indices.map(idx => (
            <Chip key={idx.id} icon={<ShowChartIcon />} label={idx.name} onClick={() => setSelectedIndex(idx.id)}
              color={selectedIndex === idx.id ? "primary" : "default"} variant={selectedIndex === idx.id ? "filled" : "outlined"}
              sx={{ px: 1, fontWeight: "bold", fontSize: "1rem", transition: "all 0.3s", "&:hover": { transform: "scale(1.05)" } }} />
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {lastRefreshed && <Typography variant="caption" color="text.secondary">Updated: {lastRefreshed}</Typography>}
          <Tooltip title="Settings"><IconButton onClick={() => setShowSettings(!showSettings)} color={showSettings ? "primary" : "default"}><SettingsIcon /></IconButton></Tooltip>
          <Tooltip title="Refresh"><IconButton onClick={fetchData} disabled={loading} color="primary" sx={{ background: "rgba(0,0,0,0.05)" }}><RefreshIcon sx={{ animation: loading ? "spin 1s linear infinite" : "none" }} /></IconButton></Tooltip>
        </Box>
      </Box>

      {error && (
        error === "Dhan Bridge not initialized" ? (
          <Alert severity="warning" sx={{ mb: 3 }}
            action={
              <Button color="inherit" size="small" onClick={renewAuth} disabled={renewLoading}>
                {renewLoading ? "Renewing…" : "Renew Auth"}
              </Button>
            }
          >
            Dhan authentication not active — the server started without a valid token. Click <strong>Renew Auth</strong> to reconnect, or restart the server after updating your credentials.
          </Alert>
        ) : (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )
      )}

      {/* Skeleton loading for initial load */}
      {loading && !data && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3].map(i => <Grid item xs={12} md={4} key={i}><Skeleton variant="rounded" height={140} animation="wave" /></Grid>)}
          </Grid>
          <Skeleton variant="rounded" height={200} animation="wave" sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={400} animation="wave" />
        </Box>
      )}

      {/* Settings */}
      {showSettings && (
        <Card sx={{ ...glass, mb: 3, p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>⚙ Settings</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6} sm={3}><FormControlLabel control={<Switch checked={regimeFilter} onChange={e => setRegimeFilter(e.target.checked)} />} label="Regime Filter" /></Grid>
            <Grid item xs={6} sm={3}><FormControlLabel control={<Switch checked={showDivergences} onChange={e => setShowDivergences(e.target.checked)} />} label="Divergence Alerts" /></Grid>
            <Grid item xs={12} sm={3}>
              <FormControl size="small" fullWidth><InputLabel>Pivot Type</InputLabel>
                <Select value={pivotType} label="Pivot Type" onChange={e => setPivotType(e.target.value)}>
                  {["All", "Traditional", "Camarilla", "Woodie's"].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>
      )}

      {data && (
        <>
          {/* Divergence Alerts */}
          {showDivergences && hasDivergence && (
            <Box sx={{ mb: 3 }}>
              {divs.rsi?.type !== "none" && <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 1 }}>⚠ {divs.rsi.type === "bullish" ? "Bullish" : "Bearish"} RSI Divergence ({divs.rsi.strength})</Alert>}
              {divs.macd?.type !== "none" && <Alert severity="warning" icon={<WarningAmberIcon />}>⚠ {divs.macd.type === "bullish" ? "Bullish" : "Bearish"} MACD Divergence ({divs.macd.strength})</Alert>}
            </Box>
          )}

          {/* AI Trading Report Panel */}
          {(llmEnabled || llmLoading) && (
            <LLMReportPanel
              llmReport={data.llm_report}
              isEnabled={llmEnabled}
              loading={llmLoading}
              glass={glass}
            />
          )}

          {/* Top Cards: Price, Composite, Regime */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card sx={{ ...glass, height: "100%" }}>
                <Tooltip title={`Last traded price for ${indices.find(i => i.id === selectedIndex)?.name}\nAuto-refreshes every 60 seconds\nLast updated: ${lastRefreshed || "loading..."}`} arrow placement="bottom">
                  <CardContent sx={{ textAlign: "center", cursor: "help" }}>
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">{indices.find(i => i.id === selectedIndex)?.name}</Typography>
                    <Typography variant="h3" fontWeight="900" sx={{ mt: 1 }}>₹{data.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem" }}>Last traded price</Typography>
                  </CardContent>
                </Tooltip>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <GatedSignalPanel signalSummary={data.signal_summary} regimeDetail={data.regime_detail} glass={glass} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ ...glass, height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">MARKET REGIME</Typography>
                    <Tooltip title={regime === "TRENDING" ? "TRENDING — Price is moving directionally with momentum. Trend-following indicators are prioritized." : regime === "RANGING" ? "RANGING — Price is oscillating within a range. Mean-reversion indicators are prioritized." : "TRANSITIONING — Market structure is shifting. All indicators contribute equally."} arrow>
                      <Chip size="small" label={`${regimeIcon} ${regime}`} color={regimeColor} sx={{ fontWeight: "bold", cursor: "help" }} />
                    </Tooltip>
                  </Box>
                  {regime === "TRENDING" && <><Typography variant="body2" sx={{ mt: 1 }}>Active: <b>Trend-following</b></Typography><Tooltip title="In a trending market, mean-reversion signals (RSI extremes, Bollinger Band touches) are suppressed as they generate false reversals." arrow><Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, cursor: "help" }}>Suppressed: RSI extremes, BB touches</Typography></Tooltip></>}
                  {regime === "RANGING" && <><Typography variant="body2" sx={{ mt: 1 }}>Active: <b>Mean-reversion</b></Typography><Tooltip title="In a ranging market, trend-following signals (EMA crossovers, Supertrend, Ichimoku) are suppressed as they generate false breakouts." arrow><Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, cursor: "help" }}>Suppressed: EMA crossovers, Supertrend, Ichimoku</Typography></Tooltip></>}
                  {regime === "TRANSITIONING" && <Tooltip title="Market is transitioning between regimes. All indicators are weighted equally as no clear regime dominates." arrow><Typography variant="body2" color="text.secondary" sx={{ mt: 1, cursor: "help" }}>Transitioning — all signals active</Typography></Tooltip>}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Institutional Signal Panel */}
          {data.institutional_signal && data.institutional_signal.components && (
            <InstitutionalSignalPanel institutionalSignal={data.institutional_signal} glass={glass} />
          )}

          {/* New System Health Panel */}
          {data.system_health && data.throughput_status && (
            <SystemHealthPanel systemHealth={data.system_health} throughputStatus={data.throughput_status} glass={glass} />
          )}

          {/* New Context Matrix Panel */}
          {data.day_character && data.session_context && data.expiry_context && data.dealer_context && (
            <ContextMatrixPanel
              dayCharacter={data.day_character}
              sessionContext={data.session_context}
              expiryContext={data.expiry_context}
              dealerContext={data.dealer_context}
              liquidityContext={data.liquidity_context}
              glass={glass}
            />
          )}

          {/* Candlestick Chart */}
          {data.candles && data.candles.length > 0 && (
            <CandlestickChart
              candles={data.candles}
              indicators={data.categories}
              prediction={data.mtf_prediction?.["5m"]}
              price={data.price}
              indexName={indices.find(i => i.id === selectedIndex)?.name}
            />
          )}

          {/* Global Macro Context */}
          <GlobalContextPanel globalContext={data.global_context} glass={glass} />

          {/* Multi-Timeframe Signal Bar */}
          <TimeframeSignalBar timeframeSignals={data.timeframe_signals} glass={glass} />

          {/* Constituent Analysis */}
          <ConstituentPanel constituentAnalysis={data.constituent_analysis} glass={glass} />

          {/* MTF Predictor Panel */}
          <MTFPredictorPanel mtfPrediction={data.mtf_prediction} glass={glass} accuracyRates={accuracyRates} predHistories={predHistories} />

          {/* Option Chain Analysis Widget */}
          <OptionChainWidget selectedIndex={selectedIndex} />

          {/* Enhanced Price Ladder */}
          {data.categories && (() => {
            const levels = buildLevels(data.categories, data.price);
            if (levels.length === 0) return null;
            return (
              <Card sx={{ ...glass, mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>📊 Price Ladder ({levels.length} levels)</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3, fontFamily: "'JetBrains Mono', monospace", maxHeight: 300, overflowY: "auto" }}>
                    {levels.map((lv, i) => {
                      const atPrice = Math.abs(lv.val - data.price) / data.price < 0.001;
                      const nearPrice = Math.abs(lv.val - data.price) / data.price < 0.002;
                      const above = lv.val > data.price;
                      const dist = lv.val - data.price;
                      const distPct = (dist / data.price * 100);
                      return (
                        <Tooltip key={i} title={`${lv.label} = ₹${lv.val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\n${LEVEL_TIPS[lv.type] || lv.type}\n\nDistance from price: ${dist >= 0 ? "+" : ""}₹${dist.toFixed(1)} (${distPct >= 0 ? "+" : ""}${distPct.toFixed(2)}%)\n${above ? "🔴 Resistance above" : "🟢 Support below"}`} arrow placement="top-start" slotProps={{ tooltip: { sx: { maxWidth: 260, whiteSpace: 'pre-line' } } }}>
                          <Box sx={{
                            display: "flex", alignItems: "center", gap: 2, px: 2, py: 0.3, borderRadius: 1, cursor: "help",
                            bgcolor: atPrice ? "rgba(33,150,243,0.12)" : nearPrice ? "rgba(33,150,243,0.06)" : above ? "rgba(244,67,54,0.03)" : "rgba(76,175,80,0.03)",
                            transition: "background 0.15s", "&:hover": { bgcolor: atPrice ? "rgba(33,150,243,0.18)" : "rgba(255,255,255,0.04)" }
                          }}>
                            <Typography variant="caption" sx={{ width: 40, color: lv.color, fontWeight: "bold", fontSize: "0.65rem" }}>{lv.label}</Typography>
                            <Tooltip title={LEVEL_TIPS[lv.type] || lv.type} arrow><Chip size="small" label={lv.type} sx={{ height: 14, fontSize: "0.5rem", bgcolor: "rgba(0,0,0,0.06)", cursor: "help" }} /></Tooltip>
                            <Box sx={{ flex: 1, borderBottom: "1px dashed", borderColor: "divider" }} />
                            <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.55rem", mr: 1 }}>({distPct >= 0 ? "+" : ""}{distPct.toFixed(2)}%)</Typography>
                            <Typography variant="body2" fontWeight={atPrice ? "bold" : "normal"} sx={{ fontSize: "0.8rem" }}>
                              {lv.val.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </Typography>
                            {atPrice && <Chip size="small" label="● PRICE" color="primary" sx={{ height: 16, "& .MuiChip-label": { px: 0.5, fontSize: "0.55rem" } }} />}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            );
          })()}

          {/* Indicator Accordions */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Object.entries(data.categories).map(([catKey, indicators]) => {
              if (!indicators || indicators.length === 0) return null;
              const filtered = pivotType === "All" ? indicators : indicators.filter(i => {
                if (catKey !== "support_resistance") return true;
                if (pivotType === "Traditional") return !["Camarilla Pivots", "Woodie's Pivots"].includes(i.name);
                if (pivotType === "Camarilla") return !["Daily Pivots (Trad)", "Woodie's Pivots"].includes(i.name);
                if (pivotType === "Woodie's") return !["Daily Pivots (Trad)", "Camarilla Pivots"].includes(i.name);
                return true;
              });
              const bc = filtered.filter(i => i.signal === "BUY").length, sc = filtered.filter(i => i.signal === "SELL").length, nc = filtered.filter(i => i.signal === "NEUTRAL").length;
              return (
                <Accordion key={catKey} defaultExpanded sx={{
                  borderRadius: "12px !important", "&:before": { display: "none" },
                  background: theme.palette.mode === "dark" ? "rgba(30,30,40,0.6)" : "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(10px)", boxShadow: theme.shadows[2], overflow: "hidden"
                }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", pr: 2 }}>
                      <Typography variant="h6" fontWeight="bold">{CAT_NAMES[catKey] || catKey}</Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip size="small" label={bc} color="success" variant="outlined" sx={{ fontWeight: "bold", border: "none", bgcolor: "rgba(76,175,80,0.1)" }} />
                        <Chip size="small" label={nc} sx={{ color: "text.secondary", fontWeight: "bold", border: "none", bgcolor: "rgba(158,158,158,0.1)" }} />
                        <Chip size="small" label={sc} color="error" variant="outlined" sx={{ fontWeight: "bold", border: "none", bgcolor: "rgba(244,67,54,0.1)" }} />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: theme.palette.mode === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)", p: 3 }}>
                    <Grid container spacing={2}>
                      {filtered.map((ind, idx) => {
                        const suppressed = isSuppressed(ind.name);
                        const w = WEIGHTS[ind.name];
                        const isSqueeze = ind.name === "Squeeze Momentum";
                        const isHA = ind.name === "Heikin-Ashi Trend";
                        const isVwapBands = ind.name === "VWAP SD Bands";
                        const isST = ind.name === "Supertrend (10,3)";
                        const stStreak = ind.streak || 0;
                        return (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                            <Card variant="outlined" sx={{
                              height: "100%", bgcolor: "transparent",
                              borderColor: suppressed ? "divider" : ind.signal === "BUY" ? "success.dark" : ind.signal === "SELL" ? "error.dark" : "divider",
                              borderLeftWidth: 4, transition: "all 0.2s", opacity: suppressed ? 0.4 : 1,
                              "&:hover": { bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }
                            }}>
                              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                  <Box sx={{ flex: 1, pr: 1 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">{ind.name}</Typography>
                                    {w && w > 1.2 && <Tooltip title={`Weight ×${w} — This indicator has ${w}x influence on the composite score. Higher weight = more important.`} arrow><Chip size="small" label={`×${w}`} sx={{ height: 16, mt: 0.3, fontSize: "0.6rem", bgcolor: "rgba(255,193,7,0.15)", color: "warning.main", cursor: "help" }} /></Tooltip>}
                                  </Box>
                                  <Tooltip title={SIGNAL_TIPS[ind.signal] || ind.signal} arrow>
                                    <Chip size="small"
                                      icon={ind.signal === "BUY" ? <TrendingUpIcon fontSize="small" /> : ind.signal === "SELL" ? <TrendingDownIcon fontSize="small" /> : <TimelineIcon fontSize="small" />}
                                      label={ind.signal} color={ind.signal === "BUY" ? "success" : ind.signal === "SELL" ? "error" : "default"}
                                      sx={{ height: 20, cursor: "help", "& .MuiChip-label": { px: 1, fontSize: "0.65rem", fontWeight: "bold" } }} />
                                  </Tooltip>
                                </Box>
                                {isST && stStreak > 5 && <Tooltip title={`Price has been ${ind.signal === "BUY" ? "above" : "below"} Supertrend for ${stStreak} consecutive bars, indicating a sustained ${ind.signal === "BUY" ? "bullish" : "bearish"} trend.`} arrow><Chip size="small" label={`🔥 ${stStreak} bars`} sx={{ mb: 0.5, height: 18, fontSize: "0.6rem", bgcolor: "rgba(255,152,0,0.15)", color: "warning.main", cursor: "help" }} /></Tooltip>}
                                {isSqueeze && <Chip size="small" label={ind.squeeze_active ? "🔴 SQUEEZE ACTIVE" : "🟢 SQUEEZE FIRED"}
                                  sx={{ mb: 0.5, height: 18, fontSize: "0.6rem", bgcolor: ind.squeeze_active ? "rgba(244,67,54,0.15)" : "rgba(76,175,80,0.15)" }} />}
                                {isSqueeze && ind.squeeze_history && <SqueezeHistogram histData={ind.squeeze_history} />}
                                {isHA && typeof ind.value === "number" && (
                                  <Box sx={{ display: "flex", gap: 0.3, mb: 0.5 }}>
                                    {Array.from({ length: Math.min(Math.abs(ind.value), 10) }).map((_, i) => (
                                      <Box key={i} sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: ind.value > 0 ? "success.main" : "error.main" }} />))}
                                  </Box>
                                )}
                                {isVwapBands && <VWAPBandsDisplay bands={ind.value} currentPrice={data.price} />}
                                {!isVwapBands && (
                                  <Typography variant="h6" sx={{ fontFamily: "'JetBrains Mono', monospace", my: 0.5, letterSpacing: -0.5 }}>
                                    {Array.isArray(ind.value)
                                      ? ind.value.map(v => typeof v === "number" ? v.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : v).join(" · ")
                                      : typeof ind.value === "number" ? ind.value.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : String(ind.value)}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.2, mt: 1 }}>{ind.description}</Typography>
                                {suppressed && <Tooltip title={`This indicator is suppressed because the market is in a ${regime} regime. ${regime === "RANGING" ? "Trend-following signals generate false breakouts in ranging markets." : "Mean-reversion signals generate false reversals in trending markets."}`} arrow><Typography variant="caption" color="warning.main" sx={{ display: "block", mt: 0.5, fontStyle: "italic", cursor: "help" }}>[suppressed in {regime?.toLowerCase()} market]</Typography></Tooltip>}
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}
