import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Tabs,
  Tab,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Badge,
  Snackbar,
  Fade,
  Slide,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Info as InfoIcon,
  ShowChart as ShowChartIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Timeline as TimelineIcon,
  TrackChanges as TrackChangesIcon,
  Whatshot as WhatshotIcon,
  Refresh as RefreshIcon,
  FlashOn as FlashOnIcon,
  NorthEast as NorthEastIcon,
  SouthEast as SouthEastIcon,
  Layers as LayersIcon,
  Compress as CompressIcon,
  Support as SupportIcon,
  VerticalAlignTop as VerticalAlignTopIcon,
  VerticalAlignBottom as VerticalAlignBottomIcon,
  Redo as RedoIcon,
  Undo as UndoIcon,
  Block as BlockIcon,
  Bolt as BoltIcon,
  AccessTime as AccessTimeIcon,
  DateRange as DateRangeIcon,
  FilterList as FilterListIcon,
  Telegram as TelegramIcon,
  NotificationsActive as BellIcon,
  SignalCellularAlt as SignalIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  RadioButtonChecked as LiveIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
  WifiTethering as WifiTetheringIcon,
  NotificationsNone as NotificationsNoneIcon,
  SensorsOff as SensorsOffIcon,
  Sensors as SensorsIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from "@mui/icons-material";

// ─────────────────────────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────────────────────────
const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#00d4aa", light: "#3de7c2", dark: "#0300a8" },
      secondary: { main: "#ff4d6d", light: "#ff7a94", dark: "#cc3d57" },
      success: { main: "#00e676", light: "#66ff99", dark: "#00b248" },
      error: { main: "#ff1744", light: "#ff5169", dark: "#c4001d" },
      warning: { main: "#ffab00", light: "#ffc633", dark: "#cc8900" },
      info: { main: "#00b0ff", light: "#33bfff", dark: "#008dcc" },
      background: {
        default: mode === "dark" ? "#080b12" : "#f1f5f9",
        paper: mode === "dark" ? "#0d1117" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#e2e8f0" : "#0f172a",
        secondary: mode === "dark" ? "#94a3b8" : "#475569",
      },
      divider: mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    },
    typography: {
      fontFamily: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
      h4: { fontWeight: 700, letterSpacing: "-0.02em" },
      h5: { fontWeight: 700, letterSpacing: "-0.01em" },
      h6: { fontWeight: 600 },
      body1: { fontFamily: '"Inter", sans-serif' },
      body2: { fontFamily: '"Inter", sans-serif', fontSize: "0.8rem" },
      button: {
        textTransform: "none",
        fontWeight: 700,
        letterSpacing: "0.04em",
        fontFamily: '"JetBrains Mono", monospace',
      },
    },
    shape: { borderRadius: 6 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            background: mode === "dark" ? "#0d1117" : "#ffffff",
            border:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.06)"
                : "1px solid rgba(0,0,0,0.06)",
            boxShadow: mode === "dark" ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
            transition: "border-color 0.2s, box-shadow 0.2s",
            "&:hover": {
              borderColor: "rgba(0,212,170,0.18)",
              boxShadow:
                mode === "dark" ? "none" : "0 4px 12px rgba(0,0,0,0.05)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 4, padding: "10px 22px" },
          contained: { boxShadow: "none" },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
              background: mode === "dark" ? "#0a0f18" : "#f8fafc",
              color: mode === "dark" ? "#475569" : "#64748b",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderBottom:
                mode === "dark"
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid rgba(0,0,0,0.06)",
              padding: "10px 14px",
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": { background: "rgba(0,212,170,0.025)" },
            transition: "background 0.15s",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.04)"
                : "1px solid rgba(0,0,0,0.04)",
            padding: "10px 14px",
            color: mode === "dark" ? "#e2e8f0" : "#1e293b",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 600,
            fontSize: "0.72rem",
            letterSpacing: "0.06em",
            minHeight: 44,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.82rem",
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.78rem",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background:
              mode === "dark" ? "rgba(8,11,18,0.97)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(24px)",
            borderBottom:
              mode === "dark"
                ? "1px solid rgba(0,212,170,0.12)"
                : "1px solid rgba(0,0,0,0.06)",
            boxShadow: "none",
            color: mode === "dark" ? "#fff" : "#0f172a",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: mode === "dark" ? "#0d1117" : "#ffffff",
            border: "1px solid rgba(0,212,170,0.18)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: mode === "dark" ? "#0d1117" : "#ffffff",
            border:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.08)",
          },
        },
      },
    },
  });

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE_URL = "http://localhost:8000";

const STOCK_LISTS = {
  nifty_50: { name: "Nifty 50", count: 50, icon: "🇮🇳" },
  bank_nifty: { name: "Bank Nifty", count: 12, icon: "🏦" },
  popular_fo: { name: "Popular F&O", count: 200, icon: "📈" },
};

const CATEGORY_META = {
  intraday: {
    label: "Intraday 5m",
    shortLabel: "5MIN",
    color: "#ffab00",
    bg: "rgba(255,171,0,0.1)",
    icon: <BoltIcon sx={{ fontSize: 12 }} />,
  },
  swing_long: {
    label: "Swing LONG",
    shortLabel: "SWING",
    color: "#00e676",
    bg: "rgba(0,230,118,0.08)",
    icon: <DateRangeIcon sx={{ fontSize: 12 }} />,
  },
  swing_short: {
    label: "Swing SHORT",
    shortLabel: "SWING",
    color: "#ff1744",
    bg: "rgba(255,23,68,0.08)",
    icon: <DateRangeIcon sx={{ fontSize: 12 }} />,
  },
  swing_1_4: {
    label: "Swing 1–4d",
    shortLabel: "QUICK",
    color: "#00b0ff",
    bg: "rgba(0,176,255,0.08)",
    icon: <AccessTimeIcon sx={{ fontSize: 12 }} />,
  },
  test: {
    label: "Test",
    shortLabel: "TEST",
    color: "#475569",
    bg: "rgba(71,85,105,0.08)",
    icon: <SpeedIcon sx={{ fontSize: 12 }} />,
  },
};

const iconMap = {
  flash_on: <FlashOnIcon />,
  flash_off: <FlashOnIcon sx={{ transform: "rotate(180deg)" }} />,
  track_changes: <TrackChangesIcon />,
  show_chart: <ShowChartIcon />,
  trending_up: <TrendingUpIcon />,
  trending_down: <TrendingDownIcon />,
  layers: <LayersIcon />,
  whatshot: <WhatshotIcon />,
  north_east: <NorthEastIcon />,
  south_east: <SouthEastIcon />,
  timeline: <TimelineIcon />,
  compress: <CompressIcon />,
  support: <SupportIcon />,
  speed: <SpeedIcon />,
  vertical_align_top: <VerticalAlignTopIcon />,
  vertical_align_bottom: <VerticalAlignBottomIcon />,
  redo: <RedoIcon />,
  undo: <UndoIcon />,
  block: <BlockIcon />,
  bolt: <BoltIcon />,
  assessment: <AssessmentIcon />,
};
const getIcon = (name) => iconMap[name] || <ShowChartIcon />;

const CONDITION_LABELS = {
  adx_threshold: "ADX",
  adx_rising: "ADX↑",
  di_comparison: "DI±",
  di_spread: "DI Spread",
  price_vs_ema: "P/EMA",
  ema_comparison: "EMA×",
  rsi_range: "RSI Zone",
  rsi_threshold: "RSI",
  price_vs_vwap: "VWAP",
  price_near_ema: "EMA~",
  ema_crossover: "EMA×",
  volume_spike: "Vol↑",
  volume_threshold: "Volume",
  trend_alignment: "EMA Stack",
  has_data: "Data",
  ema_slope: "EMA↗",
  price_threshold: "Price",
  candle_direction: "Candle",
  candle_close_position: "Close",
  di_crossover: "DI×",
};
const fmtCondition = (key) => {
  const base = key.replace(/_\d+$/, "").replace(/_bonus$/, "");
  return CONDITION_LABELS[base] || base.replace(/_/g, " ").toUpperCase();
};

const formatTs = (val) => {
  if (!val) return "—";
  const ts =
    typeof val === "string"
      ? new Date(val)
      : new Date(String(val).length === 10 ? val * 1000 : val);
  return ts.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CategoryBadge({ category, size = "medium" }) {
  const meta = CATEGORY_META[category] || CATEGORY_META.test;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: size === "small" ? 0.7 : 1.1,
        py: size === "small" ? 0.15 : 0.35,
        borderRadius: 1,
        background: meta.bg,
        border: `1px solid ${meta.color}30`,
        color: meta.color,
        fontSize: size === "small" ? "0.62rem" : "0.68rem",
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}
    >
      {meta.icon}
      {size === "small" ? meta.shortLabel : meta.label}
    </Box>
  );
}

function DirectionBadge({ signalType, size = "medium" }) {
  if (!signalType || signalType === "TEST") return null;
  const isLong = signalType === "LONG";
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.4,
        px: size === "small" ? 0.7 : 0.9,
        py: size === "small" ? 0.15 : 0.3,
        borderRadius: 1,
        background: isLong ? "rgba(0,230,118,0.1)" : "rgba(255,23,68,0.1)",
        border: `1px solid ${isLong ? "#00e67640" : "#ff174440"}`,
        color: isLong ? "#00e676" : "#ff1744",
        fontSize: size === "small" ? "0.62rem" : "0.68rem",
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
      }}
    >
      {isLong ? (
        <TrendingUpIcon sx={{ fontSize: 11 }} />
      ) : (
        <TrendingDownIcon sx={{ fontSize: 11 }} />
      )}
      {signalType}
    </Box>
  );
}

function MonoLabel({
  children,
  color = "#475569",
  size = "0.68rem",
  spacing = "0.1em",
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

function StatCard({ label, value, accent, sub, pulse }) {
  return (
    <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
      {pulse && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: `linear-gradient(90deg, transparent, ${accent || "#00d4aa"}, transparent)`,
            animation: "shimmer 2s infinite",
            "@keyframes shimmer": {
              "0%": { transform: "translateX(-100%)" },
              "100%": { transform: "translateX(100%)" },
            },
          }}
        />
      )}
      <CardContent sx={{ p: 2.5 }}>
        <MonoLabel color="#475569">{label}</MonoLabel>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            color: accent || "text.primary",
            lineHeight: 1,
            mt: 0.6,
          }}
        >
          {value}
        </Typography>
        {sub && (
          <MonoLabel color="#334155" size="0.65rem" spacing="0.06em">
            {sub}
          </MonoLabel>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY CARD
// ─────────────────────────────────────────────────────────────────────────────
function StrategyCard({ stratKey, strategy, selected, onClick }) {
  const isShort = strategy.signalType === "SHORT";
  const ac = isShort ? "#ff1744" : "#00d4aa";
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: "pointer",
        border: `1px solid ${selected ? ac + "88" : "rgba(255,255,255,0.06)"}`,
        background: selected
          ? isShort
            ? "rgba(255,23,68,0.06)"
            : "rgba(0,212,170,0.05)"
          : "background.paper",
        transition: "all 0.18s",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          borderColor: ac + "66",
          transform: "translateY(-2px)",
          boxShadow: `0 8px 28px ${ac}18`,
        },
        "&::before": selected
          ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: `linear-gradient(90deg, ${ac}, ${ac}88)`,
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 1.6 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 0.6,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Box sx={{ color: ac, display: "flex", "& svg": { fontSize: 16 } }}>
              {getIcon(strategy.icon)}
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "0.8rem",
                fontFamily: '"JetBrains Mono", monospace',
                color: "text.primary",
                lineHeight: 1.2,
              }}
            >
              {strategy.name}
            </Typography>
          </Box>
          <DirectionBadge signalType={strategy.signalType} size="small" />
        </Box>
        <Typography
          sx={{
            fontSize: "0.7rem",
            color: "text.secondary",
            fontFamily: '"Inter", sans-serif',
            lineHeight: 1.4,
            mb: 0.8,
          }}
        >
          {strategy.description}
        </Typography>
        <CategoryBadge category={strategy.category} size="small" />
        {selected && (
          <CheckCircleIcon
            sx={{
              position: "absolute",
              bottom: 7,
              right: 8,
              fontSize: 13,
              color: ac,
              opacity: 0.7,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WS ALERT TOAST
// ─────────────────────────────────────────────────────────────────────────────
function AlertToast({ alert, onClose }) {
  if (!alert) return null;
  const isLong = alert.signal_type === "LONG";
  return (
    <Slide direction="left" in={!!alert} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          minWidth: 300,
          maxWidth: 360,
          background: isLong ? "rgba(0,12,8,0.97)" : "rgba(12,4,8,0.97)",
          border: `1px solid ${isLong ? "#00e67660" : "#ff174460"}`,
          borderLeft: `3px solid ${isLong ? "#00e676" : "#ff1744"}`,
          borderRadius: 2,
          p: 2,
          boxShadow: `0 16px 48px ${isLong ? "rgba(0,230,118,0.2)" : "rgba(255,23,68,0.2)"}`,
          backdropFilter: "blur(20px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 0.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isLong ? "#00e676" : "#ff1744",
                boxShadow: `0 0 8px ${isLong ? "#00e676" : "#ff1744"}`,
                animation: "blink 1s infinite",
                "@keyframes blink": {
                  "0%,100%": { opacity: 1 },
                  "50%": { opacity: 0.3 },
                },
              }}
            />
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: "0.72rem",
                color: "#94a3b8",
                letterSpacing: "0.1em",
              }}
            >
              NEW SIGNAL
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "#475569", p: 0, ml: 1 }}
          >
            <CancelIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700,
            fontSize: "1.1rem",
            color: isLong ? "#00e676" : "#ff4444",
            mb: 0.3,
          }}
        >
          {isLong ? "▲" : "▼"} {alert.symbol}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.72rem",
            color: "#64748b",
            fontFamily: '"Inter", sans-serif',
            mb: 0.4,
          }}
        >
          {alert.strategy_key?.replace(/-/g, " ")} · ₹{alert.values?.close}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.68rem",
            color: "#334155",
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {formatTs(alert.timestamp)}
        </Typography>
      </Box>
    </Slide>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REALTIME PANEL
// ─────────────────────────────────────────────────────────────────────────────
function RealtimePanel({
  selectedStrategy,
  selectedStockList,
  strategies,
  wsConnected,
  telegramEnabled,
  onNewAlert,
}) {
  const [autoscans, setAutoscans] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(null);
  const [testing, setTesting] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState({
    enabled: false,
    checked: false,
  });
  const [intervalSeconds, setIntervalSeconds] = useState(300);
  const [historyDays, setHistoryDays] = useState(5);
  const [clearingAlerts, setClearingAlerts] = useState(false);
  const [err, setErr] = useState(null);

  const currentScanId = `${selectedStrategy}_${selectedStockList}`;
  const isCurrentRunning = autoscans.some(
    (s) => s.scan_id === currentScanId && s.is_running,
  );

  const fetchStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/autoscan/status`);
      const d = await r.json();
      if (d.success) {
        setAutoscans(d.scans || []);
        setStats(d.stats || {});
        setTelegramStatus({ enabled: d.telegram_enabled, checked: true });
      }
    } catch {}
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/autoscan/recent-alerts?limit=30`,
      );
      const d = await r.json();
      if (d.success) setRecentAlerts(d.alerts || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchAlerts();
    const t1 = setInterval(fetchStatus, 8000);
    const t2 = setInterval(fetchAlerts, 15000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [fetchStatus, fetchAlerts]);

  const startScan = async () => {
    if (!selectedStrategy) return;
    setStarting(true);
    setErr(null);
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/autoscan/start?strategy=${selectedStrategy}&stock_list=${selectedStockList}&interval_seconds=${intervalSeconds}&history_days=${historyDays}`,
        { method: "POST" },
      );
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.detail || "Failed");
      }
      await fetchStatus();
    } catch (e) {
      setErr(e.message);
    } finally {
      setStarting(false);
    }
  };

  const stopScan = async (scanId) => {
    setStopping(scanId);
    setErr(null);
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/autoscan/stop?scan_id=${scanId}`,
        { method: "POST" },
      );
      if (!r.ok) {
        const e = await r.json();
        throw new Error(e.detail || "Failed");
      }
      await fetchStatus();
    } catch (e) {
      setErr(e.message);
    } finally {
      setStopping(null);
    }
  };

  const testTelegram = async () => {
    setTesting(true);
    setErr(null);
    try {
      const r = await fetch(`${API_BASE_URL}/api/autoscan/test-telegram`, {
        method: "POST",
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.detail || "Test failed");
      setTelegramStatus({ enabled: true, checked: true });
    } catch (e) {
      setErr(e.message);
    } finally {
      setTesting(false);
    }
  };

  const clearAlerts = async () => {
    setClearingAlerts(true);
    try {
      await fetch(`${API_BASE_URL}/api/autoscan/clear-alerts`, {
        method: "DELETE",
      });
      await fetchAlerts();
    } catch {
    } finally {
      setClearingAlerts(false);
    }
  };

  return (
    <Box>
      {err && (
        <Alert
          severity="error"
          onClose={() => setErr(null)}
          sx={{
            mb: 2,
            background: "rgba(255,23,68,0.08)",
            border: "1px solid #ff174430",
            "& .MuiAlert-message": {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.78rem",
            },
          }}
        >
          {err}
        </Alert>
      )}

      {/* ── Control Card ── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  background: isCurrentRunning
                    ? "rgba(0,230,118,0.12)"
                    : (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(71,85,105,0.15)"
                          : "rgba(71,85,105,0.08)",
                  border: `1px solid ${isCurrentRunning ? "#00e67644" : "rgba(71,85,105,0.3)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isCurrentRunning ? (
                  <SensorsIcon sx={{ color: "#00e676", fontSize: 18 }} />
                ) : (
                  <SensorsOffIcon sx={{ color: "#475569", fontSize: 18 }} />
                )}
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "text.primary",
                  }}
                >
                  AUTO-SCAN ENGINE
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    mt: 0.2,
                  }}
                >
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: isCurrentRunning ? "#00e676" : "#475569",
                      boxShadow: isCurrentRunning ? "0 0 6px #00e676" : "none",
                      animation: isCurrentRunning
                        ? "pulse 1.5s infinite"
                        : "none",
                      "@keyframes pulse": {
                        "0%,100%": { opacity: 1 },
                        "50%": { opacity: 0.3 },
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.62rem",
                      color: isCurrentRunning ? "#00e676" : "#475569",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {isCurrentRunning ? "SCANNING" : "IDLE"} ·{" "}
                    {selectedStrategy || "no strategy"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Tooltip
                title={
                  wsConnected ? "WebSocket live" : "WebSocket disconnected"
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1,
                    py: 0.4,
                    borderRadius: 1,
                    background: wsConnected
                      ? "rgba(0,176,255,0.1)"
                      : "rgba(71,85,105,0.1)",
                    border: `1px solid ${wsConnected ? "#00b0ff30" : "rgba(71,85,105,0.2)"}`,
                  }}
                >
                  {wsConnected ? (
                    <WifiIcon sx={{ fontSize: 12, color: "#00b0ff" }} />
                  ) : (
                    <WifiOffIcon sx={{ fontSize: 12, color: "#475569" }} />
                  )}
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.62rem",
                      color: wsConnected ? "#00b0ff" : "#475569",
                      fontWeight: 700,
                    }}
                  >
                    {wsConnected ? "WS LIVE" : "WS OFF"}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip
                title={
                  telegramStatus.enabled
                    ? "Telegram alerts active"
                    : "Telegram not configured"
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1,
                    py: 0.4,
                    borderRadius: 1,
                    background: telegramStatus.enabled
                      ? "rgba(0,136,204,0.12)"
                      : "rgba(71,85,105,0.1)",
                    border: `1px solid ${telegramStatus.enabled ? "#0088cc30" : "rgba(71,85,105,0.2)"}`,
                  }}
                >
                  <TelegramIcon
                    sx={{
                      fontSize: 12,
                      color: telegramStatus.enabled ? "#0088cc" : "#475569",
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.62rem",
                      color: telegramStatus.enabled ? "#0088cc" : "#475569",
                      fontWeight: 700,
                    }}
                  >
                    {telegramStatus.enabled ? "TELEGRAM" : "NO TG"}
                  </Typography>
                </Box>
              </Tooltip>

              <IconButton
                size="small"
                onClick={fetchStatus}
                sx={{
                  color: "#475569",
                  "&:hover": { color: "#00d4aa" },
                  p: 0.6,
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 1,
                }}
              >
                <RefreshIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Config */}
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Scan Interval</InputLabel>
                <Select
                  value={intervalSeconds}
                  label="Scan Interval"
                  onChange={(e) => setIntervalSeconds(e.target.value)}
                  disabled={isCurrentRunning}
                >
                  {[
                    { v: 60, l: "1 min" },
                    { v: 180, l: "3 min" },
                    { v: 300, l: "5 min" },
                    { v: 600, l: "10 min" },
                    { v: 900, l: "15 min" },
                  ].map(({ v, l }) => (
                    <MenuItem key={v} value={v} sx={{ fontSize: "0.78rem" }}>
                      {l}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>History Days</InputLabel>
                <Select
                  value={historyDays}
                  label="History Days"
                  onChange={(e) => setHistoryDays(e.target.value)}
                  disabled={isCurrentRunning}
                >
                  {[1, 3, 5, 7].map((d) => (
                    <MenuItem key={d} value={d} sx={{ fontSize: "0.78rem" }}>
                      {d} day{d > 1 ? "s" : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  height: "100%",
                  alignItems: "center",
                }}
              >
                {!isCurrentRunning ? (
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={startScan}
                    disabled={starting || !selectedStrategy}
                    startIcon={
                      starting ? (
                        <CircularProgress size={13} sx={{ color: "inherit" }} />
                      ) : (
                        <PlayArrowIcon />
                      )
                    }
                    sx={{
                      background: "linear-gradient(135deg, #00d4aa, #00b288)",
                      color: "#001a14",
                      fontWeight: 700,
                      py: 0.9,
                      "&:disabled": { opacity: 0.4 },
                    }}
                  >
                    {starting ? "STARTING..." : "START AUTO-SCAN"}
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={() => stopScan(currentScanId)}
                    disabled={stopping === currentScanId}
                    startIcon={
                      stopping === currentScanId ? (
                        <CircularProgress size={13} sx={{ color: "inherit" }} />
                      ) : (
                        <StopIcon />
                      )
                    }
                    sx={{ fontWeight: 700, py: 0.9 }}
                  >
                    {stopping === currentScanId
                      ? "STOPPING..."
                      : "STOP CURRENT SCAN"}
                  </Button>
                )}
                {!telegramStatus.enabled && telegramStatus.checked && (
                  <Button
                    variant="outlined"
                    onClick={testTelegram}
                    disabled={testing}
                    startIcon={<TelegramIcon />}
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.7rem",
                      borderColor: "#0088cc44",
                      color: "#0088cc",
                      whiteSpace: "nowrap",
                      "&:hover": {
                        borderColor: "#0088cc",
                        background: "rgba(0,136,204,0.08)",
                      },
                    }}
                  >
                    {testing ? "TESTING..." : "TEST TG"}
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Stats row */}
          <Grid container spacing={1.5}>
            {[
              {
                label: "Total Scans",
                value: stats.total_scans ?? 0,
                color: "#00d4aa",
              },
              {
                label: "Matches Found",
                value: stats.total_matches ?? 0,
                color: "#00e676",
              },
              {
                label: "Alerts Sent",
                value: stats.total_alerts_sent ?? 0,
                color: "#ffab00",
              },
              {
                label: "Running Tasks",
                value: autoscans.filter((s) => s.is_running).length,
                color: "#00b0ff",
              },
            ].map(({ label, value, color }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    background: (theme) =>
                      theme.palette.mode === "dark" ? "#080b12" : "#f8fafc",
                    border: "1px solid rgba(255,255,255,0.05)",
                    textAlign: "center",
                  }}
                >
                  <MonoLabel color="#334155" size="0.6rem">
                    {label}
                  </MonoLabel>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      color,
                      lineHeight: 1.2,
                      mt: 0.3,
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ── Active Scans ── */}
      {autoscans.length > 0 && (
        <Card sx={{ mb: 2.5 }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                px: 2.5,
                pt: 2,
                pb: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <MonoLabel color="#475569">
                Active Scans ({autoscans.length})
              </MonoLabel>
              <Chip
                label={`${autoscans.filter((s) => s.is_running).length} running`}
                size="small"
                sx={{
                  background: "rgba(0,230,118,0.1)",
                  color: "#00e676",
                  border: "1px solid #00e67630",
                  fontSize: "0.62rem",
                }}
              />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Scan ID</TableCell>
                    <TableCell>Strategy</TableCell>
                    <TableCell>Universe</TableCell>
                    <TableCell align="center">Interval</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {autoscans.map((scan) => (
                    <TableRow key={scan.scan_id}>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.72rem",
                            color: "#94a3b8",
                          }}
                        >
                          {scan.scan_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            color: "text.primary",
                          }}
                        >
                          {scan.strategy_name || scan.strategy_key}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.72rem",
                            color: "#64748b",
                          }}
                        >
                          {STOCK_LISTS[scan.stock_list]?.name ||
                            scan.stock_list}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.7rem",
                            color: "#64748b",
                          }}
                        >
                          {scan.interval_seconds}s
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.4,
                            px: 0.8,
                            py: 0.2,
                            borderRadius: 0.5,
                            background: scan.is_running
                              ? "rgba(0,230,118,0.1)"
                              : "rgba(71,85,105,0.12)",
                            border: `1px solid ${scan.is_running ? "#00e67630" : "rgba(71,85,105,0.2)"}`,
                            color: scan.is_running ? "#00e676" : "#475569",
                            fontSize: "0.62rem",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 700,
                          }}
                        >
                          {scan.is_running && (
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                background: "#00e676",
                                animation: "blink 1.2s infinite",
                                "@keyframes blink": {
                                  "0%,100%": { opacity: 1 },
                                  "50%": { opacity: 0.2 },
                                },
                              }}
                            />
                          )}
                          {scan.is_running ? "RUNNING" : "STOPPED"}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {scan.is_running && (
                          <IconButton
                            size="small"
                            onClick={() => stopScan(scan.scan_id)}
                            disabled={stopping === scan.scan_id}
                            sx={{
                              color: "#ff4444",
                              border: "1px solid #ff174425",
                              borderRadius: 1,
                              p: 0.5,
                              "&:hover": { background: "rgba(255,23,68,0.1)" },
                            }}
                          >
                            {stopping === scan.scan_id ? (
                              <CircularProgress
                                size={12}
                                sx={{ color: "#ff4444" }}
                              />
                            ) : (
                              <StopIcon sx={{ fontSize: 14 }} />
                            )}
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ── Recent Alerts ── */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              px: 2.5,
              pt: 2,
              pb: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <BellIcon sx={{ fontSize: 16, color: "#ffab00" }} />
              <MonoLabel color="#475569">Recent Alerts</MonoLabel>
              {recentAlerts.length > 0 && (
                <Box
                  sx={{
                    px: 0.8,
                    py: 0.15,
                    borderRadius: 1,
                    background: "rgba(255,171,0,0.12)",
                    border: "1px solid #ffab0030",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.62rem",
                      color: "#ffab00",
                      fontWeight: 700,
                    }}
                  >
                    {recentAlerts.length}
                  </Typography>
                </Box>
              )}
            </Box>
            <IconButton
              size="small"
              onClick={clearAlerts}
              disabled={clearingAlerts}
              sx={{
                color: "#475569",
                p: 0.5,
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 1,
                "&:hover": { color: "#ff4444", borderColor: "#ff174430" },
              }}
            >
              <Tooltip title="Clear all alert cooldowns">
                {clearingAlerts ? (
                  <CircularProgress size={12} sx={{ color: "#ff4444" }} />
                ) : (
                  <DeleteIcon sx={{ fontSize: 14 }} />
                )}
              </Tooltip>
            </IconButton>
          </Box>

          {recentAlerts.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <NotificationsNoneIcon
                sx={{ fontSize: 32, color: "#1e293b", mb: 1 }}
              />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.72rem",
                  color: "#334155",
                }}
              >
                NO ALERTS YET · WAITING FOR SIGNALS
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Strategy</TableCell>
                    <TableCell align="center">Signal</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAlerts.map((alert, i) => (
                    <TableRow
                      key={i}
                      sx={{
                        "&:hover td": { background: "rgba(0,212,170,0.015)" },
                      }}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.68rem",
                            color: "#334155",
                          }}
                        >
                          {formatTs(alert.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 700,
                            fontSize: "0.82rem",
                            color:
                              alert.signal_type === "LONG"
                                ? "#00e676"
                                : "#ff4444",
                          }}
                        >
                          {alert.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.68rem",
                            color: "#64748b",
                          }}
                        >
                          {alert.strategy_name || alert.strategy_key}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <DirectionBadge
                          signalType={alert.signal_type}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.78rem",
                            color: "text.primary",
                            fontWeight: 700,
                          }}
                        >
                          ₹{alert.values?.close}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            color: "#475569",
                            fontFamily: '"Inter", sans-serif',
                          }}
                        >
                          {alert.message}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCAN RESULTS PANEL
// ─────────────────────────────────────────────────────────────────────────────
function ScanResultsPanel({
  scanResults,
  selectedStrategy,
  strategies,
  lastScanned,
  intradayDays,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (s) => setExpandedRows((p) => ({ ...p, [s]: !p[s] }));

  useEffect(() => {
    if (scanResults?.summary?.total_matched > 0) setActiveTab(0);
    else setActiveTab(1);
  }, [scanResults]);

  if (!scanResults) return null;

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: "Scanned", value: scanResults.summary.total_scanned },
          {
            label: "Matches",
            value: scanResults.summary.total_matched,
            accent: "#00d4aa",
            pulse: true,
          },
          {
            label: "Hit Rate",
            value: `${scanResults.summary.match_percentage}%`,
            accent:
              scanResults.summary.match_percentage > 20 ? "#00e676" : "#ffab00",
          },
          {
            label: "Updated",
            value: lastScanned || "—",
            sub: `${intradayDays}d lookback`,
          },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Card>
        <Box sx={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              px: 2,
              "& .MuiTabs-indicator": {
                background: "linear-gradient(90deg, #00d4aa, #00e676)",
                height: 2,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  MATCHES
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.1,
                      borderRadius: "10px",
                      background: "#00d4aa22",
                      color: "#00d4aa",
                      fontSize: "0.6rem",
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 700,
                    }}
                  >
                    {scanResults.summary.total_matched}
                  </Box>
                </Box>
              }
            />
            <Tab label="ALL RESULTS" />
          </Tabs>
        </Box>

        {activeTab === 0 &&
          (scanResults.matches.length === 0 ? (
            <Box sx={{ py: 7, textAlign: "center" }}>
              <CancelIcon sx={{ fontSize: 38, color: "#1e293b", mb: 1.5 }} />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.78rem",
                  color: "#334155",
                }}
              >
                NO MATCHES · CONDITIONS NOT MET
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell align="right">LTP</TableCell>
                    <TableCell>Conditions</TableCell>
                    <TableCell align="center">Signal</TableCell>
                    <TableCell align="center">Time</TableCell>
                    <TableCell width={40} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scanResults.matches.map((stock) => {
                    const isShort =
                      (stock.signal_type ||
                        strategies[selectedStrategy]?.signalType) === "SHORT";
                    return (
                      <React.Fragment key={stock.symbol}>
                        <TableRow>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  width: 3,
                                  height: 28,
                                  borderRadius: 2,
                                  background: isShort ? "#ff1744" : "#00d4aa",
                                  flexShrink: 0,
                                }}
                              />
                              <Typography
                                sx={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontWeight: 700,
                                  fontSize: "0.85rem",
                                  color: "text.primary",
                                }}
                              >
                                {stock.symbol}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                color: "text.primary",
                              }}
                            >
                              ₹{stock.values?.close || "—"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.4,
                              }}
                            >
                              {Object.entries(stock.conditions || {}).map(
                                ([key, met]) => (
                                  <Tooltip
                                    key={key}
                                    title={key.replace(/_/g, " ")}
                                  >
                                    <Box
                                      sx={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 0.3,
                                        px: 0.6,
                                        py: 0.15,
                                        borderRadius: 0.5,
                                        background: met
                                          ? "rgba(0,230,118,0.08)"
                                          : "rgba(255,23,68,0.06)",
                                        border: `1px solid ${met ? "#00e67625" : "#ff174420"}`,
                                        color: met ? "#00e676" : "#ff4444",
                                        fontSize: "0.6rem",
                                        fontFamily:
                                          '"JetBrains Mono", monospace',
                                        fontWeight: 700,
                                        cursor: "default",
                                      }}
                                    >
                                      {met ? "✓" : "✗"} {fmtCondition(key)}
                                    </Box>
                                  </Tooltip>
                                ),
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <DirectionBadge
                              signalType={
                                stock.signal_type ||
                                strategies[selectedStrategy]?.signalType
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography
                              sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: "0.68rem",
                                color: "#334155",
                              }}
                            >
                              {lastScanned}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleRow(stock.symbol)}
                              sx={{
                                color: "#334155",
                                "&:hover": { color: "#00d4aa" },
                              }}
                            >
                              {expandedRows[stock.symbol] ? (
                                <ExpandLessIcon sx={{ fontSize: 16 }} />
                              ) : (
                                <ExpandMoreIcon sx={{ fontSize: 16 }} />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                            <Collapse in={expandedRows[stock.symbol]}>
                              <Box
                                sx={{
                                  px: 3,
                                  py: 2.5,
                                  background: (theme) =>
                                    theme.palette.mode === "dark"
                                      ? "#080b12"
                                      : "#f8fafc",
                                  borderBottom:
                                    "1px solid rgba(255,255,255,0.04)",
                                }}
                              >
                                <Grid container spacing={3}>
                                  <Grid item xs={12} md={6}>
                                    <MonoLabel color="#334155" size="0.65rem">
                                      Indicator Values
                                    </MonoLabel>
                                    <Grid
                                      container
                                      spacing={0.5}
                                      sx={{ mt: 1 }}
                                    >
                                      {Object.entries(stock.values || {}).map(
                                        ([k, v]) => (
                                          <Grid item xs={6} key={k}>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                py: 0.5,
                                                borderBottom:
                                                  "1px solid rgba(255,255,255,0.04)",
                                              }}
                                            >
                                              <Typography
                                                sx={{
                                                  fontSize: "0.68rem",
                                                  color: "#334155",
                                                  fontFamily:
                                                    '"JetBrains Mono", monospace',
                                                  textTransform: "uppercase",
                                                }}
                                              >
                                                {k}
                                              </Typography>
                                              <Typography
                                                sx={{
                                                  fontSize: "0.68rem",
                                                  color: "#00d4aa",
                                                  fontFamily:
                                                    '"JetBrains Mono", monospace',
                                                  fontWeight: 700,
                                                }}
                                              >
                                                {v}
                                              </Typography>
                                            </Box>
                                          </Grid>
                                        ),
                                      )}
                                    </Grid>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <MonoLabel color="#334155" size="0.65rem">
                                      Signal Message
                                    </MonoLabel>
                                    <Typography
                                      sx={{
                                        fontSize: "0.8rem",
                                        color: "#94a3b8",
                                        fontFamily: '"Inter", sans-serif',
                                        mt: 1,
                                        lineHeight: 1.6,
                                      }}
                                    >
                                      {stock.message}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ))}

        {activeTab === 1 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="right">LTP</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Conditions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scanResults.all_results.map((stock) => (
                  <TableRow key={stock.symbol}>
                    <TableCell>
                      <Typography
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          color: stock.matched ? "#00d4aa" : "#334155",
                        }}
                      >
                        {stock.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.78rem",
                          color: "#94a3b8",
                        }}
                      >
                        ₹{stock.values?.close || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.4,
                          px: 0.8,
                          py: 0.2,
                          borderRadius: 0.5,
                          background: stock.matched
                            ? "rgba(0,212,170,0.08)"
                            : "rgba(71,85,105,0.1)",
                          border: `1px solid ${stock.matched ? "#00d4aa30" : "rgba(71,85,105,0.2)"}`,
                          color: stock.matched ? "#00d4aa" : "#475569",
                          fontSize: "0.6rem",
                          fontFamily: '"JetBrains Mono", monospace',
                          fontWeight: 700,
                        }}
                      >
                        {stock.matched ? "✓ MATCH" : "✗ SKIP"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: 0.35 }}
                      >
                        {Object.entries(stock.conditions || {}).map(
                          ([key, met]) => (
                            <Box
                              key={key}
                              sx={{
                                px: 0.5,
                                py: 0.1,
                                borderRadius: 0.5,
                                background: met
                                  ? "rgba(0,230,118,0.06)"
                                  : "rgba(255,23,68,0.04)",
                                color: met ? "#00e676" : "#ff4444",
                                fontSize: "0.58rem",
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 600,
                              }}
                            >
                              {fmtCondition(key)}
                            </Box>
                          ),
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKTEST PANEL
// ─────────────────────────────────────────────────────────────────────────────
function BacktestPanel({ backtestResults }) {
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (s) => setExpandedRows((p) => ({ ...p, [s]: !p[s] }));

  if (!backtestResults) return null;
  const agg = backtestResults.aggregate;

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          { label: "Total Signals", value: agg.total_signals },
          { label: "Total Trades", value: agg.total_trades },
          {
            label: "Win Rate",
            value: `${agg.overall_win_rate}%`,
            accent: agg.overall_win_rate >= 50 ? "#00e676" : "#ff1744",
          },
          {
            label: "Target Rate",
            value: `${agg.target_hit_rate}%`,
            accent: "#00d4aa",
          },
          {
            label: "Avg P&L/Trade",
            value: `${agg.avg_pnl_per_trade}%`,
            accent: agg.avg_pnl_per_trade >= 0 ? "#00e676" : "#ff1744",
          },
        ].map((s, i) => (
          <Grid item xs={6} sm={4} md key={i}>
            <StatCard {...s} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {[
          {
            label: "🎯 Target Hits",
            value: agg.total_target_hits,
            color: "#00e676",
            bg: "rgba(0,230,118,0.04)",
          },
          {
            label: "🛑 Stop Losses",
            value: agg.total_stop_loss_hits,
            color: "#ff1744",
            bg: "rgba(255,23,68,0.04)",
          },
          {
            label: "⏱ Time Exits",
            value: agg.total_time_exits,
            color: "#ffab00",
            bg: "rgba(255,171,0,0.04)",
          },
        ].map(({ label, value, color, bg }) => (
          <Grid item xs={12} md={4} key={label}>
            <Card sx={{ background: bg, border: `1px solid ${color}18` }}>
              <CardContent sx={{ p: 2 }}>
                <MonoLabel color="#334155" size="0.68rem">
                  {label}
                </MonoLabel>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "2rem",
                    fontWeight: 700,
                    color,
                    lineHeight: 1,
                    mt: 0.5,
                  }}
                >
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 2.5, pt: 2, pb: 1.5 }}>
            <MonoLabel color="#475569">
              Stock-wise Results · 1:1 Risk-Reward
            </MonoLabel>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell align="center">Signals</TableCell>
                  <TableCell align="center">Trades</TableCell>
                  <TableCell align="center">Win Rate</TableCell>
                  <TableCell align="center">Targets</TableCell>
                  <TableCell align="center">Stop Loss</TableCell>
                  <TableCell align="right">Total P&L</TableCell>
                  <TableCell align="right">Avg P&L</TableCell>
                  <TableCell width={40} />
                </TableRow>
              </TableHead>
              <TableBody>
                {backtestResults.results
                  .filter((r) => r.total_signals > 0)
                  .sort((a, b) => b.total_pnl_pct - a.total_pnl_pct)
                  .map((result) => (
                    <React.Fragment key={result.symbol}>
                      <TableRow>
                        <TableCell>
                          <Typography
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontWeight: 700,
                              fontSize: "0.85rem",
                              color: "text.primary",
                            }}
                          >
                            {result.symbol}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.78rem",
                              color: "#64748b",
                            }}
                          >
                            {result.total_signals}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.78rem",
                              color: "#64748b",
                            }}
                          >
                            {result.trades.length}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: "inline-flex",
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 0.5,
                              background:
                                result.win_rate >= 50
                                  ? "rgba(0,230,118,0.08)"
                                  : "rgba(255,23,68,0.08)",
                              border: `1px solid ${result.win_rate >= 50 ? "#00e67630" : "#ff174430"}`,
                              color:
                                result.win_rate >= 50 ? "#00e676" : "#ff4444",
                              fontSize: "0.7rem",
                              fontFamily: '"JetBrains Mono", monospace',
                              fontWeight: 700,
                            }}
                          >
                            {result.win_rate}%
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.78rem",
                              color: "#00e676",
                              fontWeight: 700,
                            }}
                          >
                            {result.target_hits}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.78rem",
                              color: "#ff4444",
                              fontWeight: 700,
                            }}
                          >
                            {result.stop_loss_hits}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color:
                                result.total_pnl_pct >= 0
                                  ? "#00e676"
                                  : "#ff4444",
                            }}
                          >
                            {result.total_pnl_pct >= 0 ? "+" : ""}
                            {result.total_pnl_pct}%
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: "0.78rem",
                              color:
                                result.avg_pnl_pct >= 0 ? "#00d4aa" : "#ff7a94",
                            }}
                          >
                            {result.avg_pnl_pct >= 0 ? "+" : ""}
                            {result.avg_pnl_pct}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(result.symbol)}
                            sx={{
                              color: "#334155",
                              "&:hover": { color: "#00d4aa" },
                            }}
                          >
                            {expandedRows[result.symbol] ? (
                              <ExpandLessIcon sx={{ fontSize: 16 }} />
                            ) : (
                              <ExpandMoreIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={9} sx={{ p: 0, border: 0 }}>
                          <Collapse in={expandedRows[result.symbol]}>
                            <Box
                              sx={{
                                px: 3,
                                py: 2,
                                background: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "#080b12"
                                    : "#f8fafc",
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.04)",
                              }}
                            >
                              <MonoLabel
                                color="#334155"
                                size="0.65rem"
                                spacing="0.08em"
                              >
                                Trade History · 1:1 RR
                              </MonoLabel>
                              <TableContainer sx={{ mt: 1.5 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Dir</TableCell>
                                      <TableCell>Entry Time</TableCell>
                                      <TableCell align="right">Entry</TableCell>
                                      <TableCell align="right">Stop</TableCell>
                                      <TableCell align="right">
                                        Target
                                      </TableCell>
                                      <TableCell>Exit Time</TableCell>
                                      <TableCell align="right">Exit</TableCell>
                                      <TableCell align="center">
                                        Reason
                                      </TableCell>
                                      <TableCell align="right">P&L</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {result.trades.map((trade, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>
                                          <DirectionBadge
                                            signalType={trade.signal_type}
                                            size="small"
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Typography
                                            sx={{
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontSize: "0.68rem",
                                              color: "#334155",
                                            }}
                                          >
                                            {formatTs(trade.entry_time)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography
                                            sx={{
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontSize: "0.72rem",
                                              color: "text.primary",
                                            }}
                                          >
                                            ₹{trade.entry_price?.toFixed(2)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography
                                            sx={{
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontSize: "0.72rem",
                                              color: "#ff4444",
                                            }}
                                          >
                                            ₹{trade.stop_loss?.toFixed(2)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography
                                            sx={{
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontSize: "0.72rem",
                                              color: "#00e676",
                                            }}
                                          >
                                            ₹{trade.target?.toFixed(2)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography
                                            sx={{
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontSize: "0.68rem",
                                              color: "#334155",
                                            }}
                                          >
                                            {formatTs(trade.exit_time)}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                          <Typography
                                            sx={{
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontSize: "0.72rem",
                                              color: "#94a3b8",
                                            }}
                                          >
                                            {trade.exit_price
                                              ? `₹${trade.exit_price.toFixed(2)}`
                                              : "—"}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          {{
                                            TARGET: (
                                              <Box
                                                sx={{
                                                  display: "inline-flex",
                                                  px: 0.7,
                                                  py: 0.15,
                                                  borderRadius: 0.5,
                                                  background:
                                                    "rgba(0,230,118,0.08)",
                                                  color: "#00e676",
                                                  fontSize: "0.6rem",
                                                  fontFamily:
                                                    '"JetBrains Mono", monospace',
                                                  fontWeight: 700,
                                                }}
                                              >
                                                🎯 TARGET
                                              </Box>
                                            ),
                                            STOP_LOSS: (
                                              <Box
                                                sx={{
                                                  display: "inline-flex",
                                                  px: 0.7,
                                                  py: 0.15,
                                                  borderRadius: 0.5,
                                                  background:
                                                    "rgba(255,23,68,0.08)",
                                                  color: "#ff4444",
                                                  fontSize: "0.6rem",
                                                  fontFamily:
                                                    '"JetBrains Mono", monospace',
                                                  fontWeight: 700,
                                                }}
                                              >
                                                🛑 STOP
                                              </Box>
                                            ),
                                            TIME: (
                                              <Box
                                                sx={{
                                                  display: "inline-flex",
                                                  px: 0.7,
                                                  py: 0.15,
                                                  borderRadius: 0.5,
                                                  background:
                                                    "rgba(255,171,0,0.08)",
                                                  color: "#ffab00",
                                                  fontSize: "0.6rem",
                                                  fontFamily:
                                                    '"JetBrains Mono", monospace',
                                                  fontWeight: 700,
                                                }}
                                              >
                                                ⏱ TIME
                                              </Box>
                                            ),
                                          }[trade.exit_reason] || (
                                            <Typography
                                              sx={{
                                                fontSize: "0.68rem",
                                                color: "#475569",
                                              }}
                                            >
                                              {trade.exit_reason}
                                            </Typography>
                                          )}
                                        </TableCell>
                                        <TableCell align="right">
                                          <Box
                                            sx={{
                                              display: "inline-flex",
                                              px: 0.7,
                                              py: 0.2,
                                              borderRadius: 0.5,
                                              background:
                                                trade.pnl_pct >= 0
                                                  ? "rgba(0,230,118,0.08)"
                                                  : "rgba(255,23,68,0.08)",
                                              color:
                                                trade.pnl_pct >= 0
                                                  ? "#00e676"
                                                  : "#ff4444",
                                              fontSize: "0.68rem",
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontWeight: 700,
                                            }}
                                          >
                                            {trade.pnl_pct >= 0 ? "+" : ""}
                                            {trade.pnl_pct}%
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRATEGY INFO DIALOG
// ─────────────────────────────────────────────────────────────────────────────
function StrategyInfoDialog({
  open,
  onClose,
  stratKey,
  strategy,
  intradayDays,
  mainTab,
}) {
  if (!strategy) return null;
  const isShort = strategy.signalType === "SHORT";
  const ac = isShort ? "#ff1744" : "#00d4aa";
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ color: ac, "& svg": { fontSize: 22 } }}>
            {getIcon(strategy.icon)}
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "text.primary",
              }}
            >
              {strategy.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.8, mt: 0.4 }}>
              <DirectionBadge signalType={strategy.signalType} size="small" />
              <CategoryBadge category={strategy.category} size="small" />
            </Box>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography
          sx={{
            fontSize: "0.82rem",
            color: "#94a3b8",
            fontFamily: '"Inter", sans-serif',
            mb: 2.5,
            lineHeight: 1.6,
          }}
        >
          {strategy.description}
        </Typography>
        <MonoLabel color="#334155" size="0.65rem" spacing="0.1em">
          Entry Conditions
        </MonoLabel>
        <Stack spacing={0.7} sx={{ mt: 1.5, mb: 2.5 }}>
          {(strategy.conditions || []).map((c, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderRadius: 1,
                background: "rgba(0,212,170,0.03)",
                border: "1px solid rgba(0,212,170,0.1)",
              }}
            >
              <CheckCircleIcon
                sx={{ fontSize: 12, color: ac, flexShrink: 0 }}
              />
              <Typography
                sx={{
                  fontSize: "0.76rem",
                  fontFamily: '"JetBrains Mono", monospace',
                  color: "#94a3b8",
                }}
              >
                {c}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1,
            background: (theme) =>
              theme.palette.mode === "dark" ? "#080b12" : "#f8fafc",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <MonoLabel color="#334155" size="0.65em" spacing="0.08em">
            Scanner Details
          </MonoLabel>
          {[
            ["Data", "5-minute intraday candles"],
            [
              "Period",
              `${intradayDays} day${intradayDays > 1 ? "s" : ""} (~${intradayDays * 75} candles)`,
            ],
            [
              "Mode",
              mainTab === 0
                ? "Live Scanner"
                : mainTab === 1
                  ? "1:1 R:R Backtest"
                  : "Auto-Scan + Alerts",
            ],
            ["Max Hold", "50 candles (~4 hours)"],
          ].map(([k, v]) => (
            <Box
              key={k}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.5,
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.7rem",
                  color: "#334155",
                }}
              >
                {k}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.7rem",
                  color: ac,
                }}
              >
                {v}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          size="small"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.72rem",
            color: "#475569",
            "&:hover": { color: "#e2e8f0" },
          }}
        >
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // State
  const [scanning, setScanning] = useState(false);
  const [backtesting, setBacktesting] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [selectedStockList, setSelectedStockList] = useState("nifty_50");
  const [backtestDays, setBacktestDays] = useState(7);
  const [intradayDays, setIntradayDays] = useState(7);
  const [lastScanned, setLastScanned] = useState(null);
  const [mainTab, setMainTab] = useState(0);
  const [strategyInfoOpen, setStrategyInfoOpen] = useState(false);
  const [strategies, setStrategies] = useState({});
  const [loadingStrategies, setLoadingStrategies] = useState(true);
  const [strategiesError, setStrategiesError] = useState(null);
  const [signalFilter, setSignalFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mode, setMode] = useState("dark");

  const theme = useMemo(() => getTheme(mode), [mode]);
  const toggleColorMode = () =>
    setMode((prev) => (prev === "dark" ? "light" : "dark"));

  // WebSocket & Alert state
  const [wsConnected, setWsConnected] = useState(false);
  const [liveAlert, setLiveAlert] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const wsRef = useRef(null);
  const alertTimerRef = useRef(null);

  // ── WebSocket ──
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      const ws = new WebSocket(
        `${API_BASE_URL.replace("http", "ws")}/ws/alerts`,
      );
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWebSocket, 5000);
      };
      ws.onerror = () => setWsConnected(false);
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === "alert") {
          setLiveAlert(data);
          setAlertCount((c) => c + 1);
          if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
          alertTimerRef.current = setTimeout(() => setLiveAlert(null), 7000);
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(
              `${data.signal_type === "LONG" ? "▲" : "▼"} ${data.symbol}`,
              {
                body: `${data.strategy_key?.replace(/-/g, " ")} · ₹${data.values?.close}`,
              },
            );
          }
        }
      };
      const ping = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 30000);
      ws.addEventListener("close", () => clearInterval(ping));
      wsRef.current = ws;
    } catch {}
  }, []);

  useEffect(() => {
    connectWebSocket();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    return () => {
      wsRef.current?.close();
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [connectWebSocket]);

  // ── Strategies ──
  useEffect(() => {
    fetchStrategies();
    checkServerHealth();
    const t = setInterval(checkServerHealth, 30000);
    return () => clearInterval(t);
  }, []);

  const fetchStrategies = async () => {
    setLoadingStrategies(true);
    setStrategiesError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/strategies/list`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.success && result.data.strategies) {
        const t = {};
        for (const [key, s] of Object.entries(result.data.strategies)) {
          if (s.enabled)
            t[key] = {
              name: s.name,
              description: s.description,
              icon: s.icon,
              conditions: s.conditions || [],
              color: s.color || "primary",
              signalType: s.signal_type || "LONG",
              category: s.category || "intraday",
            };
        }
        setStrategies(t);
        if (!selectedStrategy || !t[selectedStrategy])
          setSelectedStrategy(Object.keys(t)[0] || null);
      } else throw new Error("Invalid response");
    } catch (err) {
      setStrategiesError(err.message);
      setStrategies({
        "intraday-momentum-breakout": {
          name: "Momentum Breakout",
          description: "Fast intraday scalp on momentum surge",
          icon: "flash_on",
          conditions: [
            "ADX > 28",
            "DI+ > DI-",
            "Price > EMA9 > EMA20",
            "Price > VWAP",
            "RSI 57-72",
            "Volume > 150k",
          ],
          signalType: "LONG",
          category: "intraday",
        },
      });
      setSelectedStrategy("intraday-momentum-breakout");
    } finally {
      setLoadingStrategies(false);
    }
  };

  const checkServerHealth = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/health`);
      setServerStatus(await r.json());
    } catch {
      setServerStatus({ status: "offline" });
    }
  };

  const runScan = async () => {
    if (!selectedStrategy) return;
    setScanning(true);
    setError(null);
    setScanResults(null);
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/scanner/scan?strategy=${selectedStrategy}&stock_list=${selectedStockList}&intraday_days=${intradayDays}`,
        { method: "POST" },
      );
      if (!r.ok) throw new Error(`Server Error: ${r.status}`);
      const result = await r.json();
      setScanResults(result.data);
      setLastScanned(new Date().toLocaleTimeString());
    } catch (e) {
      setError(e.message);
    } finally {
      setScanning(false);
    }
  };

  const runBacktest = async () => {
    if (!selectedStrategy) return;
    setBacktesting(true);
    setError(null);
    setBacktestResults(null);
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/backtest/run?strategy=${selectedStrategy}&stock_list=${selectedStockList}&days=${backtestDays}`,
        { method: "POST" },
      );
      if (!r.ok) throw new Error(`Server Error: ${r.status}`);
      const result = await r.json();
      setBacktestResults(result.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBacktesting(false);
    }
  };

  const isServerHealthy = serverStatus?.status === "healthy";
  const filteredStrategies = Object.entries(strategies).filter(([, s]) => {
    if (s.signalType === "TEST") return false;
    return (
      (signalFilter === "all" || s.signalType === signalFilter) &&
      (categoryFilter === "all" || s.category === categoryFilter)
    );
  });
  const presentCategories = [
    ...new Set(Object.values(strategies).map((s) => s.category)),
  ].filter((c) => c !== "test");

  // ── Loading ──
  if (loadingStrategies) {
    return (
      <ThemeProvider theme={getTheme("dark")}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "#080b12", // Keep dark for loading
            gap: 3,
          }}
        >
          <Box sx={{ position: "relative" }}>
            <CircularProgress
              size={52}
              sx={{ color: "#00d4aa" }}
              thickness={1.5}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShowChartIcon sx={{ color: "#00d4aa", fontSize: 20 }} />
            </Box>
          </Box>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              color: "#334155",
              fontSize: "0.78rem",
              letterSpacing: "0.15em",
            }}
          >
            INITIALISING SCANNER...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // ── Main ──
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Scanline overlay */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 9998,
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)",
        }}
      />

      {/* Alert Toast */}
      <AlertToast alert={liveAlert} onClose={() => setLiveAlert(null)} />

      <Box sx={{ minHeight: "100vh", background: "background.default" }}>
        {/* ── AppBar ── */}
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ gap: 2, minHeight: "56px !important" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexGrow: 1,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #00d4aa18, #00d4aa38)",
                  border: "1px solid #00d4aa38",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShowChartIcon sx={{ color: "#00d4aa", fontSize: 16 }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "text.primary",
                    letterSpacing: "0.06em",
                    lineHeight: 1,
                  }}
                >
                  STOCKS SCANNER
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.58rem",
                    color: "#00d4aa",
                    letterSpacing: "0.14em",
                  }}
                >
                  INTRADAY · REALTIME · ALERTS
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {alertCount > 0 && (
                <Badge
                  badgeContent={alertCount}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.6rem",
                      minWidth: 16,
                      height: 16,
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.3,
                      borderRadius: 1,
                      background: "rgba(255,171,0,0.1)",
                      border: "1px solid #ffab0030",
                    }}
                  >
                    <BellIcon sx={{ fontSize: 14, color: "#ffab00" }} />
                  </Box>
                </Badge>
              )}

              {/* WS indicator */}
              <Tooltip
                title={
                  wsConnected
                    ? "WebSocket connected · real-time alerts active"
                    : "WebSocket disconnected"
                }
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1,
                    py: 0.35,
                    borderRadius: 1,
                    background: wsConnected
                      ? "rgba(0,176,255,0.08)"
                      : "rgba(71,85,105,0.08)",
                    border: `1px solid ${wsConnected ? "#00b0ff25" : "rgba(71,85,105,0.15)"}`,
                    cursor: "default",
                  }}
                >
                  {wsConnected ? (
                    <WifiTetheringIcon
                      sx={{ fontSize: 12, color: "#00b0ff" }}
                    />
                  ) : (
                    <WifiOffIcon sx={{ fontSize: 12, color: "#334155" }} />
                  )}
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.6rem",
                      color: wsConnected ? "#00b0ff" : "#334155",
                      fontWeight: 700,
                    }}
                  >
                    {wsConnected ? "LIVE" : "OFFLINE"}
                  </Typography>
                </Box>
              </Tooltip>

              <Chip
                label={`${Object.keys(strategies).length} STRATS`}
                size="small"
                sx={{
                  background: "rgba(0,212,170,0.08)",
                  color: "#00d4aa",
                  border: "1px solid #00d4aa25",
                  fontWeight: 700,
                  fontSize: "0.62rem",
                  letterSpacing: "0.06em",
                }}
              />

              <Tooltip title="Reload strategies">
                <IconButton
                  size="small"
                  onClick={fetchStrategies}
                  sx={{
                    color: "#334155",
                    "&:hover": { color: "#00d4aa" },
                    p: 0.6,
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>

              {/* Server status */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: 1,
                  py: 0.35,
                  borderRadius: 1,
                  background: isServerHealthy
                    ? "rgba(0,230,118,0.08)"
                    : "rgba(255,23,68,0.08)",
                  border: `1px solid ${isServerHealthy ? "#00e67625" : "#ff174425"}`,
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: isServerHealthy ? "#00e676" : "#ff1744",
                    boxShadow: `0 0 5px ${isServerHealthy ? "#00e676" : "#ff1744"}`,
                    animation: isServerHealthy ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%,100%": { opacity: 1 },
                      "50%": { opacity: 0.3 },
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.6rem",
                    color: isServerHealthy ? "#00e676" : "#ff1744",
                    fontWeight: 700,
                  }}
                >
                  {isServerHealthy ? "ONLINE" : "OFFLINE"}
                </Typography>
              </Box>

              <IconButton
                onClick={toggleColorMode}
                sx={{ color: "text.secondary" }}
              >
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Toolbar>
          {(scanning || backtesting) && (
            <LinearProgress
              sx={{
                height: 2,
                background: "transparent",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #00d4aa, #00e676)",
                },
              }}
            />
          )}
        </AppBar>

        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, pt: 3, pb: 6 }}>
          {/* Errors */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{
                mb: 2,
                background: "rgba(255,23,68,0.07)",
                border: "1px solid #ff174428",
                "& .MuiAlert-message": {
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.78rem",
                },
              }}
            >
              {error}
            </Alert>
          )}
          {strategiesError && (
            <Alert
              severity="warning"
              onClose={() => setStrategiesError(null)}
              sx={{
                mb: 2,
                background: "rgba(255,171,0,0.07)",
                border: "1px solid #ffab0028",
                "& .MuiAlert-message": {
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.78rem",
                },
              }}
            >
              Strategy API unavailable — using fallback. {strategiesError}
            </Alert>
          )}

          {/* ── Main Tabs ── */}
          <Card sx={{ mb: 3 }}>
            <Tabs
              value={mainTab}
              onChange={(_, v) => {
                setMainTab(v);
                setScanResults(null);
                setBacktestResults(null);
              }}
              sx={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                "& .MuiTabs-indicator": {
                  background: "linear-gradient(90deg,#00d4aa,#00e676)",
                  height: 2,
                },
              }}
            >
              <Tab
                icon={<BoltIcon sx={{ fontSize: 14 }} />}
                iconPosition="start"
                label="LIVE SCANNER"
              />
              <Tab
                icon={<TimelineIcon sx={{ fontSize: 14 }} />}
                iconPosition="start"
                label="BACKTEST 1:1"
              />
              <Tab
                icon={
                  <Badge
                    badgeContent={alertCount > 0 ? alertCount : null}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.55rem",
                        minWidth: 14,
                        height: 14,
                      },
                    }}
                  >
                    <SensorsIcon sx={{ fontSize: 14 }} />
                  </Badge>
                }
                iconPosition="start"
                label="AUTO-SCAN"
                sx={{
                  color: mainTab === 2 ? "#00d4aa" : undefined,
                  "& .Mui-selected": { color: "#00d4aa" },
                }}
              />
            </Tabs>
          </Card>

          {/* ── Strategy Selection (shared across scanner & backtest tabs) ── */}
          {mainTab !== 2 && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: 2.5 }}>
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <MonoLabel color="#475569">Select Strategy</MonoLabel>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ToggleButtonGroup
                      size="small"
                      value={signalFilter}
                      exclusive
                      onChange={(_, v) => v && setSignalFilter(v)}
                      sx={{
                        "& .MuiToggleButton-root": {
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          border: "1px solid rgba(148,163,184,0.2)",
                          color: "#475569",
                          px: 1.1,
                          py: 0.35,
                          "&.Mui-selected": {
                            color: "text.primary",
                            background: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255,255,255,0.05)"
                                : "rgba(0,0,0,0.05)",
                          },
                        },
                      }}
                    >
                      <ToggleButton value="all">ALL</ToggleButton>
                      <ToggleButton
                        value="LONG"
                        sx={{
                          "&.Mui-selected": {
                            color: "#00e676 !important",
                            background: "rgba(0,230,118,0.08) !important",
                          },
                        }}
                      >
                        ▲ LONG
                      </ToggleButton>
                      <ToggleButton
                        value="SHORT"
                        sx={{
                          "&.Mui-selected": {
                            color: "#ff1744 !important",
                            background: "rgba(255,23,68,0.08) !important",
                          },
                        }}
                      >
                        ▼ SHORT
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <Select
                      size="small"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      sx={{
                        fontSize: "0.68rem",
                        minWidth: 120,
                        background: "background.default",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "divider",
                        },
                      }}
                    >
                      <MenuItem value="all" sx={{ fontSize: "0.72rem" }}>
                        All Timeframes
                      </MenuItem>
                      {presentCategories.map((c) => (
                        <MenuItem
                          key={c}
                          value={c}
                          sx={{ fontSize: "0.72rem" }}
                        >
                          {CATEGORY_META[c]?.label || c}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Box>

                {/* Strategy grid */}
                <Grid container spacing={1.2}>
                  {filteredStrategies.map(([key, strategy]) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
                      <StrategyCard
                        stratKey={key}
                        strategy={strategy}
                        selected={selectedStrategy === key}
                        onClick={() => setSelectedStrategy(key)}
                      />
                    </Grid>
                  ))}
                  {filteredStrategies.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ py: 5, textAlign: "center" }}>
                        <FilterListIcon
                          sx={{ fontSize: 32, color: "#1e293b", mb: 1 }}
                        />
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.72rem",
                            color: "#334155",
                          }}
                        >
                          NO STRATEGIES MATCH FILTER
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Divider
                  sx={{ my: 2.5, borderColor: "rgba(255,255,255,0.05)" }}
                />

                {/* Config row */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Stock Universe</InputLabel>
                      <Select
                        value={selectedStockList}
                        label="Stock Universe"
                        onChange={(e) => setSelectedStockList(e.target.value)}
                      >
                        {Object.entries(STOCK_LISTS).map(([k, v]) => (
                          <MenuItem
                            key={k}
                            value={k}
                            sx={{ fontSize: "0.78rem" }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <span>{v.icon}</span>
                              <span>{v.name}</span>
                              <Chip
                                label={v.count}
                                size="small"
                                sx={{ height: 16, fontSize: "0.6rem", ml: 0.5 }}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {mainTab === 0 && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Lookback Period</InputLabel>
                        <Select
                          value={intradayDays}
                          label="Lookback Period"
                          onChange={(e) => setIntradayDays(e.target.value)}
                        >
                          {[
                            { v: 1, l: "1 Day · ~75c", i: "⚡" },
                            { v: 3, l: "3 Days · ~225c", i: "🚀" },
                            { v: 5, l: "5 Days · ~375c", i: "📈" },
                            { v: 7, l: "7 Days · Optimal", i: "🎯" },
                          ].map(({ v, l, i }) => (
                            <MenuItem
                              key={v}
                              value={v}
                              sx={{ fontSize: "0.78rem" }}
                            >
                              {i} {l}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {mainTab === 1 && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Backtest Period</InputLabel>
                        <Select
                          value={backtestDays}
                          label="Backtest Period"
                          onChange={(e) => setBacktestDays(e.target.value)}
                        >
                          {[1, 3, 5, 7].map((d) => (
                            <MenuItem
                              key={d}
                              value={d}
                              sx={{ fontSize: "0.78rem" }}
                            >
                              {d} Day{d > 1 ? "s" : ""}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        height: "100%",
                        alignItems: "center",
                      }}
                    >
                      {mainTab === 0 ? (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={runScan}
                          disabled={
                            scanning || !isServerHealthy || !selectedStrategy
                          }
                          startIcon={
                            scanning ? (
                              <CircularProgress
                                size={13}
                                sx={{ color: "inherit" }}
                              />
                            ) : (
                              <PlayArrowIcon />
                            )
                          }
                          sx={{
                            background:
                              "linear-gradient(135deg,#00d4aa,#00b288)",
                            color: "#001a14",
                            fontWeight: 700,
                            py: 0.9,
                            "&:disabled": { opacity: 0.35 },
                          }}
                        >
                          {scanning ? "SCANNING..." : "RUN SCAN"}
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={runBacktest}
                          disabled={
                            backtesting || !isServerHealthy || !selectedStrategy
                          }
                          startIcon={
                            backtesting ? (
                              <CircularProgress
                                size={13}
                                sx={{ color: "inherit" }}
                              />
                            ) : (
                              <TimelineIcon />
                            )
                          }
                          sx={{
                            background:
                              "linear-gradient(135deg,#ff4d6d,#cc3d57)",
                            color: "#fff",
                            fontWeight: 700,
                            py: 0.9,
                            "&:disabled": { opacity: 0.35 },
                          }}
                        >
                          {backtesting
                            ? "RUNNING..."
                            : `BACKTEST ${backtestDays}D`}
                        </Button>
                      )}
                      <Tooltip title="Strategy details">
                        <IconButton
                          size="small"
                          onClick={() => setStrategyInfoOpen(true)}
                          disabled={!selectedStrategy}
                          sx={{
                            color: "#334155",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: 1,
                            p: 0.8,
                            "&:hover": {
                              color: "#00d4aa",
                              borderColor: "#00d4aa38",
                            },
                          }}
                        >
                          <InfoIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* ── Tab Content ── */}
          {mainTab === 0 && (
            <ScanResultsPanel
              scanResults={scanResults}
              selectedStrategy={selectedStrategy}
              strategies={strategies}
              lastScanned={lastScanned}
              intradayDays={intradayDays}
            />
          )}
          {mainTab === 1 && <BacktestPanel backtestResults={backtestResults} />}
          {mainTab === 2 && (
            <RealtimePanel
              selectedStrategy={selectedStrategy}
              selectedStockList={selectedStockList}
              strategies={strategies}
              wsConnected={wsConnected}
              telegramEnabled={false}
              onNewAlert={(a) => {
                setLiveAlert(a);
                setAlertCount((c) => c + 1);
              }}
            />
          )}

          {/* Auto-scan nudge when on scanner tab */}
          {mainTab === 2 && !selectedStrategy && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                background: "rgba(0,176,255,0.07)",
                border: "1px solid #00b0ff25",
                "& .MuiAlert-message": {
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.78rem",
                },
              }}
            >
              Select a strategy from the LIVE SCANNER tab first, then return
              here to start auto-scanning.
            </Alert>
          )}
        </Container>

        {/* Strategy Info Dialog */}
        <StrategyInfoDialog
          open={strategyInfoOpen}
          onClose={() => setStrategyInfoOpen(false)}
          stratKey={selectedStrategy}
          strategy={selectedStrategy ? strategies[selectedStrategy] : null}
          intradayDays={intradayDays}
          mainTab={mainTab}
        />
      </Box>
    </ThemeProvider>
  );
}
