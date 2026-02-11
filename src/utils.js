// localStorage utilities for backtest results
export const STORAGE_KEY = "scanner_backtest_results";

export const saveBacktestResults = (strategyKey, results) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    stored[strategyKey] = {
      ...results,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error("Failed to save backtest results:", error);
  }
};

export const getBacktestResults = (strategyKey) => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return stored[strategyKey] || null;
  } catch (error) {
    console.error("Failed to get backtest results:", error);
    return null;
  }
};

export const getAllBacktestResults = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (error) {
    console.error("Failed to get all backtest results:", error);
    return {};
  }
};

export const clearBacktestResults = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear backtest results:", error);
  }
};

// Format timestamp
export const formatTs = (val) => {
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

// Format time ago
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Format condition labels
export const CONDITION_LABELS = {
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

export const fmtCondition = (key) => {
  const base = key.replace(/_\d+$/, "").replace(/_bonus$/, "");
  return CONDITION_LABELS[base] || base.replace(/_/g, " ").toUpperCase();
};
