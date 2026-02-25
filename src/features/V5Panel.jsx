import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  AutoFixHigh as AutoFixHighIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  Warning as WarningIcon,
  FlashOn as FlashOnIcon,
  FilterAlt as FilterAltIcon,
  Tune as TuneIcon,
  Block as BlockIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ─────────────────────────────────────────────────────────────────────────────
// Colour helpers
// ─────────────────────────────────────────────────────────────────────────────
const CONFIDENCE_COLORS = {
  HIGH:   "#00e676",
  MEDIUM: "#ffab00",
};
const DIRECTION_COLORS = {
  BUY:  "#00e676",
  SELL: "#ff1744",
};
const QUALITY_COLORS = {
  OPTIMAL:    "#00e676",
  ACCEPTABLE: "#00b0ff",
  LATE:       "#ffab00",
  EXHAUSTED:  "#ff1744",
};
const REGIME_COLORS = {
  TRENDING:      "#00d4aa",
  RANGING:       "#ffab00",
  TRANSITIONING: "#64748b",
  UNKNOWN:       "#64748b",
};

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline stages definition
// ─────────────────────────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  {
    id: "setup",
    label: "Setup",
    sublabel: "Leading Indicators",
    icon: <TimelineIcon sx={{ fontSize: 20 }} />,
    description: "BB/KC squeeze, divergence, OI walls, VWAP deviation, breadth",
    phaseColor: "#00d4aa",
  },
  {
    id: "trigger",
    label: "Trigger",
    sublabel: "Coincident Indicators",
    icon: <FlashOnIcon sx={{ fontSize: 20 }} />,
    description: "Candle pattern, momentum ignition, breakout, Supertrend flip",
    phaseColor: "#00b0ff",
  },
  {
    id: "context",
    label: "Context",
    sublabel: "Regime + Session",
    icon: <FilterAltIcon sx={{ fontSize: 20 }} />,
    description: "Regime alignment, EMA structure, session phase, options bias",
    phaseColor: "#ffab00",
  },
  {
    id: "exhaustion",
    label: "Exhaustion",
    sublabel: "Timing Filter",
    icon: <TuneIcon sx={{ fontSize: 20 }} />,
    description: "Extension %, Fibonacci pullback zone, 1H multi-TF downgrade",
    phaseColor: "#ff9100",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Phase roadmap data
// ─────────────────────────────────────────────────────────────────────────────
const PHASES = [
  { num: 1, label: "Indicator Foundation",    done: true  },
  { num: 2, label: "Signal Engine Core",      done: true  },
  { num: 3, label: "Data Layer",              done: false },
  { num: 4, label: "Options Intelligence",    done: false },
  { num: 5, label: "Risk Framework",          done: false },
  { num: 6, label: "Dispatch",                done: false },
  { num: 7, label: "Pipeline Orchestrator",   done: false },
  { num: 8, label: "Audit & Calibration",     done: false },
  { num: 9, label: "Integration",             done: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function MonoText({ children, sx = {} }) {
  return (
    <Typography
      component="span"
      sx={{ fontFamily: '"JetBrains Mono", monospace', ...sx }}
    >
      {children}
    </Typography>
  );
}

function StatusBadge({ label, color, bg }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.2,
        py: 0.35,
        borderRadius: 1.5,
        background: bg || `${color}15`,
        border: `1px solid ${color}35`,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 6px ${color}`,
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.4 },
          },
        }}
      />
      <MonoText sx={{ fontSize: "0.65rem", fontWeight: 700, color }}>{label}</MonoText>
    </Box>
  );
}

function PipelineDiagram({ pipelineStatus, setupCount = 0, signalCount = 0 }) {
  const theme = useTheme();
  const live = pipelineStatus === "LIVE";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
      {PIPELINE_STAGES.map((stage, i) => (
        <React.Fragment key={stage.id}>
          <Box
            sx={{
              flex: 1,
              minWidth: 110,
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${live ? stage.phaseColor + "40" : "rgba(255,255,255,0.06)"}`,
              background: live
                ? `${stage.phaseColor}08`
                : theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.02)"
                : "rgba(0,0,0,0.02)",
              textAlign: "center",
              transition: "all 0.3s",
              position: "relative",
            }}
          >
            <Box sx={{ color: live ? stage.phaseColor : "text.disabled", mb: 0.5 }}>
              {stage.icon}
            </Box>
            <MonoText
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: live ? stage.phaseColor : "text.disabled",
                display: "block",
              }}
            >
              {stage.label.toUpperCase()}
            </MonoText>
            <MonoText
              sx={{ fontSize: "0.58rem", color: "text.disabled", display: "block", mt: 0.3 }}
            >
              {stage.sublabel}
            </MonoText>
            <Tooltip title={stage.description} placement="bottom" arrow>
              <Box
                sx={{
                  mt: 1,
                  fontSize: "0.62rem",
                  fontFamily: '"JetBrains Mono", monospace',
                  color: live ? stage.phaseColor : "text.disabled",
                  fontWeight: 700,
                }}
              >
                {!live ? "—" : i === 0 ? setupCount : i === 3 ? signalCount : "•"}
              </Box>
            </Tooltip>
          </Box>
          {i < PIPELINE_STAGES.length - 1 && (
            <Box
              sx={{
                width: 20,
                height: 2,
                background: live
                  ? `linear-gradient(90deg, ${PIPELINE_STAGES[i].phaseColor}, ${PIPELINE_STAGES[i + 1].phaseColor})`
                  : "rgba(255,255,255,0.08)",
                flexShrink: 0,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
}

function SignalCard({ signal, glass }) {
  const dirColor = DIRECTION_COLORS[signal.direction] || "#64748b";
  const confColor = CONFIDENCE_COLORS[signal.confidence] || "#64748b";
  const qualColor = QUALITY_COLORS[signal.entry_quality] || "#64748b";

  return (
    <Card
      sx={{
        ...glass,
        border: `1px solid ${confColor}30`,
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Confidence stripe */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          borderRadius: "12px 12px 0 0",
          background: `linear-gradient(90deg, ${confColor}, ${dirColor})`,
        }}
      />
      <CardContent sx={{ pt: 2, pb: "12px !important" }}>
        {/* Header row */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {signal.direction === "BUY" ? (
              <TrendingUpIcon sx={{ color: dirColor, fontSize: 18 }} />
            ) : (
              <TrendingDownIcon sx={{ color: dirColor, fontSize: 18 }} />
            )}
            <MonoText sx={{ fontWeight: 700, fontSize: "0.85rem", color: dirColor }}>
              {signal.direction}
            </MonoText>
            <MonoText sx={{ fontSize: "0.75rem", color: "text.primary", fontWeight: 600 }}>
              {signal.instrument}
            </MonoText>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Chip
              label={signal.confidence}
              size="small"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.58rem",
                fontWeight: 700,
                height: 20,
                background: `${confColor}20`,
                color: confColor,
                border: `1px solid ${confColor}40`,
              }}
            />
            <Chip
              label={signal.entry_quality}
              size="small"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.58rem",
                fontWeight: 700,
                height: 20,
                background: `${qualColor}15`,
                color: qualColor,
                border: `1px solid ${qualColor}30`,
              }}
            />
          </Box>
        </Box>

        {/* Setup type */}
        <MonoText sx={{ fontSize: "0.65rem", color: "text.secondary", display: "block", mb: 1.5 }}>
          {signal.setup_type?.replace(/_/g, " ")}
        </MonoText>

        {/* Score bars */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
          {[
            { label: "SETUP",    val: signal.setup_score    },
            { label: "TRIGGER",  val: signal.trigger_score  },
            { label: "CONTEXT",  val: signal.context_score  },
            { label: "TIMING",   val: signal.timing_score   },
          ].map(({ label, val }) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MonoText sx={{ fontSize: "0.55rem", color: "text.disabled", width: 46 }}>
                {label}
              </MonoText>
              <LinearProgress
                variant="determinate"
                value={(val || 0) * 100}
                sx={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.06)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${confColor}80, ${confColor})`,
                  },
                }}
              />
              <MonoText sx={{ fontSize: "0.6rem", color: confColor, width: 30, textAlign: "right" }}>
                {((val || 0) * 100).toFixed(0)}%
              </MonoText>
            </Box>
          ))}
        </Box>

        {/* Score aggregate */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 0.8,
            borderRadius: 1,
            background: `${confColor}10`,
            border: `1px solid ${confColor}20`,
            mb: 1.5,
          }}
        >
          <MonoText sx={{ fontSize: "0.62rem", color: "text.disabled" }}>AGG SCORE</MonoText>
          <MonoText sx={{ fontSize: "0.7rem", fontWeight: 700, color: confColor }}>
            {((signal.aggregate_score || 0) * 100).toFixed(1)}%
          </MonoText>
        </Box>

        {/* Entry / SL / Targets */}
        <Grid container spacing={0.5} sx={{ mb: 1 }}>
          {[
            { l: "ENTRY ZONE", v: `₹${signal.entry_zone_low?.toFixed(0)} – ${signal.entry_zone_high?.toFixed(0)}` },
            { l: "SL",  v: signal.sl_price   ? `₹${signal.sl_price.toFixed(0)}`  : "—" },
            { l: "T1",  v: signal.target1     ? `₹${signal.target1.toFixed(0)}`   : "—" },
            { l: "T2",  v: signal.target2     ? `₹${signal.target2.toFixed(0)}`   : "—" },
          ].map(({ l, v }) => (
            <Grid item xs={6} key={l}>
              <Box sx={{ px: 0.8, py: 0.4, borderRadius: 1, background: "rgba(255,255,255,0.03)" }}>
                <MonoText sx={{ fontSize: "0.52rem", color: "text.disabled", display: "block" }}>{l}</MonoText>
                <MonoText sx={{ fontSize: "0.65rem", fontWeight: 600 }}>{v}</MonoText>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Extension % */}
        <Box sx={{ display: "flex", gap: 0.8, flexWrap: "wrap" }}>
          <Chip
            label={`EXT ${signal.extension_pct?.toFixed(1)}%`}
            size="small"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.55rem",
              height: 18,
              background: `${qualColor}15`,
              color: qualColor,
            }}
          />
          <Chip
            label={signal.regime || "?"}
            size="small"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.55rem",
              height: 18,
              background: "rgba(255,255,255,0.05)",
              color: "text.secondary",
            }}
          />
          <Chip
            label={signal.session_phase || "?"}
            size="small"
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.55rem",
              height: 18,
              background: "rgba(255,255,255,0.05)",
              color: "text.secondary",
            }}
          />
        </Box>

        {/* Warnings */}
        {signal.warnings?.length > 0 && (
          <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
            {signal.warnings.map((w) => (
              <Chip
                key={w}
                icon={<WarningIcon sx={{ fontSize: "10px !important" }} />}
                label={w.replace(/_/g, " ")}
                size="small"
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.52rem",
                  height: 18,
                  background: "rgba(255,171,0,0.1)",
                  color: "#ffab00",
                  border: "1px solid rgba(255,171,0,0.2)",
                  "& .MuiChip-icon": { color: "#ffab00" },
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function SetupsTable({ setups }) {
  const theme = useTheme();
  if (!setups || setups.length === 0) return null;

  return (
    <TableContainer>
      <Table size="small" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
        <TableHead>
          <TableRow>
            {["Instrument", "Type", "Dir", "Score", "Bars", "Entry Zone", "Inv. Level"].map((h) => (
              <TableCell
                key={h}
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: "text.disabled",
                  py: 0.8,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  whiteSpace: "nowrap",
                }}
              >
                {h.toUpperCase()}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {setups.map((s) => {
            const dirColor = DIRECTION_COLORS[s.direction] || "#64748b";
            return (
              <TableRow
                key={s.setup_id}
                sx={{
                  "&:hover": { background: "rgba(255,255,255,0.02)" },
                  "& td": { borderBottom: `1px solid ${theme.palette.divider}30` },
                }}
              >
                <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.7rem", fontWeight: 700, py: 0.8 }}>
                  {s.instrument}
                </TableCell>
                <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.62rem", color: "text.secondary", py: 0.8 }}>
                  {s.setup_type?.replace(/_/g, " ")}
                </TableCell>
                <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.65rem", fontWeight: 700, color: dirColor, py: 0.8 }}>
                  {s.direction}
                </TableCell>
                <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.65rem", py: 0.8 }}>
                  {((s.setup_score || 0) * 100).toFixed(0)}%
                </TableCell>
                <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.65rem", py: 0.8 }}>
                  {s.bars_alive ?? "—"}
                </TableCell>
                <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.62rem", color: "text.secondary", py: 0.8, whiteSpace: "nowrap" }}>
                  {s.entry_zone_low != null
                    ? `₹${s.entry_zone_low.toFixed(0)} – ${s.entry_zone_high.toFixed(0)}`
                    : "—"}
                </TableCell>
                <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.62rem", color: "#ff1744", py: 0.8 }}>
                  {s.invalidation_level != null ? `₹${s.invalidation_level.toFixed(0)}` : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function PhaseRoadmap({ phasesComplete = [], phasesPending = [] }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {PHASES.map((p) => {
        const done =
          phasesComplete.some((k) => k.includes(`phase_${p.num}`)) ||
          (p.num <= 2 && phasesComplete.length === 0); // default: 1+2 done
        return (
          <Box
            key={p.num}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              px: 1.2,
              py: 0.6,
              borderRadius: 1.5,
              border: `1px solid ${done ? "#00d4aa30" : theme.palette.divider}`,
              background: done ? "rgba(0,212,170,0.06)" : "rgba(255,255,255,0.02)",
            }}
          >
            {done ? (
              <CheckCircleIcon sx={{ fontSize: 12, color: "#00d4aa" }} />
            ) : (
              <PendingIcon sx={{ fontSize: 12, color: "text.disabled" }} />
            )}
            <MonoText
              sx={{
                fontSize: "0.62rem",
                color: done ? "#00d4aa" : "text.disabled",
                fontWeight: done ? 700 : 400,
              }}
            >
              P{p.num} {p.label}
            </MonoText>
          </Box>
        );
      })}
    </Box>
  );
}

function EmptyState({ icon, title, subtitle }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 5,
        gap: 1.5,
        opacity: 0.6,
      }}
    >
      <Box sx={{ fontSize: 40, color: "text.disabled" }}>{icon}</Box>
      <MonoText sx={{ fontSize: "0.85rem", fontWeight: 700, color: "text.secondary" }}>
        {title}
      </MonoText>
      <MonoText sx={{ fontSize: "0.72rem", color: "text.disabled", textAlign: "center", maxWidth: 400 }}>
        {subtitle}
      </MonoText>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Panel
// ─────────────────────────────────────────────────────────────────────────────

export default function V5Panel() {
  const theme = useTheme();
  const [health, setHealth] = useState(null);
  const [signals, setSignals] = useState([]);
  const [setups, setSetups]   = useState([]);
  const [regime, setRegime]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [blackout, setBlackout] = useState(false);
  const [blackoutLoading, setBlackoutLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const glass = {
    background:
      theme.palette.mode === "dark"
        ? "rgba(30,41,59,0.7)"
        : "rgba(255,255,255,0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: `1px solid ${
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.05)"
    }`,
    boxShadow: theme.shadows[4],
    transition: "transform 0.2s, box-shadow 0.2s",
    "&:hover": { transform: "translateY(-2px)", boxShadow: theme.shadows[8] },
  };

  const fetchAll = useCallback(async () => {
    try {
      const [hRes, sRes, stRes, rRes] = await Promise.all([
        axios.get(`${API}/api/v5/health`),
        axios.get(`${API}/api/v5/signals/active`),
        axios.get(`${API}/api/v5/setups/active`),
        axios.get(`${API}/api/v5/regime`),
      ]);
      setHealth(hRes.data?.v5 || null);
      setSignals(sRes.data?.signals || []);
      setSetups(stRes.data?.setups || []);
      setRegime(rRes.data?.regime || null);
      setBlackout(hRes.data?.v5?.blackout || false);
      setLastRefreshed(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setError(null);
    } catch (e) {
      setError(e.response?.data?.detail || e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const iv = setInterval(fetchAll, 15000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  const toggleBlackout = async (enabled) => {
    setBlackoutLoading(true);
    try {
      await axios.post(`${API}/api/v5/blackout?enable=${enabled}`);
      setBlackout(enabled);
    } catch {
      /* ignore */
    } finally {
      setBlackoutLoading(false);
    }
  };

  // ── Derived ──
  const pipelineStatus = health?.pipeline_status || "PENDING_PIPELINE";
  const pipelineLive   = pipelineStatus === "LIVE";
  const statusColor    = pipelineLive
    ? "#00e676"
    : pipelineStatus === "BLACKOUT"
    ? "#ff1744"
    : "#64748b";
  const regimeColor    = REGIME_COLORS[regime?.regime] || "#64748b";

  // ── Loading ──
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
        <CircularProgress size={32} sx={{ color: "#00d4aa" }} />
        <MonoText sx={{ ml: 2, fontSize: "0.8rem", color: "text.secondary" }}>
          Loading V5 Engine...
        </MonoText>
      </Box>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <IconButton size="small" onClick={fetchAll}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 } }}>
      {/* ── Header Status Bar ── */}
      <Card sx={{ ...glass, mb: 2 }}>
        <CardContent sx={{ py: "12px !important" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            {/* Left: title + status */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AutoFixHighIcon sx={{ color: "#00d4aa", fontSize: 22 }} />
              <Box>
                <MonoText sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary", display: "block" }}>
                  V5 ANTICIPATORY ENGINE
                </MonoText>
                <MonoText sx={{ fontSize: "0.6rem", color: "text.disabled", display: "block" }}>
                  4-Stage Gating Pipeline · Nifty & BankNifty
                </MonoText>
              </Box>
              <StatusBadge label={pipelineStatus.replace(/_/g, " ")} color={statusColor} />
            </Box>

            {/* Right: regime + refresh + blackout */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              {regime && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    px: 1.2,
                    py: 0.5,
                    borderRadius: 1.5,
                    background: `${regimeColor}12`,
                    border: `1px solid ${regimeColor}30`,
                  }}
                >
                  <MonoText sx={{ fontSize: "0.6rem", color: "text.disabled" }}>REGIME</MonoText>
                  <MonoText sx={{ fontSize: "0.68rem", fontWeight: 700, color: regimeColor }}>
                    {regime.regime}
                  </MonoText>
                  <MonoText sx={{ fontSize: "0.6rem", color: "text.disabled" }}>
                    {(regime.confidence * 100).toFixed(0)}%
                  </MonoText>
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={blackout}
                    onChange={(e) => toggleBlackout(e.target.checked)}
                    disabled={blackoutLoading}
                    sx={{
                      "& .MuiSwitch-thumb": { background: blackout ? "#ff1744" : "#64748b" },
                      "& .MuiSwitch-track": { background: blackout ? "#ff174450" : undefined },
                    }}
                  />
                }
                label={
                  <MonoText sx={{ fontSize: "0.62rem", color: blackout ? "#ff1744" : "text.disabled" }}>
                    {blackout ? "BLACKOUT ON" : "BLACKOUT OFF"}
                  </MonoText>
                }
                sx={{ m: 0 }}
              />

              <Tooltip title="Refresh">
                <IconButton size="small" onClick={fetchAll} sx={{ color: "text.disabled", "&:hover": { color: "#00d4aa" } }}>
                  <RefreshIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {lastRefreshed && (
                <MonoText sx={{ fontSize: "0.58rem", color: "text.disabled" }}>
                  {lastRefreshed}
                </MonoText>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* ── Pending-pipeline notice ── */}
      {!pipelineLive && (
        <Alert
          severity="info"
          icon={<AutoFixHighIcon fontSize="small" />}
          sx={{
            mb: 2,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.72rem",
            "& .MuiAlert-message": { fontFamily: '"JetBrains Mono", monospace' },
          }}
        >
          <strong>V5 Phase 1-2 complete</strong> — Indicator foundation and signal engine core are built and tested
          (63/63 tests passing). Live signals will appear once Phase 3 (data streaming) is connected.
        </Alert>
      )}

      {/* ── 4-Stage Pipeline Diagram ── */}
      <Card sx={{ ...glass, mb: 2 }}>
        <CardContent>
          <MonoText sx={{ fontSize: "0.65rem", color: "text.disabled", display: "block", mb: 1.5, letterSpacing: "0.08em" }}>
            4-STAGE GATING PIPELINE
          </MonoText>
          <PipelineDiagram
            pipelineStatus={pipelineStatus}
            setupCount={setups.length}
            signalCount={signals.length}
          />
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {/* ── Active Signals ── */}
        <Grid item xs={12}>
          <Card sx={{ ...glass }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FlashOnIcon sx={{ color: "#00d4aa", fontSize: 18 }} />
                  <MonoText sx={{ fontWeight: 700, fontSize: "0.8rem" }}>ACTIVE SIGNALS</MonoText>
                  {signals.length > 0 && (
                    <Chip
                      label={signals.length}
                      size="small"
                      sx={{
                        height: 18,
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: "0.6rem",
                        background: "#00d4aa20",
                        color: "#00d4aa",
                        border: "1px solid #00d4aa30",
                      }}
                    />
                  )}
                </Box>
              </Box>

              {signals.length === 0 ? (
                <EmptyState
                  icon={<FlashOnIcon sx={{ fontSize: 40, color: "text.disabled" }} />}
                  title="No Active Signals"
                  subtitle={
                    pipelineLive
                      ? "All four pipeline stages are gatekeeping. No valid setups have produced a qualifying signal right now."
                      : "Signals will appear here once the Phase 3 data pipeline is connected and the orchestrator begins feeding 1m candles into the indicator engine."
                  }
                />
              ) : (
                <Grid container spacing={2}>
                  {signals.map((sig) => (
                    <Grid item xs={12} sm={6} md={4} key={sig.signal_id}>
                      <SignalCard signal={sig} glass={glass} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Active Setups ── */}
        <Grid item xs={12}>
          <Card sx={{ ...glass }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <TimelineIcon sx={{ color: "#00b0ff", fontSize: 18 }} />
                <MonoText sx={{ fontWeight: 700, fontSize: "0.8rem" }}>ACTIVE SETUPS</MonoText>
                <MonoText sx={{ fontSize: "0.62rem", color: "text.disabled", ml: 0.5 }}>
                  — anticipatory formations awaiting trigger
                </MonoText>
                {setups.length > 0 && (
                  <Chip
                    label={setups.length}
                    size="small"
                    sx={{
                      height: 18,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.6rem",
                      background: "#00b0ff20",
                      color: "#00b0ff",
                      border: "1px solid #00b0ff30",
                    }}
                  />
                )}
              </Box>

              {setups.length === 0 ? (
                <EmptyState
                  icon={<TimelineIcon sx={{ fontSize: 40, color: "text.disabled" }} />}
                  title="No Active Setups"
                  subtitle={
                    pipelineLive
                      ? "Leading indicators have not detected any qualifying pre-move conditions (squeeze, divergence, OI wall proximity, VWAP deviation, breadth divergence) on current data."
                      : "Setups will appear here when the pipeline begins detecting BB/KC squeeze, price-RSI divergences, OI wall proximity, or VWAP deviations on live market data."
                  }
                />
              ) : (
                <SetupsTable setups={setups} />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ── Phase Roadmap ── */}
        <Grid item xs={12}>
          <Card sx={{ ...glass }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <CheckCircleIcon sx={{ color: "#00d4aa", fontSize: 18 }} />
                <MonoText sx={{ fontWeight: 700, fontSize: "0.8rem" }}>BUILD PROGRESS</MonoText>
              </Box>
              <PhaseRoadmap
                phasesComplete={health?.phases_complete || []}
                phasesPending={health?.phases_pending || []}
              />

              {/* Design principles */}
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1.5}>
                {[
                  { title: "LEADING → detects BEFORE move",   desc: "BB squeeze, divergence, OI walls, VWAP deviation, breadth",    color: "#00d4aa" },
                  { title: "COINCIDENT → confirms move START", desc: "Candle patterns, momentum ignition, breakout validation",       color: "#00b0ff" },
                  { title: "EXHAUSTION → blocks LATE entries", desc: "Extension %, Fibonacci zones, 1H multi-TF validation",          color: "#ff9100" },
                  { title: "STABILITY → prevents CHOP",       desc: "Cooldown, flip-protection, hysteresis, duplicate suppression",  color: "#ffab00" },
                ].map((p) => (
                  <Grid item xs={12} sm={6} key={p.title}>
                    <Box
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        border: `1px solid ${p.color}20`,
                        background: `${p.color}06`,
                      }}
                    >
                      <MonoText sx={{ fontSize: "0.65rem", fontWeight: 700, color: p.color, display: "block" }}>
                        {p.title}
                      </MonoText>
                      <MonoText sx={{ fontSize: "0.6rem", color: "text.disabled", display: "block", mt: 0.3 }}>
                        {p.desc}
                      </MonoText>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
