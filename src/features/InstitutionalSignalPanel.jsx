import React from "react";
import { Box, Card, CardContent, Typography, Grid, Chip, Tooltip, LinearProgress } from "@mui/material";

export default function InstitutionalSignalPanel({ institutionalSignal, glass }) {
    if (!institutionalSignal || !institutionalSignal.components) return null;

    const { signal, action, score, confidence, regime, setup, is_persistent, components } = institutionalSignal;

    // Interpretations based on the python model
    const actionColors = {
        "IGNORE": "default",
        "SCALP_ONLY": "warning",
        "INTRADAY": "info",
        "INSTITUTIONAL": "primary",
        "A_PLUS": "success"
    };

    const confidenceColors = {
        "LOW": "default",
        "MEDIUM": "info",
        "HIGH": "primary",
        "VERY_HIGH": "success"
    };

    const scorePct = Math.round(score * 100);
    const isBullish = signal === "LONG";
    const isBearish = signal === "SHORT";

    const mainColor = isBullish ? "success.main" : isBearish ? "error.main" : "text.secondary";
    const bgAlpha = isBullish ? "rgba(76,175,80,0.1)" : isBearish ? "rgba(244,67,54,0.1)" : "rgba(150,150,150,0.1)";

    return (
        <Card sx={{ ...glass, mb: 3 }}>
            <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Tooltip title="Production-grade AI positioning system estimating institutional bias based on Liquidity, Positioning, Momentum, Defense & Volatility" arrow>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ cursor: "help" }}>
                            🏦 Institutional Signal Analysis
                        </Typography>
                    </Tooltip>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        {is_persistent && (
                            <Tooltip title="Signal has persisted above threshold for multiple updates, increasing reliability" arrow>
                                <Chip size="small" label="⚡ PERSISTENT" color="secondary" sx={{ fontWeight: "bold" }} />
                            </Tooltip>
                        )}
                        <Chip size="small" label={action.replace("_", " ")} color={actionColors[action]} sx={{ fontWeight: "bold" }} />
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    {/* Main Score & Signal */}
                    <Grid item xs={12} sm={4}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            textAlign: "center",
                            bgcolor: bgAlpha,
                            border: "1px solid",
                            borderColor: `${mainColor}40`,
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center"
                        }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold">INSTITUTIONAL BIAS</Typography>
                            <Typography variant="h3" fontWeight="900" sx={{ color: mainColor, my: 1 }}>
                                {signal}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <Typography variant="h6" fontWeight="bold">{scorePct}%</Typography>
                                <Chip size="small" label={`${confidence} CONFIDENCE`} color={confidenceColors[confidence]} variant="outlined" sx={{ height: 20, fontSize: "0.6rem", fontWeight: "bold" }} />
                            </Box>
                        </Box>
                    </Grid>

                    {/* Context Details */}
                    <Grid item xs={12} sm={4}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "rgba(0,0,0,0.03)",
                            height: "100%"
                        }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 1 }}>MARKET CONTEXT</Typography>

                            <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>CURRENT REGIME</Typography>
                                <Typography variant="body2" fontWeight="bold">{regime.replace("_", " ")}</Typography>
                            </Box>

                            <Box sx={{ mb: 1.5 }}>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>DETECTED SETUP</Typography>
                                <Typography variant="body2" fontWeight="bold" color="primary.main">{setup.replace("_", " ")}</Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.6rem" }}>ACTIONABILITY</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {action === "IGNORE" ? "Do not trade" :
                                        action === "SCALP_ONLY" ? "Quick momentum scalps only" :
                                            action === "INTRADAY" ? "Standard intraday setups" :
                                                "Hold for larger institutional moves"}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Scoring Components Breakdown */}
                    <Grid item xs={12} sm={4}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "rgba(0,0,0,0.03)",
                            height: "100%"
                        }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ display: "block", mb: 1 }}>SCORE COMPONENTS</Typography>

                            {[
                                { name: "Liquidity", score: components.liquidity, tip: "Weight: 30% | Options OI concentration and distance to major liquidity walls" },
                                { name: "Positioning", score: components.positioning, tip: "Weight: 25% | Smart money bias derived from Price vs Total OI matrix" },
                                { name: "Momentum", score: components.momentum, tip: "Weight: 20% | Institutional momentum via VWAP, delta volume, and futures" },
                                { name: "Defense", score: components.defense, tip: "Weight: 15% | Option writer strength defending strikes (CE/PE build vs stalling price)" },
                                { name: "Volatility", score: components.volatility, tip: "Weight: 10% | Intraday ATR stability and VIX trends" }
                            ].map((comp, idx) => (
                                <Tooltip key={idx} title={comp.tip} placement="left" arrow>
                                    <Box sx={{ mb: 1, cursor: "help" }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.2 }}>
                                            <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>{comp.name}</Typography>
                                            <Typography variant="caption" fontWeight="bold" sx={{ fontSize: "0.65rem", color: comp.score >= 0.7 ? "success.main" : comp.score <= 0.3 ? "error.main" : "text.secondary" }}>
                                                {Math.round(comp.score * 100)}%
                                            </Typography>
                                        </Box>
                                        <Box sx={{ position: "relative", height: 6, bgcolor: "divider", borderRadius: 3, overflow: "hidden" }}>
                                            <Box sx={{
                                                position: "absolute",
                                                left: 0,
                                                top: 0,
                                                height: "100%",
                                                width: `${Math.round(comp.score * 100)}%`,
                                                bgcolor: comp.score >= 0.7 ? "success.main" : comp.score >= 0.4 ? "info.main" : "warning.main",
                                                borderRadius: 3
                                            }} />
                                        </Box>
                                    </Box>
                                </Tooltip>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
