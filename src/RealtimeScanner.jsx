import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Chip,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
  Badge,
  Paper,
  Divider,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  NotificationsActive as BellIcon,
  Telegram as TelegramIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  SignalCellularAlt as SignalIcon,
} from "@mui/icons-material";

/**
 * Real-time Scanner Component
 * Enables automatic scanning with web and Telegram alerts
 */
export default function RealtimeScanner({ 
  API_BASE_URL, 
  selectedStrategy, 
  selectedStockList,
  strategies 
}) {
  const [isActive, setIsActive] = useState(false);
  const [scanMode, setScanMode] = useState("auto_interval");
  const [intervalSeconds, setIntervalSeconds] = useState(300); // 5 minutes
  const [alertCooldown, setAlertCooldown] = useState(1800); // 30 minutes
  
  const [activeScans, setActiveScans] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [stats, setStats] = useState({});
  
  const [wsConnected, setWsConnected] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [alerts, setAlerts] = useState([]);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const wsRef = useRef(null);
  const audioRef = useRef(null);

  // WebSocket connection
  useEffect(() => {
    connectWebSocket();
    
    // Fetch initial state
    fetchActiveScans();
    fetchStats();
    fetchRecentMatches();
    testTelegram();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Periodic refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveScans();
      fetchStats();
      fetchRecentMatches();
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const connectWebSocket = () => {
    const wsUrl = API_BASE_URL.replace("http", "ws") + "/ws";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setWsConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket closed, reconnecting...");
      setWsConnected(false);
      setTimeout(connectWebSocket, 3000);
    };

    wsRef.current = ws;

    // Keep-alive ping
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case "new_alert":
        // New alert received!
        handleNewAlert(data);
        break;
        
      case "scan_complete":
        console.log("Scan complete:", data);
        fetchStats();
        break;
        
      default:
        console.log("Unknown message type:", data);
    }
  };

  const handleNewAlert = (alert) => {
    // Add to alerts list
    setAlerts((prev) => [alert, ...prev].slice(0, 50));
    
    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`🚨 ${alert.signal_type} Signal`, {
        body: `${alert.symbol} - ${alert.strategy}`,
        icon: "/logo.png",
      });
    }
    
    // Play sound
    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.error("Audio play error:", e));
    }
    
    // Fetch updated data
    fetchRecentMatches();
    fetchStats();
  };

  const fetchActiveScans = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/realtime/active`);
      const data = await res.json();
      if (data.success) {
        setActiveScans(data.active_scans);
        
        // Check if current strategy is active
        const scanId = `${selectedStrategy}_${selectedStockList}`;
        const isRunning = data.active_scans.some(
          (s) => s.scan_id === scanId && s.is_running
        );
        setIsActive(isRunning);
      }
    } catch (err) {
      console.error("Error fetching active scans:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/realtime/stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchRecentMatches = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/realtime/recent-matches?limit=20&strategy=${selectedStrategy || ""}`
      );
      const data = await res.json();
      if (data.success) {
        setRecentMatches(data.matches);
      }
    } catch (err) {
      console.error("Error fetching recent matches:", err);
    }
  };

  const testTelegram = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/realtime/test-telegram`, {
        method: "POST",
      });
      const data = await res.json();
      setTelegramEnabled(data.success);
    } catch (err) {
      setTelegramEnabled(false);
    }
  };

  const startScan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/realtime/start?` +
          `strategy=${selectedStrategy}&` +
          `stock_list=${selectedStockList}&` +
          `scan_mode=${scanMode}&` +
          `interval_seconds=${intervalSeconds}&` +
          `alert_cooldown=${alertCooldown}`,
        { method: "POST" }
      );
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      if (data.success) {
        setIsActive(true);
        fetchActiveScans();
        
        // Request notification permission
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopScan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const scanId = `${selectedStrategy}_${selectedStockList}`;
      const res = await fetch(
        `${API_BASE_URL}/api/realtime/stop/${scanId}`,
        { method: "POST" }
      );
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      
      if (data.success) {
        setIsActive(false);
        fetchActiveScans();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <Box>
      {/* Hidden audio for alert sound */}
      <audio ref={audioRef} src="/alert.mp3" preload="auto" />

      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isActive
                    ? "linear-gradient(135deg, #00e676, #00d4aa)"
                    : "rgba(100,116,139,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: isActive ? "pulse 2s infinite" : "none",
                  "@keyframes pulse": {
                    "0%,100%": { opacity: 1 },
                    "50%": { opacity: 0.6 },
                  },
                }}
              >
                <SignalIcon sx={{ color: isActive ? "#001a14" : "#64748b", fontSize: 20 }} />
              </Box>
              
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "#e2e8f0",
                  }}
                >
                  REAL-TIME SCANNER
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.65rem",
                    color: isActive ? "#00e676" : "#64748b",
                  }}
                >
                  {isActive ? "● ACTIVE" : "○ IDLE"}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {/* WebSocket status */}
              <Tooltip title={wsConnected ? "WebSocket Connected" : "WebSocket Disconnected"}>
                <Chip
                  size="small"
                  label={wsConnected ? "LIVE" : "OFFLINE"}
                  color={wsConnected ? "success" : "error"}
                  icon={wsConnected ? <CheckIcon /> : <CancelIcon />}
                  sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.65rem" }}
                />
              </Tooltip>

              {/* Telegram status */}
              <Tooltip title={telegramEnabled ? "Telegram Alerts Enabled" : "Telegram Not Configured"}>
                <Chip
                  size="small"
                  label={telegramEnabled ? "TELEGRAM" : "NO TELEGRAM"}
                  color={telegramEnabled ? "primary" : "default"}
                  icon={<TelegramIcon />}
                  sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.65rem" }}
                />
              </Tooltip>

              <IconButton size="small" onClick={fetchActiveScans}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Configuration */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={scanMode === "auto_continuous"}
                    onChange={(e) =>
                      setScanMode(e.target.checked ? "auto_continuous" : "auto_interval")
                    }
                    disabled={isActive}
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                      Continuous Mode
                    </Typography>
                    <Typography sx={{ fontSize: "0.65rem", color: "#64748b" }}>
                      Scan every 30 seconds (faster, more alerts)
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {scanMode === "auto_interval" && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Scan Interval (seconds)"
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(parseInt(e.target.value) || 300)}
                  disabled={isActive}
                  helperText="How often to scan (min: 60s)"
                  InputProps={{ inputProps: { min: 60, step: 60 } }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Alert Cooldown (seconds)"
                value={alertCooldown}
                onChange={(e) => setAlertCooldown(parseInt(e.target.value) || 1800)}
                disabled={isActive}
                helperText="Min time between alerts per symbol"
                InputProps={{ inputProps: { min: 300, step: 300 } }}
              />
            </Grid>
          </Grid>

          {/* Control Buttons */}
          <Box sx={{ display: "flex", gap: 2 }}>
            {!isActive ? (
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={startScan}
                disabled={loading || !selectedStrategy}
                startIcon={loading ? <RefreshIcon /> : <PlayIcon />}
                sx={{
                  background: "linear-gradient(135deg, #00e676, #00d4aa)",
                  color: "#001a14",
                  fontWeight: 700,
                  "&:hover": {
                    background: "linear-gradient(135deg, #00ff88, #00e6bb)",
                  },
                }}
              >
                {loading ? "STARTING..." : "START REAL-TIME SCAN"}
              </Button>
            ) : (
              <Button
                fullWidth
                variant="contained"
                color="error"
                size="large"
                onClick={stopScan}
                disabled={loading}
                startIcon={<StopIcon />}
                sx={{ fontWeight: 700 }}
              >
                {loading ? "STOPPING..." : "STOP SCAN"}
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mb: 0.5 }}>
                TOTAL SCANS
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: "#00d4aa",
                }}
              >
                {stats.total_scans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mb: 0.5 }}>
                MATCHES
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: "#00e676",
                }}
              >
                {stats.total_matches || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mb: 0.5 }}>
                ALERTS SENT
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: "#ffab00",
                }}
              >
                {stats.total_alerts_sent || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography sx={{ fontSize: "0.7rem", color: "#64748b", mb: 0.5 }}>
                ACTIVE SCANS
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: "#00b0ff",
                }}
              >
                {stats.active_scans || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <BellIcon sx={{ color: "#ff4d6d", fontSize: 18 }} />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: "#e2e8f0",
                }}
              >
                LIVE ALERTS
              </Typography>
              <Chip
                label={alerts.length}
                size="small"
                sx={{
                  background: "#ff4d6d22",
                  color: "#ff4d6d",
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: "0.65rem",
                }}
              />
            </Box>

            <Stack spacing={1}>
              {alerts.slice(0, 5).map((alert, idx) => (
                <Paper
                  key={idx}
                  sx={{
                    p: 1.5,
                    background:
                      alert.signal_type === "LONG"
                        ? "rgba(0,230,118,0.05)"
                        : "rgba(255,23,68,0.05)",
                    border: `1px solid ${alert.signal_type === "LONG" ? "#00e67622" : "#ff174422"}`,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: '"JetBrains Mono", monospace',
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: alert.signal_type === "LONG" ? "#00e676" : "#ff4444",
                        }}
                      >
                        {alert.signal_type === "LONG" ? "🟢" : "🔴"} {alert.symbol}
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                        {alert.strategy} • ₹{alert.values?.close}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        color: "#64748b",
                        fontFamily: '"JetBrains Mono", monospace',
                      }}
                    >
                      {formatTimestamp(alert.timestamp)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Recent Matches Table */}
      <Card>
        <CardContent>
          <Typography
            sx={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 700,
              fontSize: "0.8rem",
              color: "#64748b",
              mb: 2,
            }}
          >
            RECENT MATCHES
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>TIME</TableCell>
                  <TableCell>SYMBOL</TableCell>
                  <TableCell>SIGNAL</TableCell>
                  <TableCell align="right">PRICE</TableCell>
                  <TableCell>MESSAGE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentMatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#64748b" }}>
                      No recent matches
                    </TableCell>
                  </TableRow>
                ) : (
                  recentMatches.map((match, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography
                          sx={{
                            fontSize: "0.7rem",
                            color: "#64748b",
                            fontFamily: '"JetBrains Mono", monospace',
                          }}
                        >
                          {formatTimestamp(match.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 700,
                            fontSize: "0.8rem",
                          }}
                        >
                          {match.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={match.signal_type}
                          size="small"
                          color={match.signal_type === "LONG" ? "success" : "error"}
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.65rem",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.8rem",
                          }}
                        >
                          ₹{match.values?.close}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                          {match.message}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
