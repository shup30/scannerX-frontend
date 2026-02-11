import React, { useState, useEffect } from "react";
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
  Tabs,
  Tab,
  IconButton,
  Collapse,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from "@mui/icons-material";
import { StatCard, MonoLabel, DirectionBadge } from "./components";
import { fmtCondition } from "./utils";

export default function ScanResultsPanel({
  scanResults,
  selectedStrategy,
  strategies,
  lastScanned,
  intradayDays,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeTab, setActiveTab] = useState(0);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (symbol) => {
    setExpandedRows((prev) => ({ ...prev, [symbol]: !prev[symbol] }));
  };

  useEffect(() => {
    if (scanResults?.summary?.total_matched > 0) {
      setActiveTab(0);
    } else {
      setActiveTab(1);
    }
  }, [scanResults]);

  if (!scanResults) return null;

  return (
    <>
      {/* Summary Stats */}
      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: 2.5 }}>
        {[
          {
            label: "Scanned",
            value: scanResults.summary.total_scanned,
            icon: <TrendingUpIcon />,
          },
          {
            label: "Matches",
            value: scanResults.summary.total_matched,
            accent: theme.palette.primary.main,
            pulse: true,
            icon: <TrendingUpIcon />,
          },
          {
            label: "Hit Rate",
            value: `${scanResults.summary.match_percentage}%`,
            accent:
              scanResults.summary.match_percentage > 20
                ? theme.palette.success.main
                : theme.palette.warning.main,
            icon: <TrendingUpIcon />,
          },
          {
            label: "Updated",
            value: lastScanned || "—",
            sub: `${intradayDays}d lookback`,
          },
        ].map((stat, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Results Card */}
      <Card>
        <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant={isMobile ? "fullWidth" : "standard"}
            sx={{
              px: isMobile ? 1 : 2,
              "& .MuiTabs-indicator": {
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                height: 3,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  {!isMobile && "MATCHES"}
                  {isMobile && "MATCH"}
                  <Chip
                    label={scanResults.summary.total_matched}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",
                      background: `${theme.palette.primary.main}20`,
                      color: theme.palette.primary.main,
                      border: `1px solid ${theme.palette.primary.main}30`,
                      fontWeight: 700,
                    }}
                  />
                </Box>
              }
            />
            <Tab label={isMobile ? "ALL" : "ALL RESULTS"} />
          </Tabs>
        </Box>

        {/* Matches Tab */}
        {activeTab === 0 &&
          (scanResults.matches.length === 0 ? (
            <Box sx={{ py: isMobile ? 5 : 7, textAlign: "center" }}>
              <CancelIcon
                sx={{
                  fontSize: isMobile ? 32 : 40,
                  color: theme.palette.text.disabled,
                  mb: 1.5,
                  opacity: 0.5,
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: isMobile ? "0.72rem" : "0.8rem",
                  color: theme.palette.text.disabled,
                }}
              >
                NO MATCHES · CONDITIONS NOT MET
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    {!isMobile && <TableCell align="right">LTP</TableCell>}
                    <TableCell>Conditions</TableCell>
                    <TableCell align="center">Signal</TableCell>
                    {!isMobile && <TableCell align="center">Time</TableCell>}
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
                        <TableRow
                          sx={{
                            "&:hover": {
                              background: `${theme.palette.primary.main}08`,
                            },
                          }}
                        >
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
                                  height: isMobile ? 24 : 32,
                                  borderRadius: 2,
                                  background: isShort
                                    ? theme.palette.error.main
                                    : theme.palette.primary.main,
                                  flexShrink: 0,
                                }}
                              />
                              <Box>
                                <Typography
                                  sx={{
                                    fontFamily: '"JetBrains Mono", monospace',
                                    fontWeight: 700,
                                    fontSize: isMobile ? "0.8rem" : "0.9rem",
                                    color: theme.palette.text.primary,
                                  }}
                                >
                                  {stock.symbol}
                                </Typography>
                                {isMobile && (
                                  <Typography
                                    sx={{
                                      fontFamily:
                                        '"JetBrains Mono", monospace',
                                      fontSize: "0.7rem",
                                      color: theme.palette.text.secondary,
                                    }}
                                  >
                                    ₹{stock.values?.close || "—"}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          {!isMobile && (
                            <TableCell align="right">
                              <Typography
                                sx={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontWeight: 700,
                                  fontSize: "0.9rem",
                                  color: theme.palette.text.primary,
                                }}
                              >
                                ₹{stock.values?.close || "—"}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.4,
                              }}
                            >
                              {Object.entries(stock.conditions || {})
                                .slice(0, isMobile ? 3 : 10)
                                .map(([key, met]) => (
                                  <Tooltip
                                    key={key}
                                    title={key.replace(/_/g, " ")}
                                  >
                                    <Chip
                                      label={fmtCondition(key)}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: "0.6rem",
                                        fontFamily:
                                          '"JetBrains Mono", monospace',
                                        fontWeight: 700,
                                        background: met
                                          ? `${theme.palette.success.main}12`
                                          : `${theme.palette.error.main}10`,
                                        color: met
                                          ? theme.palette.success.main
                                          : theme.palette.error.main,
                                        border: `1px solid ${met ? `${theme.palette.success.main}30` : `${theme.palette.error.main}25`}`,
                                        "& .MuiChip-label": {
                                          px: 0.8,
                                        },
                                      }}
                                      icon={
                                        <span
                                          style={{
                                            fontSize: "0.7rem",
                                            marginLeft: "4px",
                                          }}
                                        >
                                          {met ? "✓" : "✗"}
                                        </span>
                                      }
                                    />
                                  </Tooltip>
                                ))}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <DirectionBadge
                              signalType={
                                stock.signal_type ||
                                strategies[selectedStrategy]?.signalType
                              }
                              size="small"
                            />
                          </TableCell>
                          {!isMobile && (
                            <TableCell align="center">
                              <Typography
                                sx={{
                                  fontFamily: '"JetBrains Mono", monospace',
                                  fontSize: "0.7rem",
                                  color: theme.palette.text.disabled,
                                }}
                              >
                                {lastScanned}
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleRow(stock.symbol)}
                              sx={{
                                color: theme.palette.text.disabled,
                                "&:hover": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            >
                              {expandedRows[stock.symbol] ? (
                                <ExpandLessIcon sx={{ fontSize: 18 }} />
                              ) : (
                                <ExpandMoreIcon sx={{ fontSize: 18 }} />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Details */}
                        <TableRow>
                          <TableCell
                            colSpan={isMobile ? 4 : 6}
                            sx={{ p: 0, border: 0 }}
                          >
                            <Collapse in={expandedRows[stock.symbol]}>
                              <Box
                                sx={{
                                  px: isMobile ? 2 : 3,
                                  py: isMobile ? 2 : 2.5,
                                  background: theme.palette.background.elevated,
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                }}
                              >
                                <Grid container spacing={isMobile ? 2 : 3}>
                                  <Grid item xs={12} md={6}>
                                    <MonoLabel
                                      color={theme.palette.text.disabled}
                                      size="0.68rem"
                                    >
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
                                                py: 0.6,
                                                borderBottom: `1px solid ${theme.palette.divider}`,
                                              }}
                                            >
                                              <Typography
                                                sx={{
                                                  fontSize: "0.7rem",
                                                  color:
                                                    theme.palette.text.disabled,
                                                  fontFamily:
                                                    '"JetBrains Mono", monospace',
                                                  textTransform: "uppercase",
                                                }}
                                              >
                                                {k}
                                              </Typography>
                                              <Typography
                                                sx={{
                                                  fontSize: "0.7rem",
                                                  color:
                                                    theme.palette.primary.main,
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
                                    <MonoLabel
                                      color={theme.palette.text.disabled}
                                      size="0.68rem"
                                    >
                                      Signal Message
                                    </MonoLabel>
                                    <Typography
                                      sx={{
                                        fontSize: "0.82rem",
                                        color: theme.palette.text.secondary,
                                        fontFamily: '"Inter", sans-serif',
                                        mt: 1,
                                        lineHeight: 1.6,
                                        p: 1.5,
                                        borderRadius: 2,
                                        background: `${theme.palette.primary.main}08`,
                                        border: `1px solid ${theme.palette.divider}`,
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

        {/* All Results Tab */}
        {activeTab === 1 && (
          <TableContainer>
            <Table size={isMobile ? "small" : "medium"}>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  {!isMobile && <TableCell align="right">LTP</TableCell>}
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Conditions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scanResults.all_results.map((stock) => (
                  <TableRow
                    key={stock.symbol}
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
                          fontWeight: 700,
                          fontSize: isMobile ? "0.8rem" : "0.85rem",
                          color: stock.matched
                            ? theme.palette.primary.main
                            : theme.palette.text.disabled,
                        }}
                      >
                        {stock.symbol}
                      </Typography>
                      {isMobile && (
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.7rem",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          ₹{stock.values?.close || "—"}
                        </Typography>
                      )}
                    </TableCell>
                    {!isMobile && (
                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.8rem",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          ₹{stock.values?.close || "—"}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Chip
                        label={stock.matched ? "MATCH" : "SKIP"}
                        size="small"
                        icon={
                          <span style={{ fontSize: "0.7rem" }}>
                            {stock.matched ? "✓" : "✗"}
                          </span>
                        }
                        sx={{
                          height: 22,
                          fontSize: "0.62rem",
                          fontFamily: '"JetBrains Mono", monospace',
                          fontWeight: 700,
                          background: stock.matched
                            ? `${theme.palette.primary.main}15`
                            : `${theme.palette.text.disabled}10`,
                          color: stock.matched
                            ? theme.palette.primary.main
                            : theme.palette.text.disabled,
                          border: `1px solid ${stock.matched ? `${theme.palette.primary.main}30` : `${theme.palette.text.disabled}25`}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}
                      >
                        {Object.entries(stock.conditions || {})
                          .slice(0, isMobile ? 2 : 8)
                          .map(([key, met]) => (
                            <Chip
                              key={key}
                              label={fmtCondition(key)}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: "0.58rem",
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 600,
                                background: met
                                  ? `${theme.palette.success.main}08`
                                  : `${theme.palette.error.main}06`,
                                color: met
                                  ? theme.palette.success.main
                                  : theme.palette.error.main,
                                "& .MuiChip-label": { px: 0.6 },
                              }}
                            />
                          ))}
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
