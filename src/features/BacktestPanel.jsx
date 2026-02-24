import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import { StatCard, MonoLabel, DirectionBadge } from '../components/components';
import { formatTs } from '../utils/utils';

export default function BacktestPanel({ backtestResults }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (symbol) => {
    setExpandedRows((prev) => ({ ...prev, [symbol]: !prev[symbol] }));
  };

  if (!backtestResults) {
    return (
      <Card
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper,
        }}
      >
        <CardContent>
          <Box
            sx={{
              py: { xs: 6, md: 10 },
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: `${theme.palette.secondary.main}15`,
                border: `2px solid ${theme.palette.secondary.main}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <TimelineIcon
                sx={{ fontSize: 36, color: theme.palette.secondary.main, opacity: 0.7 }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1rem",
                fontWeight: 700,
                color: theme.palette.text.primary,
                letterSpacing: "0.04em",
              }}
            >
              NO BACKTEST RESULTS
            </Typography>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.75rem",
                color: theme.palette.text.disabled,
                maxWidth: 380,
                lineHeight: 1.7,
              }}
            >
              Select a strategy above, choose a backtest period, then click{" "}
              <strong style={{ color: theme.palette.secondary.main }}>
                RUN BACKTEST
              </strong>{" "}
              to simulate historical performance.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const agg = backtestResults.aggregate;

  return (
    <>
      {/* Aggregate Stats */}
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 2.5 }}>
        {[
          { label: "Total Signals", value: agg.total_signals },
          { label: "Total Trades", value: agg.total_trades },
          {
            label: "Win Rate",
            value: `${agg.overall_win_rate}%`,
            accent:
              agg.overall_win_rate >= 50
                ? theme.palette.success.main
                : theme.palette.error.main,
            icon:
              agg.overall_win_rate >= 50 ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              ),
          },
          {
            label: "Target Rate",
            value: `${agg.target_hit_rate}%`,
            accent: theme.palette.primary.main,
            icon: <TrendingUpIcon />,
          },
          {
            label: "Avg P&L/Trade",
            value: `${agg.avg_pnl_per_trade >= 0 ? "+" : ""}${agg.avg_pnl_per_trade}%`,
            accent:
              agg.avg_pnl_per_trade >= 0
                ? theme.palette.success.main
                : theme.palette.error.main,
            pulse: true,
            icon:
              agg.avg_pnl_per_trade >= 0 ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              ),
          },
        ].map((stat, i) => (
          <Grid item xs={6} sm={4} md key={i}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Exit Type Breakdown */}
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 2.5 }}>
        {[
          {
            label: "🎯 Target Hits",
            value: agg.total_target_hits,
            color: theme.palette.success.main,
            bg: `${theme.palette.success.main}10`,
          },
          {
            label: "🛑 Stop Losses",
            value: agg.total_stop_loss_hits,
            color: theme.palette.error.main,
            bg: `${theme.palette.error.main}10`,
          },
          {
            label: "⏱ Time Exits",
            value: agg.total_time_exits,
            color: theme.palette.warning.main,
            bg: `${theme.palette.warning.main}10`,
          },
        ].map(({ label, value, color, bg }) => (
          <Grid item xs={12} md={4} key={label}>
            <Card
              sx={{
                background: bg,
                border: `2px solid ${color}25`,
                transition: "all 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 12px 32px ${color}25`,
                },
              }}
            >
              <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
                <MonoLabel color={theme.palette.text.disabled} size="0.7rem">
                  {label}
                </MonoLabel>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: isMobile ? "1.8rem" : "2.2rem",
                    fontWeight: 800,
                    color,
                    lineHeight: 1.1,
                    mt: 0.6,
                    background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Stock-wise Results */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: isMobile ? 2 : 2.5, pt: 2, pb: 1.5 }}>
            <MonoLabel color={theme.palette.text.disabled}>
              Stock-wise Results · 1:3 Risk-Reward
            </MonoLabel>
          </Box>
          <TableContainer>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell align="center">Signals</TableCell>
                      <TableCell align="center">Trades</TableCell>
                    </>
                  )}
                  <TableCell align="center">Win Rate</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell align="center">Targets</TableCell>
                      <TableCell align="center">Stop Loss</TableCell>
                    </>
                  )}
                  <TableCell align="right">
                    {isMobile ? "P&L" : "Total P&L"}
                  </TableCell>
                  {!isMobile && <TableCell align="right">Avg P&L</TableCell>}
                  <TableCell width={40} />
                </TableRow>
              </TableHead>
              <TableBody>
                {backtestResults.results
                  .filter((r) => r.total_signals > 0)
                  .sort((a, b) => b.total_pnl_pct - a.total_pnl_pct)
                  .map((result) => (
                    <React.Fragment key={result.symbol}>
                      <TableRow
                        sx={{
                          "&:hover": {
                            background: `${theme.palette.primary.main}05`,
                          },
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography
                              sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 700,
                                fontSize: isMobile ? "0.8rem" : "0.9rem",
                                color: theme.palette.text.primary,
                              }}
                            >
                              {result.symbol}
                            </Typography>
                            {isMobile && (
                              <Typography
                                sx={{
                                  fontSize: "0.65rem",
                                  color: theme.palette.text.secondary,
                                  fontFamily: '"JetBrains Mono", monospace',
                                }}
                              >
                                {result.total_signals}s · {result.trades.length}
                                t
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell align="center">
                              <Typography
                                sx={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: "0.8rem",
                                  color: theme.palette.text.secondary,
                                }}
                              >
                                {result.total_signals}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography
                                sx={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: "0.8rem",
                                  color: theme.palette.text.secondary,
                                }}
                              >
                                {result.trades.length}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                        <TableCell align="center">
                          <Chip
                            label={`${result.win_rate}%`}
                            size="small"
                            sx={{
                              height: isMobile ? 20 : 24,
                              fontSize: isMobile ? "0.65rem" : "0.72rem",
                              fontFamily: '"JetBrains Mono", monospace',
                              fontWeight: 700,
                              background:
                                result.win_rate >= 50
                                  ? `${theme.palette.success.main}15`
                                  : `${theme.palette.error.main}15`,
                              color:
                                result.win_rate >= 50
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                              border: `1.5px solid ${result.win_rate >= 50 ? `${theme.palette.success.main}35` : `${theme.palette.error.main}35`}`,
                            }}
                          />
                        </TableCell>
                        {!isMobile && (
                          <>
                            <TableCell align="center">
                              <Typography
                                sx={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: "0.8rem",
                                  color: theme.palette.success.main,
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
                                  fontSize: "0.8rem",
                                  color: theme.palette.error.main,
                                  fontWeight: 700,
                                }}
                              >
                                {result.stop_loss_hits}
                              </Typography>
                            </TableCell>
                          </>
                        )}
                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: isMobile ? "0.8rem" : "0.9rem",
                              fontWeight: 800,
                              color:
                                result.total_pnl_pct >= 0
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                            }}
                          >
                            {result.total_pnl_pct >= 0 ? "+" : ""}
                            {result.total_pnl_pct}%
                          </Typography>
                        </TableCell>
                        {!isMobile && (
                          <TableCell align="right">
                            <Typography
                              sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontSize: "0.8rem",
                                color:
                                  result.avg_pnl_pct >= 0
                                    ? theme.palette.primary.main
                                    : theme.palette.secondary.light,
                              }}
                            >
                              {result.avg_pnl_pct >= 0 ? "+" : ""}
                              {result.avg_pnl_pct}%
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(result.symbol)}
                            sx={{
                              color: theme.palette.text.disabled,
                              "&:hover": {
                                color: theme.palette.primary.main,
                              },
                            }}
                          >
                            {expandedRows[result.symbol] ? (
                              <ExpandLessIcon sx={{ fontSize: 18 }} />
                            ) : (
                              <ExpandMoreIcon sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Trade History */}
                      <TableRow>
                        <TableCell
                          colSpan={isMobile ? 5 : 9}
                          sx={{ p: 0, border: 0 }}
                        >
                          <Collapse in={expandedRows[result.symbol]}>
                            <Box
                              sx={{
                                px: isMobile ? 2 : 3,
                                py: isMobile ? 2 : 2.5,
                                background: theme.palette.background.elevated,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                              }}
                            >
                              <MonoLabel
                                color={theme.palette.text.disabled}
                                size="0.68rem"
                                spacing="0.08em"
                              >
                                Trade History · 1:3 RR
                              </MonoLabel>
                              <TableContainer sx={{ mt: 1.5 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      {!isMobile && <TableCell>Dir</TableCell>}
                                      <TableCell>Entry</TableCell>
                                      {!isMobile && (
                                        <>
                                          <TableCell align="right">
                                            Stop
                                          </TableCell>
                                          <TableCell align="right">
                                            Target
                                          </TableCell>
                                          <TableCell>Exit Time</TableCell>
                                        </>
                                      )}
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
                                        {!isMobile && (
                                          <TableCell>
                                            <DirectionBadge
                                              signalType={trade.signal_type}
                                              size="small"
                                            />
                                          </TableCell>
                                        )}
                                        <TableCell>
                                          <Typography
                                            sx={{
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontSize: "0.7rem",
                                              color: theme.palette.text.primary,
                                            }}
                                          >
                                            ₹{trade.entry_price?.toFixed(2)}
                                          </Typography>
                                          {isMobile && (
                                            <Typography
                                              sx={{
                                                fontSize: "0.6rem",
                                                color:
                                                  theme.palette.text.disabled,
                                                fontFamily:
                                                  '"JetBrains Mono", monospace',
                                              }}
                                            >
                                              {formatTs(
                                                trade.entry_time,
                                              ).substring(0, 11)}
                                            </Typography>
                                          )}
                                        </TableCell>
                                        {!isMobile && (
                                          <>
                                            <TableCell align="right">
                                              <Typography
                                                sx={{
                                                  fontFamily:
                                                    '"JetBrains Mono", monospace',
                                                  fontSize: "0.7rem",
                                                  color:
                                                    theme.palette.error.main,
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
                                                  fontSize: "0.7rem",
                                                  color:
                                                    theme.palette.success.main,
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
                                                  color:
                                                    theme.palette.text.disabled,
                                                }}
                                              >
                                                {formatTs(trade.exit_time)}
                                              </Typography>
                                            </TableCell>
                                          </>
                                        )}
                                        <TableCell align="right">
                                          <Typography
                                            sx={{
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontSize: "0.7rem",
                                              color:
                                                theme.palette.text.secondary,
                                            }}
                                          >
                                            {trade.exit_price
                                              ? `₹${trade.exit_price.toFixed(2)}`
                                              : "—"}
                                          </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                          <Chip
                                            label={
                                              trade.exit_reason === "TARGET"
                                                ? "🎯"
                                                : trade.exit_reason ===
                                                  "STOP_LOSS"
                                                  ? "🛑"
                                                  : "⏱"
                                            }
                                            size="small"
                                            sx={{
                                              height: 22,
                                              minWidth: 28,
                                              fontSize: "0.7rem",
                                              background:
                                                trade.exit_reason === "TARGET"
                                                  ? `${theme.palette.success.main}12`
                                                  : trade.exit_reason ===
                                                    "STOP_LOSS"
                                                    ? `${theme.palette.error.main}12`
                                                    : `${theme.palette.warning.main}12`,
                                              border: `1px solid ${trade.exit_reason === "TARGET" ? `${theme.palette.success.main}30` : trade.exit_reason === "STOP_LOSS" ? `${theme.palette.error.main}30` : `${theme.palette.warning.main}30`}`,
                                            }}
                                          />
                                        </TableCell>
                                        <TableCell align="right">
                                          <Chip
                                            label={`${trade.pnl_pct >= 0 ? "+" : ""}${trade.pnl_pct}%`}
                                            size="small"
                                            sx={{
                                              height: 22,
                                              fontSize: "0.68rem",
                                              fontFamily:
                                                '"JetBrains Mono", monospace',
                                              fontWeight: 700,
                                              background:
                                                trade.pnl_pct >= 0
                                                  ? `${theme.palette.success.main}15`
                                                  : `${theme.palette.error.main}15`,
                                              color:
                                                trade.pnl_pct >= 0
                                                  ? theme.palette.success.main
                                                  : theme.palette.error.main,
                                              border: `1px solid ${trade.pnl_pct >= 0 ? `${theme.palette.success.main}35` : `${theme.palette.error.main}35`}`,
                                            }}
                                          />
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
