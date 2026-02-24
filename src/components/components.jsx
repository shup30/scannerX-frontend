import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  Speed as SpeedIcon,
  Info as InfoIcon,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import BoltIcon from "@mui/icons-material/Bolt";
import { getBacktestResults, formatTimeAgo } from '../utils/utils';

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_META = {
  intraday: {
    label: "Intraday 5m",
    shortLabel: "5MIN",
    color: "#ffab00",
    bg: "rgba(255,171,0,0.12)",
    icon: <BoltIcon sx={{ fontSize: 11 }} />,
    gradient: "linear-gradient(135deg, #ffab00, #ff8f00)",
  },
  swing_long: {
    label: "Swing LONG",
    shortLabel: "SWING",
    color: "#00e676",
    bg: "rgba(0,230,118,0.1)",
    icon: <DateRangeIcon sx={{ fontSize: 11 }} />,
    gradient: "linear-gradient(135deg, #00e676, #00b248)",
  },
  swing_short: {
    label: "Swing SHORT",
    shortLabel: "SWING",
    color: "#ff1744",
    bg: "rgba(255,23,68,0.1)",
    icon: <DateRangeIcon sx={{ fontSize: 11 }} />,
    gradient: "linear-gradient(135deg, #ff1744, #c4001d)",
  },
  swing_1_4: {
    label: "Swing 1–4d",
    shortLabel: "QUICK",
    color: "#00b0ff",
    bg: "rgba(0,176,255,0.1)",
    icon: <AccessTimeIcon sx={{ fontSize: 11 }} />,
    gradient: "linear-gradient(135deg, #00b0ff, #008dcc)",
  },
  test: {
    label: "Test",
    shortLabel: "TEST",
    color: "#64748b",
    bg: "rgba(100,116,139,0.1)",
    icon: <SpeedIcon sx={{ fontSize: 11 }} />,
    gradient: "linear-gradient(135deg, #64748b, #475569)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY BADGE
// ─────────────────────────────────────────────────────────────────────────────
export function CategoryBadge({ category, size = "medium" }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.test;
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const actualSize = isMobile ? "small" : size;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: actualSize === "small" ? 0.8 : 1.2,
        py: actualSize === "small" ? 0.2 : 0.4,
        borderRadius: 6,
        background: meta.bg,
        border: `1.5px solid ${meta.color}35`,
        color: meta.color,
        fontSize: actualSize === "small" ? "0.65rem" : "0.72rem",
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
        boxShadow: `0 2px 8px ${meta.color}18`,
      }}
    >
      <>
        {meta.icon}
        <span>{actualSize === "small" ? meta.shortLabel : meta.label}</span>
      </>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTION BADGE
// ─────────────────────────────────────────────────────────────────────────────
export function DirectionBadge({ signalType, size = "medium" }) {
  if (!signalType || signalType === "TEST") return null;
  const isLong = signalType === "LONG";
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const actualSize = isMobile ? "small" : size;

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        px: actualSize === "small" ? 0.8 : 1,
        py: actualSize === "small" ? 0.2 : 0.35,
        borderRadius: 6,
        background: isLong ? "rgba(0,230,118,0.12)" : "rgba(255,23,68,0.12)",
        border: `1.5px solid ${isLong ? "#00e67645" : "#ff174445"}`,
        color: isLong ? "#00e676" : "#ff1744",
        fontSize: actualSize === "small" ? "0.65rem" : "0.72rem",
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        boxShadow: isLong
          ? "0 2px 8px rgba(0,230,118,0.2)"
          : "0 2px 8px rgba(255,23,68,0.2)",
      }}
    >
      {isLong ? (
        <TrendingUpIcon sx={{ fontSize: 12 }} />
      ) : (
        <TrendingDownIcon sx={{ fontSize: 12 }} />
      )}
      <span>{signalType}</span>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONO LABEL
// ─────────────────────────────────────────────────────────────────────────────
export function MonoLabel({
  children,
  color = "#64748b",
  size = "0.7rem",
  spacing = "0.08em",
}) {
  return (
    <Typography
      sx={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: size,
        color,
        letterSpacing: spacing,
        textTransform: "uppercase",
        fontWeight: 700,
      }}
    >
      {children}
    </Typography>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────────────────────
export function StatCard({ label, value, accent, sub, pulse, icon }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: theme.palette.background.elevated,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${accent || theme.palette.primary.main}25`,
        },
      }}
    >
      {pulse && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, transparent, ${accent || theme.palette.primary.main}, transparent)`,
            animation: "shimmer 2.5s infinite",
            "@keyframes shimmer": {
              "0%": { transform: "translateX(-100%)" },
              "100%": { transform: "translateX(100%)" },
            },
          }}
        />
      )}
      <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.8,
          }}
        >
          {icon && (
            <Box
              sx={{
                color: accent || theme.palette.primary.main,
                display: "flex",
                opacity: 0.8,
              }}
            >
              {icon}
            </Box>
          )}
          <MonoLabel color={theme.palette.text.disabled} size="0.65rem">
            {label}
          </MonoLabel>
        </Box>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            color: accent || theme.palette.text.primary,
            lineHeight: 1.1,
            fontWeight: 800,
            background: accent
              ? `linear-gradient(135deg, ${accent}, ${accent}cc)`
              : undefined,
            backgroundClip: accent ? "text" : undefined,
            WebkitBackgroundClip: accent ? "text" : undefined,
            WebkitTextFillColor: accent ? "transparent" : undefined,
          }}
        >
          {value}
        </Typography>
        {sub && (
          <MonoLabel
            color={theme.palette.text.disabled}
            size="0.62rem"
            spacing="0.04em"
          >
            {sub}
          </MonoLabel>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENHANCED STRATEGY CARD WITH BACKTEST STATS
// ─────────────────────────────────────────────────────────────────────────────
export function EnhancedStrategyCard({
  stratKey,
  strategy,
  selected,
  isRunning,
  onClick,
  getIcon,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isShort = strategy.signalType === "SHORT";
  const ac = isShort ? theme.palette.error.main : theme.palette.primary.main;

  // Get stored backtest results
  const backtestData = getBacktestResults(stratKey);
  const hasBacktestData = backtestData?.aggregate;

  return (
    <Tooltip
      title={
        <Box>
          {isRunning && (
            <Typography
              sx={{
                fontSize: "0.65rem",
                color: theme.palette.success.main,
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              ● ACTIVE AUTO-SCAN
            </Typography>
          )}
          {hasBacktestData ? (
            <Box sx={{ p: 1 }}>
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  mb: 0.8,
                  color: "#fff",
                }}
              >
                📊 Last Backtest Results
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#cbd5e0" }}>
                    Win Rate:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color:
                        backtestData.aggregate.overall_win_rate >= 50
                          ? "#00e676"
                          : "#ff4444",
                    }}
                  >
                    {backtestData.aggregate.overall_win_rate}%
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#cbd5e0" }}>
                    Avg P&L:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color:
                        backtestData.aggregate.avg_pnl_per_trade >= 0
                          ? "#00e676"
                          : "#ff4444",
                    }}
                  >
                    {backtestData.aggregate.avg_pnl_per_trade >= 0 ? "+" : ""}
                    {backtestData.aggregate.avg_pnl_per_trade}%
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: "0.68rem", color: "#cbd5e0" }}>
                    Total Trades:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#00d4aa",
                    }}
                  >
                    {backtestData.aggregate.total_trades}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    color: "#64748b",
                    mt: 0.3,
                    fontStyle: "italic",
                  }}
                >
                  {formatTimeAgo(backtestData.timestamp)}
                </Typography>
              </Box>
            </Box>
          ) : isRunning ? (
            ""
          ) : (
            ""
          )}
        </Box>
      }
      placement="top"
      arrow
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 300 }}
    >
      <Card
        onClick={onClick}
        sx={{
          cursor: "pointer",
          border: `2px solid ${isRunning ? theme.palette.success.main : selected ? `${ac}90` : "transparent"}`,
          background: isRunning
            ? `linear-gradient(135deg, ${theme.palette.success.main}12, ${theme.palette.success.main}08)`
            : selected
              ? isShort
                ? `linear-gradient(135deg, rgba(255,23,68,0.08), rgba(255,23,68,0.04))`
                : `linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,212,170,0.04))`
              : theme.palette.background.paper,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "relative",
          overflow: "hidden",
          height: "100%",
          boxShadow: isRunning
            ? `0 8px 32px ${theme.palette.success.main}15`
            : "none",
          "&:hover": {
            borderColor: isRunning ? theme.palette.success.main : `${ac}70`,
            transform: "translateY(-4px) scale(1.02)",
            boxShadow: isRunning
              ? `0 14px 44px ${theme.palette.success.main}25`
              : `0 12px 40px ${ac}25`,
          },
          "&::before": isRunning || selected
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: isRunning
                  ? theme.palette.success.main
                  : CATEGORY_META[strategy.category]?.gradient || ac,
                zIndex: 2,
              }
            : {},
        }}
      >
        <CardContent sx={{ p: isMobile ? 1.5 : 2, height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: isRunning ? `${theme.palette.success.main}18` : `${ac}18`,
                  border: `1.5px solid ${isRunning ? theme.palette.success.main + "40" : ac + "35"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isRunning ? theme.palette.success.main : ac,
                  position: "relative",
                  "& svg": { fontSize: 18 },
                }}
              >
                {getIcon(strategy.icon)}
                {isRunning && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: theme.palette.success.main,
                      border: `2px solid ${theme.palette.background.paper}`,
                      animation: "pulse 1.5s infinite",
                      "@keyframes pulse": {
                        "0%": { boxShadow: `0 0 0 0 ${theme.palette.success.main}70` },
                        "70%": { boxShadow: `0 0 0 6px ${theme.palette.success.main}00` },
                        "100%": { boxShadow: `0 0 0 0 ${theme.palette.success.main}00` },
                      },
                    }}
                  />
                )}
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: isMobile ? "0.8rem" : "0.85rem",
                    fontFamily: '"JetBrains Mono", monospace',
                    color: theme.palette.text.primary,
                    lineHeight: 1.3,
                  }}
                >
                  {strategy.name}
                </Typography>
              </Box>
            </Box>
            <DirectionBadge signalType={strategy.signalType} size="small" />
          </Box>

          <Typography
            sx={{
              fontSize: "0.72rem",
              color: theme.palette.text.secondary,
              fontFamily: '"Inter", sans-serif',
              lineHeight: 1.5,
              mb: 1.2,
              minHeight: isMobile ? "auto" : "2.8em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {strategy.description}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 0.8,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CategoryBadge category={strategy.category} size="small" />
              {isRunning && (
                <Chip
                  size="small"
                  label="LIVE"
                  sx={{
                    height: 18,
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    background: theme.palette.success.main,
                    color: "#fff",
                    border: "none",
                  }}
                />
              )}
            </Box>

            {hasBacktestData && (
              <Box sx={{ display: "flex", gap: 0.6 }}>
                <Chip
                  size="small"
                  label={`${backtestData.aggregate.overall_win_rate}%`}
                  sx={{
                    height: 20,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    background:
                      backtestData.aggregate.overall_win_rate >= 50
                        ? "rgba(0,230,118,0.15)"
                        : "rgba(255,23,68,0.15)",
                    color:
                      backtestData.aggregate.overall_win_rate >= 50
                        ? "#00e676"
                        : "#ff4444",
                    border: `1px solid ${backtestData.aggregate.overall_win_rate >= 50 ? "#00e67635" : "#ff174435"}`,
                  }}
                  icon={
                    backtestData.aggregate.overall_win_rate >= 50 ? (
                      <TrendingUp sx={{ fontSize: 12, color: "#00e676" }} />
                    ) : (
                      <TrendingDown sx={{ fontSize: 12, color: "#ff4444" }} />
                    )
                  }
                />
              </Box>
            )}
          </Box>

          {(selected || isRunning) && (
            <CheckCircleIcon
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                fontSize: 16,
                color: isRunning ? theme.palette.success.main : ac,
                opacity: 0.8,
              }}
            />
          )}
        </CardContent>
      </Card>
    </Tooltip>
  );
}
