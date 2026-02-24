/**
 * GatedSignalPanel.jsx
 * Replaces the misleading "STRONG BUY" composite chip with the gated signal.
 * Shows NO_TRADE honestly. Shows pillars, red flags, SL/Target.
 */
import React from "react";
import {
  Box, Card, CardContent, Typography, Chip, Alert, Tooltip,
  Grid, LinearProgress, useTheme,
} from "@mui/material";
import TrendingUpIcon    from "@mui/icons-material/TrendingUp";
import TrendingDownIcon  from "@mui/icons-material/TrendingDown";
import BlockIcon         from "@mui/icons-material/Block";
import WarningAmberIcon  from "@mui/icons-material/WarningAmber";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";

const ACTION_CONFIG = {
  BUY:  { color: "success", icon: <TrendingUpIcon />,   label: "BUY SIGNAL"   },
  SELL: { color: "error",   icon: <TrendingDownIcon />, label: "SELL SIGNAL"  },
  WAIT: { color: "default", icon: <BlockIcon />,        label: "NO TRADE"     },
};

const CONFIDENCE_COLOR = {
  HIGH:     "success",
  MEDIUM:   "warning",
  LOW:      "error",
  NO_TRADE: "default",
};

/* ── Pillar bar ── */
const PillarBar = ({ name, score }) => {
  const abs   = Math.abs(score);
  const color = score > 0.15 ? "success" : score < -0.15 ? "error" : "warning";
  return (
    <Box sx={{ mb: 0.6 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.62rem", textTransform: "uppercase" }}>
          {name}
        </Typography>
        <Typography variant="caption" sx={{
          fontSize: "0.62rem", fontWeight: "bold",
          color: score > 0.15 ? "success.main" : score < -0.15 ? "error.main" : "text.secondary",
        }}>
          {score > 0 ? "+" : ""}{score.toFixed(2)}
        </Typography>
      </Box>
      <Box sx={{ position: "relative", height: 6, bgcolor: "divider", borderRadius: 3 }}>
        <Box sx={{
          position: "absolute",
          left:  score >= 0 ? "50%" : `${(0.5 + score / 2) * 100}%`,
          width: `${abs * 50}%`,
          height: "100%",
          borderRadius: 3,
          bgcolor: `${color}.main`,
          opacity: 0.85,
        }} />
        <Box sx={{ position: "absolute", left: "50%", width: 1.5, height: "100%", bgcolor: "text.disabled" }} />
      </Box>
    </Box>
  );
};

/* ── Regime stability bar ── */
const RegimeBar = ({ regimeDetail }) => {
  if (!regimeDetail) return null;
  const { regime, confidence, smooth_adx, smooth_ci, bars_stable } = regimeDetail;
  const regimeColor = regime === "TRENDING" ? "success" : regime === "RANGING" ? "warning" : "info";
  return (
    <Box sx={{ mb: 2, p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.05)", border: "1px solid", borderColor: "divider" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Tooltip title="Market regime is now stable — requires sustained ADX/Choppiness shifts to change. Bars stable shows how long we've been in this regime." arrow>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", cursor: "help" }}>
            <Chip size="small" label={regime} color={regimeColor} sx={{ fontWeight: "bold" }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
              {bars_stable} bars stable
            </Typography>
          </Box>
        </Tooltip>
        <Tooltip title={`Regime confidence: ${(confidence * 100).toFixed(0)}%. Higher = more firmly in this regime. Low confidence means near the boundary.`} arrow>
          <Box sx={{ textAlign: "right", cursor: "help" }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.55rem", display: "block" }}>Confidence</Typography>
            <Typography variant="caption" fontWeight="bold" sx={{ fontSize: "0.7rem", color: confidence > 0.6 ? "success.main" : confidence > 0.4 ? "warning.main" : "error.main" }}>
              {(confidence * 100).toFixed(0)}%
            </Typography>
          </Box>
        </Tooltip>
      </Box>
      <LinearProgress
        variant="determinate"
        value={confidence * 100}
        color={confidence > 0.6 ? "success" : confidence > 0.4 ? "warning" : "error"}
        sx={{ height: 4, borderRadius: 2 }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.5rem" }}>
          ADX(smooth): {smooth_adx}
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.5rem" }}>
          CI(smooth): {smooth_ci}
        </Typography>
      </Box>
    </Box>
  );
};


export default function GatedSignalPanel({ signalSummary, regimeDetail, glass }) {
  const theme = useTheme();
  const gated = signalSummary?.gated_signal;
  if (!gated) return null;

  const { action, confidence, score, pillars_met, red_flags,
          suggested_sl, suggested_target, rr_ratio, reasoning, raw_scores } = gated;

  const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.WAIT;
  const isTrading = action !== "WAIT";

  return (
    <Card sx={{ ...glass, mb: 3, borderLeft: "4px solid", borderLeftColor: isTrading ? `${cfg.color}.main` : "divider" }}>
      <CardContent>
        {/* ── Header ── */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              icon={cfg.icon}
              label={cfg.label}
              color={cfg.color}
              sx={{ fontWeight: "bold", fontSize: "0.85rem", px: 1 }}
            />
            {isTrading && (
              <Chip
                size="small"
                label={confidence}
                color={CONFIDENCE_COLOR[confidence]}
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
            )}
          </Box>
          <Tooltip title="Gated Score: ranges from -1 (strong bearish) to +1 (strong bullish). Only generates BUY/SELL when multiple independent evidence pillars align AND no red flags exist." arrow>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                color: score > 0.3 ? "success.main" : score < -0.3 ? "error.main" : "text.secondary",
                cursor: "help",
              }}
            >
              {score > 0 ? "+" : ""}{score.toFixed(3)}
            </Typography>
          </Tooltip>
        </Box>

        {/* ── Reasoning ── */}
        <Alert
          severity={action === "WAIT" ? "info" : confidence === "HIGH" ? "success" : "warning"}
          sx={{ mb: 2, fontSize: "0.72rem", py: 0.5 }}
          icon={action === "WAIT" ? <BlockIcon /> : isTrading ? <CheckCircleIcon /> : undefined}
        >
          {reasoning}
        </Alert>

        {/* ── Regime stability ── */}
        <RegimeBar regimeDetail={regimeDetail} />

        {/* ── Pillar breakdown ── */}
        {raw_scores && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 0.8 }}>
              EVIDENCE PILLARS
            </Typography>
            {Object.entries(raw_scores).map(([k, v]) => (
              <PillarBar key={k} name={k.replace(/_/g, " ")} score={v} />
            ))}
          </Box>
        )}

        {/* ── Confirmed pillars ── */}
        {pillars_met.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 0.5 }}>
              CONFIRMED ({pillars_met.length})
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {pillars_met.map((p, i) => (
                <Chip key={i} size="small" icon={<CheckCircleIcon />} label={p}
                  color="success" variant="outlined" sx={{ height: 20, fontSize: "0.6rem" }} />
              ))}
            </Box>
          </Box>
        )}

        {/* ── Red flags ── */}
        {red_flags.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="error.main" fontWeight="bold" sx={{ display: "block", mb: 0.5 }}>
              ⚠ RED FLAGS ({red_flags.length})
            </Typography>
            {red_flags.map((f, i) => (
              <Alert key={i} severity="warning" icon={<WarningAmberIcon fontSize="small" />}
                sx={{ mb: 0.4, py: 0.3, fontSize: "0.65rem" }}>
                {f}
              </Alert>
            ))}
          </Box>
        )}

        {/* ── SL / Target / R:R ── */}
        {isTrading && (
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.05)", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 0.8 }}>
              TRADE LEVELS (INDICATIVE ONLY)
            </Typography>
            <Grid container spacing={1}>
              {[
                { label: "Entry",     value: `₹${suggested_sl > 0 ? "current" : "—"}`, color: "text.primary" },
                { label: "Stop Loss", value: `₹${suggested_sl.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,   color: "error.main"   },
                { label: "Target",    value: `₹${suggested_target.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, color: "success.main" },
                { label: "R:R",       value: `1 : ${rr_ratio.toFixed(2)}`, color: rr_ratio >= 2 ? "success.main" : rr_ratio >= 1.5 ? "warning.main" : "error.main" },
              ].map(({ label, value, color }) => (
                <Grid item xs={3} key={label}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.55rem", display: "block" }}>{label}</Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ color, fontFamily: "'JetBrains Mono',monospace", fontSize: "0.78rem" }}>{value}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* ── Disclaimer ── */}
        <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1.5, fontStyle: "italic", fontSize: "0.5rem" }}>
          ⚠️ This is a DECISION-SUPPORT tool, not a trade recommendation. A NO TRADE signal is often the most valuable output.
          Always apply your own judgment. Past signals do not predict future results. Options carry unlimited loss risk.
          Never trade based solely on this system.
        </Typography>
      </CardContent>
    </Card>
  );
}
