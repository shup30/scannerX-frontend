import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
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
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Telegram as TelegramIcon,
  NotificationsNone as NotificationsNoneIcon,
  Sensors as SensorsIcon,
  SensorsOff as SensorsOffIcon,
} from "@mui/icons-material";
import { MonoLabel, DirectionBadge } from "./components";
import { formatTs } from "./utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const STOCK_LISTS = {
  nifty_50: { name: "Nifty 50", count: 50, icon: "🇮🇳" },
  bank_nifty: { name: "Bank Nifty", count: 12, icon: "🏦" },
  popular_fo: { name: "Popular F&O", count: 200, icon: "📈" },
};

export default function RealtimePanel({
  selectedStrategy,
  selectedStockList,
  strategies,
  wsConnected,
  onNewAlert,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
            background: `${theme.palette.error.main}10`,
            border: `1px solid ${theme.palette.error.main}35`,
            borderRadius: 2,
            "& .MuiAlert-message": {
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.78rem",
            },
          }}
        >
          {err}
        </Alert>
      )}

      {/* Control Card */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2.5,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: isMobile ? 32 : 40,
                  height: isMobile ? 32 : 40,
                  borderRadius: 2.5,
                  background: isCurrentRunning
                    ? `${theme.palette.success.main}18`
                    : theme.palette.background.elevated,
                  border: `2px solid ${isCurrentRunning ? `${theme.palette.success.main}40` : theme.palette.divider}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                }}
              >
                {isCurrentRunning ? (
                  <SensorsIcon
                    sx={{
                      color: theme.palette.success.main,
                      fontSize: isMobile ? 16 : 20,
                    }}
                  />
                ) : (
                  <SensorsOffIcon
                    sx={{
                      color: theme.palette.text.disabled,
                      fontSize: isMobile ? 16 : 20,
                    }}
                  />
                )}
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                    color: theme.palette.text.primary,
                  }}
                >
                  AUTO-SCAN ENGINE
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.6,
                    mt: 0.3,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: isCurrentRunning
                        ? theme.palette.success.main
                        : theme.palette.text.disabled,
                      boxShadow: isCurrentRunning
                        ? `0 0 8px ${theme.palette.success.main}`
                        : "none",
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
                      fontSize: isMobile ? "0.6rem" : "0.65rem",
                      color: isCurrentRunning
                        ? theme.palette.success.main
                        : theme.palette.text.disabled,
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
              <Tooltip title="WebSocket status">
                <Chip
                  label={wsConnected ? "WS LIVE" : "WS OFF"}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    background: wsConnected
                      ? `${theme.palette.info.main}15`
                      : `${theme.palette.text.disabled}10`,
                    color: wsConnected
                      ? theme.palette.info.main
                      : theme.palette.text.disabled,
                    border: `1px solid ${wsConnected ? `${theme.palette.info.main}30` : theme.palette.divider}`,
                  }}
                />
              </Tooltip>

              {!isMobile && (
                <Tooltip title="Telegram status">
                  <Chip
                    label={telegramStatus.enabled ? "TELEGRAM" : "NO TG"}
                    size="small"
                    icon={<TelegramIcon sx={{ fontSize: 12 }} />}
                    sx={{
                      height: 24,
                      fontSize: "0.62rem",
                      fontWeight: 700,
                      background: telegramStatus.enabled
                        ? "rgba(0,136,204,0.15)"
                        : `${theme.palette.text.disabled}10`,
                      color: telegramStatus.enabled
                        ? "#0088cc"
                        : theme.palette.text.disabled,
                      border: `1px solid ${telegramStatus.enabled ? "rgba(0,136,204,0.3)" : theme.palette.divider}`,
                    }}
                  />
                </Tooltip>
              )}

              <IconButton
                size="small"
                onClick={fetchStatus}
                sx={{
                  color: theme.palette.text.disabled,
                  "&:hover": { color: theme.palette.primary.main },
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1.5,
                  p: 0.6,
                }}
              >
                <RefreshIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Config */}
          <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 2 }}>
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
                      background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: isMobile ? "0.7rem" : "0.75rem",
                      py: isMobile ? 0.8 : 1,
                      boxShadow: `0 4px 16px ${theme.palette.success.main}35`,
                      "&:hover": {
                        background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                      },
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
                    sx={{
                      fontWeight: 700,
                      fontSize: isMobile ? "0.7rem" : "0.75rem",
                      py: isMobile ? 0.8 : 1,
                    }}
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
                      borderColor: "rgba(0,136,204,0.3)",
                      color: "#0088cc",
                      whiteSpace: "nowrap",
                      display: isMobile ? "none" : "flex",
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
          <Grid container spacing={isMobile ? 1 : 1.5}>
            {[
              {
                label: "Total Scans",
                value: stats.total_scans ?? 0,
                color: theme.palette.primary.main,
              },
              {
                label: "Matches Found",
                value: stats.total_matches ?? 0,
                color: theme.palette.success.main,
              },
              {
                label: "Alerts Sent",
                value: stats.total_alerts_sent ?? 0,
                color: theme.palette.warning.main,
              },
              {
                label: "Running Tasks",
                value: autoscans.filter((s) => s.is_running).length,
                color: theme.palette.info.main,
              },
            ].map(({ label, value, color }) => (
              <Grid item xs={6} sm={3} key={label}>
                <Box
                  sx={{
                    p: isMobile ? 1.2 : 1.5,
                    borderRadius: 2,
                    background: theme.palette.background.elevated,
                    border: `1px solid ${theme.palette.divider}`,
                    textAlign: "center",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 24px ${color}20`,
                      borderColor: `${color}30`,
                    },
                  }}
                >
                  <MonoLabel
                    color={theme.palette.text.disabled}
                    size={isMobile ? "0.58rem" : "0.62rem"}
                  >
                    {label}
                  </MonoLabel>
                  <Typography
                    sx={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontWeight: 700,
                      fontSize: isMobile ? "1.3rem" : "1.5rem",
                      color,
                      lineHeight: 1.2,
                      mt: 0.4,
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

      {/* Active Scans */}
      {autoscans.length > 0 && (
        <Card sx={{ mb: 2.5 }}>
          <CardContent sx={{ p: 0 }}>
            <Box
              sx={{
                px: isMobile ? 2 : 2.5,
                pt: 2,
                pb: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <MonoLabel color={theme.palette.text.disabled}>
                Active Scans ({autoscans.length})
              </MonoLabel>
              <Chip
                label={`${autoscans.filter((s) => s.is_running).length} running`}
                size="small"
                sx={{
                  background: `${theme.palette.success.main}15`,
                  color: theme.palette.success.main,
                  border: `1px solid ${theme.palette.success.main}30`,
                  fontSize: "0.62rem",
                  height: 20,
                }}
              />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Scan ID</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>Strategy</TableCell>
                        <TableCell>Universe</TableCell>
                        <TableCell align="center">Interval</TableCell>
                      </>
                    )}
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
                            fontSize: isMobile ? "0.68rem" : "0.72rem",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {isMobile
                            ? scan.scan_id.substring(0, 20) + "..."
                            : scan.scan_id}
                        </Typography>
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                color: theme.palette.text.primary,
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
                                color: theme.palette.text.secondary,
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
                                color: theme.palette.text.secondary,
                              }}
                            >
                              {scan.interval_seconds}s
                            </Typography>
                          </TableCell>
                        </>
                      )}
                      <TableCell align="center">
                        <Chip
                          label={scan.is_running ? "RUNNING" : "STOPPED"}
                          size="small"
                          icon={
                            scan.is_running ? (
                              <Box
                                sx={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: "50%",
                                  background: theme.palette.success.main,
                                  animation: "blink 1.2s infinite",
                                  "@keyframes blink": {
                                    "0%,100%": { opacity: 1 },
                                    "50%": { opacity: 0.2 },
                                  },
                                }}
                              />
                            ) : undefined
                          }
                          sx={{
                            height: 22,
                            fontSize: "0.62rem",
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 700,
                            background: scan.is_running
                              ? `${theme.palette.success.main}15`
                              : `${theme.palette.text.disabled}10`,
                            color: scan.is_running
                              ? theme.palette.success.main
                              : theme.palette.text.disabled,
                            border: `1px solid ${scan.is_running ? `${theme.palette.success.main}30` : theme.palette.divider}`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {scan.is_running && (
                          <IconButton
                            size="small"
                            onClick={() => stopScan(scan.scan_id)}
                            disabled={stopping === scan.scan_id}
                            sx={{
                              color: theme.palette.error.main,
                              border: `1px solid ${theme.palette.error.main}30`,
                              borderRadius: 1.5,
                              p: 0.5,
                              "&:hover": {
                                background: `${theme.palette.error.main}10`,
                              },
                            }}
                          >
                            {stopping === scan.scan_id ? (
                              <CircularProgress
                                size={12}
                                sx={{ color: theme.palette.error.main }}
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

      {/* Recent Alerts */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              px: isMobile ? 2 : 2.5,
              pt: 2,
              pb: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <NotificationsNoneIcon
                sx={{ fontSize: 16, color: theme.palette.warning.main }}
              />
              <MonoLabel color={theme.palette.text.disabled}>
                Recent Alerts
              </MonoLabel>
              {recentAlerts.length > 0 && (
                <Chip
                  label={recentAlerts.length}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.62rem",
                    background: `${theme.palette.warning.main}15`,
                    color: theme.palette.warning.main,
                    border: `1px solid ${theme.palette.warning.main}30`,
                    fontWeight: 700,
                  }}
                />
              )}
            </Box>
            <IconButton
              size="small"
              onClick={clearAlerts}
              disabled={clearingAlerts}
              sx={{
                color: theme.palette.text.disabled,
                p: 0.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                "&:hover": {
                  color: theme.palette.error.main,
                  borderColor: `${theme.palette.error.main}30`,
                },
              }}
            >
              <Tooltip title="Clear all alert cooldowns">
                {clearingAlerts ? (
                  <CircularProgress
                    size={12}
                    sx={{ color: theme.palette.error.main }}
                  />
                ) : (
                  <DeleteIcon sx={{ fontSize: 14 }} />
                )}
              </Tooltip>
            </IconButton>
          </Box>

          {recentAlerts.length === 0 ? (
            <Box sx={{ py: isMobile ? 4 : 5, textAlign: "center" }}>
              <NotificationsNoneIcon
                sx={{
                  fontSize: isMobile ? 28 : 32,
                  color: theme.palette.text.disabled,
                  mb: 1,
                  opacity: 0.5,
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: isMobile ? "0.7rem" : "0.75rem",
                  color: theme.palette.text.disabled,
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
                    {!isMobile && (
                      <>
                        <TableCell>Strategy</TableCell>
                        <TableCell align="center">Signal</TableCell>
                        <TableCell align="right">Price</TableCell>
                      </>
                    )}
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAlerts.map((alert, i) => (
                    <TableRow
                      key={i}
                      sx={{
                        "&:hover": {
                          background: `${theme.palette.primary.main}05`,
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: isMobile ? "0.65rem" : "0.7rem",
                            color: theme.palette.text.disabled,
                          }}
                        >
                          {isMobile
                            ? formatTs(alert.timestamp).substring(0, 11)
                            : formatTs(alert.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 700,
                            fontSize: isMobile ? "0.75rem" : "0.85rem",
                            color:
                              alert.signal_type === "LONG"
                                ? theme.palette.success.main
                                : theme.palette.error.main,
                          }}
                        >
                          {alert.symbol}
                        </Typography>
                        {isMobile && (
                          <Typography
                            sx={{
                              fontSize: "0.65rem",
                              color: theme.palette.text.secondary,
                              fontFamily: '"JetBrains Mono", monospace',
                            }}
                          >
                            ₹{alert.values?.close}
                          </Typography>
                        )}
                      </TableCell>
                      {!isMobile && (
                        <>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: "0.7rem",
                                color: theme.palette.text.secondary,
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
                                fontSize: "0.8rem",
                                color: theme.palette.text.primary,
                                fontWeight: 700,
                              }}
                            >
                              ₹{alert.values?.close}
                            </Typography>
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: isMobile ? "0.68rem" : "0.72rem",
                            color: theme.palette.text.secondary,
                            fontFamily: '"Inter", sans-serif',
                          }}
                        >
                          {isMobile
                            ? alert.message.substring(0, 40) + "..."
                            : alert.message}
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
