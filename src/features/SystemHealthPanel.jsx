import React from "react";
import { Box, Card, CardContent, Typography, Chip, Tooltip, LinearProgress, Grid } from "@mui/material";
import FavoriteIcon from '@mui/icons-material/Favorite';
import SpeedIcon from '@mui/icons-material/Speed';

export default function SystemHealthPanel({ systemHealth, throughputStatus, glass }) {
    if (!systemHealth || !throughputStatus) return null;

    const { self_trust_score, self_trust_state, upstream_breaks } = systemHealth;
    const { throughput_state, expected_per_day, actual_today, multiplier } = throughputStatus;

    const getTrustColor = (state) => {
        switch (state) {
            case "TRUSTED": return "success";
            case "CAUTIOUS": return "warning";
            case "LOW_SELF_TRUST": return "error";
            default: return "default";
        }
    };

    const getThroughputColor = (state) => {
        if (!state) return "default";
        switch (state) {
            case "NOMINAL": return "success";
            case "OVER_TRADING": return "error";
            case "UNDER_TRADING": return "warning";
            default: return "default";
        }
    };

    return (
        <Card sx={{ ...glass, mb: 3 }}>
            <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FavoriteIcon fontSize="small" color={getTrustColor(self_trust_state)} />
                        System Health & Throughput
                    </Typography>
                    {upstream_breaks >= 2 && (
                        <Chip size="small" label="⚠ Critical Sensor Break" color="error" sx={{ fontWeight: "bold", fontSize: "0.6rem" }} />
                    )}
                </Box>

                <Grid container spacing={3}>
                    {/* System Self Trust */}
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.05)", border: "1px solid", borderColor: "divider" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Tooltip title="Self-Trust state degrades when recent predictions fail. A low trust state automatically makes the Gatekeeper more cowardly/conservative." arrow>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", cursor: "help", display: "flex", alignItems: "center", gap: 0.5 }}>
                                        SELF-TRUST STATE
                                    </Typography>
                                </Tooltip>
                                <Chip size="small" label={self_trust_state} color={getTrustColor(self_trust_state)} variant="outlined" sx={{ fontWeight: "bold" }} />
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 0.5 }}>
                                <Typography variant="h5" fontWeight="900" color={`${getTrustColor(self_trust_state)}.main`}>
                                    {((self_trust_score || 0) * 100).toFixed(1)}%
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>
                                    Upstream Breaks: {upstream_breaks || 0}
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={(self_trust_score || 0) * 100}
                                color={getTrustColor(self_trust_state)}
                                sx={{ height: 6, borderRadius: 3 }}
                            />
                        </Box>
                    </Grid>

                    {/* Throughput Monitor */}
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(0,0,0,0.05)", border: "1px solid", borderColor: "divider" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Tooltip title="Throughput compares how many signals have fired today vs regime expectations. Over-trading applies a harsh brake; Under-trading relaxes thresholds slightly." arrow>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold", cursor: "help", display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <SpeedIcon fontSize="small" /> THROUGHPUT
                                    </Typography>
                                </Tooltip>
                                <Chip size="small" label={(throughput_state || "UNKNOWN").replace('_', ' ')} color={getThroughputColor(throughput_state)} variant="outlined" sx={{ fontWeight: "bold" }} />
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                                <Box>
                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem", display: "block" }}>
                                        Actual / Par
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {actual_today} <Box component="span" sx={{ color: "text.secondary", fontWeight: "normal" }}>/ {expected_per_day}</Box>
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem", display: "block" }}>
                                        Score Multiplier
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold" color={(multiplier || 1.0) < 1.0 ? "warning.main" : (multiplier || 1.0) > 1.0 ? "success.main" : "text.secondary"}>
                                        {(multiplier || 1.0).toFixed(2)}x
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
