import React from "react";
import { Box, Card, CardContent, Typography, Chip, Tooltip, Grid } from "@mui/material";

export default function ContextMatrixPanel({ dayCharacter, sessionContext, expiryContext, dealerContext, liquidityContext, glass }) {
    if (!dayCharacter || !sessionContext || !expiryContext || !dealerContext) return null;

    const { day_character, primary_confidence, gap_type } = dayCharacter;
    const { session_state } = sessionContext;
    const { expiry_phase } = expiryContext;
    const { dealer_mode, gamma_pressure_score } = dealerContext;

    // Try to parse out participation data safely
    const participationInfo = liquidityContext?.participation_data;

    return (
        <Card sx={{ ...glass, mb: 3 }}>
            <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                    🧠 Structural Context Matrix
                </Typography>

                <Grid container spacing={2}>
                    {/* Day Character */}
                    <Grid item xs={6} sm={3}>
                        <Tooltip title={`Session Classification: ${day_character}\nProbability: ${((primary_confidence || 0) * 100).toFixed(1)}%\nGap Type: ${gap_type}`} placement="top" arrow>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider", height: "100%", cursor: "help" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.6rem", letterSpacing: 0.5, mb: 0.5 }}>
                                    DAY CHARACTER
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color={(day_character || "").includes("TREND") ? "success.main" : (day_character || "").includes("RANGE") ? "warning.main" : "primary.main"}>
                                    {(day_character || "UNKNOWN").replace('_', ' ')}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem", mt: 0.5, display: "block" }}>
                                    {(primary_confidence * 100).toFixed(0)}% Conf
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Grid>

                    {/* Session Phase */}
                    <Grid item xs={6} sm={3}>
                        <Tooltip title={`Current Intraday Phase: ${(session_state || "").replace(/_/g, " ")}\nChanges behavior models based on the time of day.`} placement="top" arrow>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider", height: "100%", cursor: "help" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.6rem", letterSpacing: 0.5, mb: 0.5 }}>
                                    SESSION PHASE
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="text.primary">
                                    {(session_state || "UNKNOWN").replace(/_/g, ' ')}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem", mt: 0.5, display: "block" }}>
                                    Intraday Cycle
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Grid>

                    {/* Expiry & Dealer Context */}
                    <Grid item xs={6} sm={3}>
                        <Tooltip title={`Phase: ${(expiry_phase || "").replace(/_/g, " ")}\nDealer Mode: ${dealer_mode || "N/A"}\nGamma Build Score: ${gamma_pressure_score?.toFixed(2) || "N/A"}`} placement="top" arrow>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider", height: "100%", cursor: "help", borderLeft: dealer_mode === "PINNING" ? "3px solid #f44336" : "1px solid rgba(0,0,0,0.12)" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.6rem", letterSpacing: 0.5, mb: 0.5 }}>
                                    EXPIRY & DEALER
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color={dealer_mode === "PINNING" ? "error.main" : "text.primary"}>
                                    {(expiry_phase || "UNKNOWN").replace(/_/g, ' ')}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem", mt: 0.5, display: "block" }}>
                                    Mode: {dealer_mode}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Grid>

                    {/* Liquidity Compression */}
                    <Grid item xs={6} sm={3}>
                        <Tooltip title={participationInfo ? `Accumulation Score: ${participationInfo.participation_score?.toFixed(2)}\nTrue Compression: ${participationInfo.is_true_compression ? "Yes - Breakout Valid" : "No - Exhaustion Risk"}` : "Liquidity structural tracking unavailable"} placement="top" arrow>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.04)", border: "1px solid", borderColor: "divider", height: "100%", cursor: "help", borderLeft: participationInfo?.is_true_compression ? "3px solid #4caf50" : "1px solid rgba(0,0,0,0.12)" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.6rem", letterSpacing: 0.5, mb: 0.5 }}>
                                    LIQUIDITY STATE
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color={participationInfo?.is_true_compression ? "success.main" : "text.secondary"}>
                                    {participationInfo?.is_true_compression ? "TRUE COMPRESSION" : "THIN / CHOPPY"}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem", mt: 0.5, display: "block" }}>
                                    Accumulation: {participationInfo?.participation_score ? participationInfo.participation_score.toFixed(2) : "N/A"}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
