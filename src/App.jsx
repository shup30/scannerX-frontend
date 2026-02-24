import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  ThemeProvider,
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
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Slide,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fab,
  Zoom,
} from "@mui/material";
import {
  ShowChart as ShowChartIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Refresh as RefreshIcon,
  NotificationsActive as NotificationsActiveIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  Timeline as TimelineIcon,
  Sensors as SensorsIcon,
  PlayArrow as PlayArrowIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Speed as SpeedIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";

import BoltIcon from "@mui/icons-material/Bolt";
import { useTranslation } from "react-i18next";

import { getTheme } from './styles/theme';
import {
  StatCard,
  MonoLabel,
  EnhancedStrategyCard,
  CATEGORY_META,
} from './components/components';
import {
  saveBacktestResults,
  getAllBacktestResults,
  clearBacktestResults,
} from './utils/utils';
import ScanResultsPanel from './features/ScanResultsPanel';
import BacktestPanel from './features/BacktestPanel';
import RealtimePanel from './features/RealtimePanel';
import AlertToast from './components/AlertToast';
import StrategyInfoDialog from './components/StrategyInfoDialog';
import IndexIndicatorPanel from './features/IndexIndicatorPanel';
import DashboardV4 from './features/DashboardV4';
import LanguageSwitcher from './components/LanguageSwitcher';
import InstallPrompt from "./components/InstallPrompt";
import { Switch, FormControlLabel } from '@mui/material';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || "";
const API_BASE_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

const STOCK_LISTS = {
  nifty_50: { name: "Nifty 50", count: 50, icon: "🇮🇳" },
  bank_nifty: { name: "Bank Nifty", count: 12, icon: "🏦" },
  popular_fo: { name: "Popular F&O", count: 200, icon: "📈" },
};

const iconMap = {
  flash_on: <BoltIcon />,
  flash_off: <BoltIcon sx={{ transform: "rotate(180deg)" }} />,
  track_changes: <ShowChartIcon />,
  show_chart: <ShowChartIcon />,
  trending_up: <TrendingUpIcon />,
  trending_down: <TrendingUpIcon sx={{ transform: "scaleY(-1)" }} />,
  layers: <AssessmentIcon />,
  whatshot: <BoltIcon />,
  north_east: <TrendingUpIcon />,
  south_east: <TrendingUpIcon sx={{ transform: "scaleY(-1)" }} />,
  timeline: <TimelineIcon />,
  compress: <FilterListIcon />,
  support: <ShowChartIcon />,
  speed: <SpeedIcon />,
  vertical_align_top: <TrendingUpIcon />,
  vertical_align_bottom: <TrendingUpIcon sx={{ transform: "scaleY(-1)" }} />,
  redo: <RefreshIcon />,
  undo: <RefreshIcon sx={{ transform: "scaleX(-1)" }} />,
  block: <CloseIcon />,
  bolt: <BoltIcon />,
  assessment: <AssessmentIcon />,
};
const getIcon = (name) => iconMap[name] || <ShowChartIcon />;

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL TO TOP BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function ScrollToTop() {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Zoom in={showScroll}>
      <Fab
        size="medium"
        onClick={scrollToTop}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          background: "linear-gradient(135deg, #00d4aa, #00b288)",
          color: "#fff",
          zIndex: 1000,
          "&:hover": {
            background: "linear-gradient(135deg, #00b288, #008866)",
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(0,212,170,0.35)",
          },
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const { t } = useTranslation();
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("theme_mode");
    return saved || "dark";
  });
  const [scanning, setScanning] = useState(false);
  const [backtesting, setBacktesting] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [selectedStrategies, setSelectedStrategies] = useState([]);
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  // WebSocket & Alert state
  const [wsConnected, setWsConnected] = useState(false);
  const [liveAlert, setLiveAlert] = useState(null);
  const [alertCount, setAlertCount] = useState(0);
  const wsRef = useRef(null);
  const alertTimerRef = useRef(null);

  // Auto-Scan status (lifted from RealtimePanel)
  const [autoscans, setAutoscans] = useState([]);
  const [autoscanStats, setAutoscanStats] = useState({});
  const [telegramStatus, setTelegramStatus] = useState({
    enabled: false,
    checked: false,
  });

  // LLM Report status
  const [llmEnabled, setLlmEnabled] = useState(false);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmProvider, setLlmProvider] = useState("deepseek");
  const [llmProvidersList, setLlmProvidersList] = useState([]);

  const statusTimerRef = useRef(null);

  const fetchAutoscanStatus = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/autoscan/status`);
      if (!r.ok) throw new Error("Status failed");
      const d = await r.json();
      if (d.success) {
        setAutoscans(d.scans || []);
        setAutoscanStats(d.stats || {});
        setTelegramStatus({ enabled: d.telegram_enabled, checked: true });
      }
    } catch (e) {
      console.error("Autoscan status error:", e);
    }
  };

  const fetchLlmStatus = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/llm-reporter/status`);
      if (!r.ok) throw new Error("LLM status failed");
      const d = await r.json();
      if (d.success) {
        setLlmEnabled(d.data.enabled);
        setLlmProvider(d.data.active_provider || "deepseek");
      }

      const pRes = await fetch(`${API_BASE_URL}/api/llm-reporter/providers`);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.success) {
          setLlmProvidersList(pData.providers || []);
        }
      }
    } catch (e) {
      console.error("LLM status error:", e);
    }
  };

  const switchLlmProvider = async (newProvider) => {
    try {
      setLlmLoading(true);
      const r = await fetch(`${API_BASE_URL}/api/llm-reporter/provider`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: newProvider }),
      });
      const d = await r.json();
      if (d.success) {
        setLlmProvider(d.active_provider);
      }
    } catch (e) {
      console.error("LLM Provider switch error:", e);
    } finally {
      setLlmLoading(false);
    }
  };

  const toggleLlmReporter = async () => {
    try {
      setLlmLoading(true);
      const r = await fetch(`${API_BASE_URL}/api/llm-reporter/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !llmEnabled }),
      });
      const d = await r.json();
      if (d.success) {
        setLlmEnabled(d.enabled);
      }
    } catch (e) {
      console.error("LLM toggle error:", e);
    } finally {
      setLlmLoading(false);
    }
  };

  useEffect(() => {
    fetchAutoscanStatus();
    fetchLlmStatus();
    statusTimerRef.current = setInterval(fetchAutoscanStatus, 3000);
    return () => {
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
    };
  }, []);

  const theme = useMemo(() => getTheme(mode), [mode]);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const toggleColorMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);
    localStorage.setItem("theme_mode", newMode);
  };

  // ── WebSocket ──
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    try {
      let wsUrl = API_BASE_URL;
      if (wsUrl.startsWith("http")) {
        wsUrl = wsUrl.replace(/^http/, "ws") + "/ws/alerts";
      } else {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.host;
        wsUrl = `${protocol}//${host}${wsUrl}/ws/alerts`;
      }
      const ws = new WebSocket(wsUrl);
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
          alertTimerRef.current = setTimeout(() => setLiveAlert(null), 8000);
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification(
              `${data.signal_type === "LONG" ? "▲" : "▼"} ${data.symbol}`,
              {
                body: `${data.strategy_key?.replace(/-/g, " ")} · ₹${data.values?.close}`,
                icon: "/favicon.ico",
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
    } catch { }
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
        if (selectedStrategies.length === 0) {
          const first = Object.keys(t)[0];
          if (first) setSelectedStrategies([first]);
        }
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
      setSelectedStrategies(["intraday-momentum-breakout"]);
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
    const selectedStrategy = selectedStrategies[0];
    if (!selectedStrategy) return;
    setScanning(true);
    setError(null);
    setScanResults(null);
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/scanner/scan?strategy=${selectedStrategy}&stock_list=${selectedStockList}&history_days=${intradayDays}`,
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
    const selectedStrategy = selectedStrategies[0];
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
      // Save to localStorage
      saveBacktestResults(selectedStrategy, result.data);
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
            background: "linear-gradient(135deg, #0a0e14 0%, #151a21 100%)",
            gap: 3,
          }}
        >
          <Box sx={{ position: "relative" }}>
            <CircularProgress
              size={64}
              thickness={2}
              sx={{
                color: "#00d4aa",
                filter: "drop-shadow(0 0 12px rgba(0,212,170,0.5))",
              }}
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
              <ShowChartIcon sx={{ color: "#00d4aa", fontSize: 24 }} />
            </Box>
          </Box>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              color: "#475569",
              fontSize: "0.8rem",
              letterSpacing: "0.15em",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.5 },
              },
            }}
          >
            {t('app.loading')}
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // ── Main Render ──
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
            mode === "dark"
              ? "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)"
              : "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.015) 2px,rgba(0,0,0,0.015) 4px)",
          opacity: 0.3,
        }}
      />

      {/* Alert Toast */}
      <AlertToast alert={liveAlert} onClose={() => setLiveAlert(null)} />

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Scroll to Top */}
      <ScrollToTop />

      <Box
        sx={{
          minHeight: "100vh",
          background: theme.palette.background.default,
        }}
      >
        {/* ── AppBar ── */}
        <AppBar position="sticky" elevation={0}>
          <Toolbar
            sx={{
              gap: isMobile ? 1 : 2,
              minHeight: isMobile ? "56px" : "64px",
              px: { xs: 1.5, sm: 2, md: 3 },
            }}
          >
            {isMobile && (
              <IconButton
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 1 : 1.5,
                flexGrow: 1,
              }}
            >
              <Box
                sx={{
                  width: isMobile ? 28 : 36,
                  height: isMobile ? 28 : 36,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.main}40)`,
                  border: `1.5px solid ${theme.palette.primary.main}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                }}
              >
                <ShowChartIcon
                  sx={{
                    color: theme.palette.primary.main,
                    fontSize: isMobile ? 14 : 18,
                  }}
                />
              </Box>
              {!isMobile && (
                <Box>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 700,
                      fontSize: isTablet ? "0.8rem" : "0.9rem",
                      color: theme.palette.text.primary,
                      letterSpacing: "0.06em",
                      lineHeight: 1,
                    }}
                  >
                    {t('app.title')}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", "Noto Sans Devanagari", monospace',
                      fontSize: "0.58rem",
                      color: theme.palette.primary.main,
                      letterSpacing: "0.12em",
                      mt: 0.2,
                    }}
                  >
                    {t('app.subtitle')}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              {!isMobile && alertCount > 0 && (
                <Badge
                  badgeContent={alertCount}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.6rem",
                    },
                  }}
                >
                  <Box
                    sx={{
                      px: 1,
                      py: 0.4,
                      borderRadius: 1.5,
                      background: "rgba(255,171,0,0.12)",
                      border: "1px solid rgba(255,171,0,0.3)",
                    }}
                  >
                    <NotificationsActiveIcon
                      sx={{ fontSize: 14, color: "#ffab00" }}
                    />
                  </Box>
                </Badge>
              )}

              {!isMobile && (
                <>
                  <Tooltip
                    title={
                      wsConnected ? t('status.wsConnected') : t('status.wsOffline')
                    }
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: 0.4,
                        borderRadius: 1.5,
                        background: wsConnected
                          ? "rgba(0,176,255,0.1)"
                          : "rgba(100,116,139,0.1)",
                        border: `1px solid ${wsConnected ? "rgba(0,176,255,0.25)" : "rgba(100,116,139,0.2)"}`,
                      }}
                    >
                      {wsConnected ? (
                        <WifiIcon sx={{ fontSize: 12, color: "#00b0ff" }} />
                      ) : (
                        <WifiOffIcon sx={{ fontSize: 12, color: "#64748b" }} />
                      )}
                      <Typography
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: "0.6rem",
                          color: wsConnected ? "#00b0ff" : "#64748b",
                          fontWeight: 700,
                        }}
                      >
                        {wsConnected ? t('status.live') : t('status.off')}
                      </Typography>
                    </Box>
                  </Tooltip>

                  <Chip
                    label={`${Object.keys(strategies).length} ${t('status.strats')}`}
                    size="small"
                    sx={{
                      background: `${theme.palette.primary.main}15`,
                      color: theme.palette.primary.main,
                      border: `1px solid ${theme.palette.primary.main}30`,
                      fontWeight: 700,
                      fontSize: "0.62rem",
                      height: 24,
                    }}
                  />

                  <Tooltip title={t('status.reloadStrategies')}>
                    <IconButton
                      size="small"
                      onClick={fetchStrategies}
                      sx={{
                        color: theme.palette.text.disabled,
                        "&:hover": { color: theme.palette.primary.main },
                        p: 0.7,
                      }}
                    >
                      <RefreshIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  px: isMobile ? 0.7 : 1,
                  py: 0.4,
                  borderRadius: 1.5,
                  background: isServerHealthy
                    ? "rgba(0,230,118,0.1)"
                    : "rgba(255,23,68,0.1)",
                  border: `1px solid ${isServerHealthy ? "rgba(0,230,118,0.25)" : "rgba(255,23,68,0.25)"}`,
                }}
              >
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: isServerHealthy ? "#00e676" : "#ff1744",
                    boxShadow: `0 0 8px ${isServerHealthy ? "#00e676" : "#ff1744"}`,
                    animation: isServerHealthy ? "pulse 2s infinite" : "none",
                    "@keyframes pulse": {
                      "0%,100%": { opacity: 1 },
                      "50%": { opacity: 0.3 },
                    },
                  }}
                />
                {!isMobile && (
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: "0.6rem",
                      color: isServerHealthy ? "#00e676" : "#ff1744",
                      fontWeight: 700,
                    }}
                  >
                    {isServerHealthy ? t('status.online') : t('status.offline')}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, mr: 1, borderRadius: 2, bgcolor: llmEnabled ? 'rgba(0,176,255,0.1)' : 'rgba(100,116,139,0.1)', px: 1, py: 0.3, border: `1px solid ${llmEnabled ? 'rgba(0,176,255,0.3)' : 'transparent'}`, gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {llmLoading ? <CircularProgress size={14} sx={{ mr: 1 }} /> : <BoltIcon sx={{ fontSize: 16, mr: 0.5, color: llmEnabled ? '#00b0ff' : '#64748b' }} />}
                  <FormControlLabel
                    control={<Switch checked={llmEnabled} onChange={toggleLlmReporter} disabled={llmLoading} size="small" />}
                    label={<Typography variant="caption" sx={{ fontWeight: 'bold', color: llmEnabled ? '#00b0ff' : '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>AI REPORT</Typography>}
                    sx={{ m: 0 }}
                  />
                </Box>
                {llmProvidersList.length > 0 && (
                  <Select
                    size="small"
                    value={llmProvider}
                    onChange={(e) => switchLlmProvider(e.target.value)}
                    disabled={llmLoading}
                    sx={{
                      height: 24,
                      fontSize: '0.65rem',
                      fontFamily: '"JetBrains Mono", monospace',
                      color: '#00b0ff',
                      '.MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                      '.MuiSelect-select': { py: 0, pr: '24px !important', pl: 1 },
                      '.MuiSvgIcon-root': { color: '#00b0ff' }
                    }}
                  >
                    {llmProvidersList.map((p) => (
                      <MenuItem key={p.id} value={p.id} disabled={!p.is_available} sx={{ fontSize: '0.7rem', fontFamily: '"JetBrains Mono", monospace' }}>
                        {p.display_name} {!p.is_available && "(Unconfigured)"}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Box>

              <LanguageSwitcher />
              <IconButton
                onClick={toggleColorMode}
                sx={{
                  color: theme.palette.text.secondary,
                  "&:hover": { color: theme.palette.primary.main },
                }}
                size={isMobile ? "small" : "medium"}
              >
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Toolbar>
          {(scanning || backtesting) && (
            <LinearProgress
              sx={{
                height: 3,
                background: "transparent",
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                },
              }}
            />
          )}
        </AppBar>

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 280,
              background: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                {t('drawer.menu')}
              </Typography>
              <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem
                button
                onClick={() => {
                  setMainTab(0);
                  setDrawerOpen(false);
                }}
                selected={mainTab === 0}
              >
                <ListItemIcon>
                  <AssessmentIcon />
                </ListItemIcon>
                <ListItemText primary={t('drawer.indexSignals')} />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  setMainTab(1);
                  setDrawerOpen(false);
                }}
                selected={mainTab === 1}
              >
                <ListItemIcon>
                  <SpeedIcon />
                </ListItemIcon>
                <ListItemText primary="V4 Engine" />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  setMainTab(2);
                  setDrawerOpen(false);
                }}
                selected={mainTab === 2}
              >
                <ListItemIcon>
                  <BoltIcon />
                </ListItemIcon>
                <ListItemText primary={t('drawer.liveScanner')} />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  setMainTab(3);
                  setDrawerOpen(false);
                }}
                selected={mainTab === 3}
              >
                <ListItemIcon>
                  <TimelineIcon />
                </ListItemIcon>
                <ListItemText primary={t('drawer.backtest')} />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  setMainTab(4);
                  setDrawerOpen(false);
                }}
                selected={mainTab === 4}
              >
                <ListItemIcon>
                  <Badge
                    badgeContent={alertCount}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.6rem",
                      },
                    }}
                  >
                    <SensorsIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary={t('drawer.autoScan')} />
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ px: 2 }}>
              <MonoLabel size="0.65rem" color={theme.palette.text.disabled}>
                {t('drawer.quickStats')}
              </MonoLabel>
              <Box
                sx={{
                  mt: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {t('drawer.strategies')}
                  </Typography>
                  <Chip
                    label={Object.keys(strategies).length}
                    size="small"
                    sx={{ height: 20, fontSize: "0.65rem" }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {t('drawer.webSocket')}
                  </Typography>
                  <Chip
                    label={wsConnected ? "Live" : "Offline"}
                    size="small"
                    color={wsConnected ? "success" : "default"}
                    sx={{ height: 20, fontSize: "0.65rem" }}
                  />
                </Box>
                {alertCount > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.7rem",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {t('drawer.alerts')}
                    </Typography>
                    <Chip
                      label={alertCount}
                      size="small"
                      color="warning"
                      sx={{ height: 20, fontSize: "0.65rem" }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Drawer>

        <Container
          maxWidth={false}
          sx={{
            px: { xs: 1.5, sm: 2, md: 3 },
            pt: { xs: 2, md: 3 },
            pb: { xs: 4, md: 6 },
            maxWidth: "1600px",
          }}
        >
          {/* Errors */}
          {error && (
            <Slide direction="down" in={!!error} mountOnEnter unmountOnExit>
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{
                  mb: 2,
                  background:
                    mode === "dark"
                      ? "rgba(255,23,68,0.1)"
                      : "rgba(255,23,68,0.05)",
                  border: `1px solid ${theme.palette.error.main}35`,
                  borderRadius: 2,
                  "& .MuiAlert-message": {
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.78rem",
                  },
                }}
              >
                {error}
              </Alert>
            </Slide>
          )}
          {strategiesError && (
            <Alert
              severity="warning"
              onClose={() => setStrategiesError(null)}
              sx={{
                mb: 2,
                background:
                  mode === "dark"
                    ? "rgba(255,171,0,0.1)"
                    : "rgba(255,171,0,0.05)",
                border: `1px solid ${theme.palette.warning.main}35`,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.78rem",
                },
              }}
            >
              {t('strategy.apiUnavailable')} {strategiesError}
            </Alert>
          )}

          {/* Continue in Part 3 with tabs and content... */}

          {/* ── Main Tabs ── */}
          <Card sx={{ mb: 3, overflow: "hidden" }}>
            <Tabs
              value={mainTab}
              onChange={(_, v) => {
                setMainTab(v);
                setScanResults(null);
                setBacktestResults(null);
              }}
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{
                borderBottom: `1px solid ${theme.palette.divider}`,
                "& .MuiTabs-indicator": {
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                  height: 3,
                },
                "& .MuiTab-root": {
                  minHeight: isMobile ? 48 : 56,
                },
              }}
            >
              <Tab
                icon={<AssessmentIcon sx={{ fontSize: isMobile ? 16 : 18 }} />}
                iconPosition="start"
                label={isMobile ? t('tabs.indexSignalsShort') : t('tabs.indexSignals')}
              />
              <Tab
                icon={<SpeedIcon sx={{ fontSize: isMobile ? 16 : 18 }} />}
                iconPosition="start"
                label={isMobile ? "V4 Engine" : "V4 AI Engine"}
              />
              <Tab
                icon={<BoltIcon sx={{ fontSize: isMobile ? 16 : 18 }} />}
                iconPosition="start"
                label={isMobile ? t('tabs.liveScannerShort') : t('tabs.liveScanner')}
              />
              <Tab
                icon={<TimelineIcon sx={{ fontSize: isMobile ? 16 : 18 }} />}
                iconPosition="start"
                label={isMobile ? t('tabs.backtestShort') : t('tabs.backtest')}
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
                    <SensorsIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
                  </Badge>
                }
                iconPosition="start"
                label={isMobile ? t('tabs.autoScanShort') : t('tabs.autoScan')}
              />
            </Tabs>
          </Card>

          {/* ── Strategy Selection ── */}
          {(mainTab !== 0 && mainTab !== 1) && (
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
                {/* Header */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <MonoLabel color={theme.palette.text.disabled}>
                    {t('strategy.selectStrategy')}
                  </MonoLabel>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <ToggleButtonGroup
                      size="small"
                      value={signalFilter}
                      exclusive
                      onChange={(_, v) => v && setSignalFilter(v)}
                      sx={{
                        "& .MuiToggleButton-root": {
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: isMobile ? "0.6rem" : "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                          border: `1px solid ${theme.palette.divider}`,
                          color: theme.palette.text.disabled,
                          px: isMobile ? 0.8 : 1.2,
                          py: 0.4,
                          "&.Mui-selected": {
                            color: theme.palette.text.primary,
                            background: theme.palette.background.elevated,
                          },
                        },
                      }}
                    >
                      <ToggleButton value="all">{t('strategy.all')}</ToggleButton>
                      <ToggleButton
                        value="LONG"
                        sx={{
                          "&.Mui-selected": {
                            color: `${theme.palette.success.main} !important`,
                            background: `${theme.palette.success.main}15 !important`,
                          },
                        }}
                      >
                        {!isMobile && "▲ "}{t('strategy.long')}
                      </ToggleButton>
                      <ToggleButton
                        value="SHORT"
                        sx={{
                          "&.Mui-selected": {
                            color: `${theme.palette.error.main} !important`,
                            background: `${theme.palette.error.main}15 !important`,
                          },
                        }}
                      >
                        {!isMobile && "▼ "}{t('strategy.short')}
                      </ToggleButton>
                    </ToggleButtonGroup>
                    {!isMobile && (
                      <Select
                        size="small"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        sx={{
                          fontSize: "0.7rem",
                          minWidth: 140,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.divider,
                          },
                        }}
                      >
                        <MenuItem value="all" sx={{ fontSize: "0.72rem" }}>
                          {t('strategy.allTimeframes')}
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
                    )}
                  </Box>
                </Box>

                {/* Strategy grid */}
                <Grid container spacing={isMobile ? 1 : 1.5}>
                  {filteredStrategies.map(([key, strategy]) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
                      <EnhancedStrategyCard
                        stratKey={key}
                        strategy={strategy}
                        selected={selectedStrategies.includes(key)}
                        isRunning={autoscans.some(
                          (t) => t.strategy === key && t.is_running,
                        )}
                        onClick={() => {
                          if (mainTab === 4) {
                            // Multi-select for Auto-Scan
                            setSelectedStrategies((prev) =>
                              prev.includes(key)
                                ? prev.filter((k) => k !== key)
                                : [...prev, key],
                            );
                          } else {
                            // Single-select for Scan/Backtest
                            setSelectedStrategies([key]);
                          }
                        }}
                        getIcon={getIcon}
                      />
                    </Grid>
                  ))}
                  {filteredStrategies.length === 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ py: 6, textAlign: "center" }}>
                        <FilterListIcon
                          sx={{
                            fontSize: 40,
                            color: theme.palette.text.disabled,
                            mb: 1.5,
                            opacity: 0.5,
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.75rem",
                            color: theme.palette.text.disabled,
                          }}
                        >
                          NO STRATEGIES MATCH FILTER
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                <Divider sx={{ my: 2.5 }} />

                {/* Config row */}
                <Grid container spacing={isMobile ? 1.5 : 2}>
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
                                sx={{
                                  height: 18,
                                  fontSize: "0.6rem",
                                  ml: 0.5,
                                }}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {mainTab === 2 && (
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
                  {mainTab === 3 && (
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Backtest Period</InputLabel>
                        <Select
                          value={backtestDays}
                          label="Backtest Period"
                          onChange={(e) => setBacktestDays(e.target.value)}
                        >
                          {[1, 3, 5, 7, 14, 30].map((d) => (
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

                  {(mainTab === 2 || mainTab === 3) && (
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          height: "100%",
                          alignItems: "center",
                        }}
                      >
                        {mainTab === 2 ? (
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={runScan}
                            disabled={
                              scanning ||
                              !isServerHealthy ||
                              selectedStrategies.length === 0
                            }
                            startIcon={
                              scanning ? (
                                <CircularProgress
                                  size={14}
                                  sx={{ color: "inherit" }}
                                />
                              ) : (
                                <PlayArrowIcon />
                              )
                            }
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                              color: theme.palette.primary.contrastText,
                              fontWeight: 700,
                              fontSize: isMobile ? "0.7rem" : "0.75rem",
                              py: isMobile ? 0.8 : 1,
                              boxShadow: `0 4px 16px ${theme.palette.primary.main}35`,
                              "&:hover": {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                boxShadow: `0 6px 24px ${theme.palette.primary.main}45`,
                              },
                              "&:disabled": { opacity: 0.4 },
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
                              backtesting ||
                              !isServerHealthy ||
                              selectedStrategies.length === 0
                            }
                            startIcon={
                              backtesting ? (
                                <CircularProgress
                                  size={14}
                                  sx={{ color: "inherit" }}
                                />
                              ) : (
                                <TimelineIcon />
                              )
                            }
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: isMobile ? "0.7rem" : "0.75rem",
                              py: isMobile ? 0.8 : 1,
                              boxShadow: `0 4px 16px ${theme.palette.secondary.main}35`,
                              "&:hover": {
                                background: `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
                                boxShadow: `0 6px 24px ${theme.palette.secondary.main}45`,
                              },
                              "&:disabled": { opacity: 0.4 },
                            }}
                          >
                            {backtesting
                              ? "RUNNING..."
                              : `BACKTEST ${backtestDays}D`}
                          </Button>
                        )}
                        <Tooltip title={t('strategy.strategyDetails')}>
                          <IconButton
                            size="small"
                            disabled={selectedStrategies.length === 0}
                            onClick={() => setStrategyInfoOpen(true)}
                            sx={{
                              color: theme.palette.text.disabled,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 2,
                              p: isMobile ? 0.7 : 0.9,
                              "&:hover": {
                                color: theme.palette.primary.main,
                                borderColor: `${theme.palette.primary.main}40`,
                                background: `${theme.palette.primary.main}08`,
                              },
                            }}
                          >
                            <InfoIcon sx={{ fontSize: isMobile ? 16 : 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* ── Tab Content ── */}
          {mainTab === 0 && <IndexIndicatorPanel llmEnabled={llmEnabled} llmLoading={llmLoading} />}
          {mainTab === 1 && <DashboardV4 />}
          {mainTab === 2 && (
            <ScanResultsPanel
              scanResults={scanResults}
              selectedStrategy={selectedStrategies[0]}
              strategies={strategies}
              lastScanned={lastScanned}
              intradayDays={intradayDays}
            />
          )}
          {mainTab === 3 && <BacktestPanel backtestResults={backtestResults} />}
          {mainTab === 4 && (
            <RealtimePanel
              selectedStrategies={selectedStrategies}
              selectedStockList={selectedStockList}
              strategies={strategies}
              wsConnected={wsConnected}
              autoscans={autoscans}
              stats={autoscanStats}
              telegramStatus={telegramStatus}
              setTelegramStatus={setTelegramStatus}
              onRefreshStatus={fetchAutoscanStatus}
              onNewAlert={(a) => {
                setLiveAlert(a);
                setAlertCount((c) => c + 1);
              }}
            />
          )}
        </Container>

        {/* Strategy Info Dialog */}
        <StrategyInfoDialog
          open={strategyInfoOpen}
          onClose={() => setStrategyInfoOpen(false)}
          stratKey={selectedStrategies[0]}
          strategy={
            selectedStrategies[0] ? strategies[selectedStrategies[0]] : null
          }
          intradayDays={intradayDays}
          mainTab={mainTab}
          getIcon={getIcon}
        />
      </Box>
    </ThemeProvider>
  );
}
