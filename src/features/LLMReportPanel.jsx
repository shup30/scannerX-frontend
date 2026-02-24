import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    LinearProgress,
    Rating,
    useTheme,
    Chip
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function LLMReportPanel({ llmReport, isEnabled, loading, glass }) {
    const theme = useTheme();

    if (!isEnabled) {
        return (
            <Card sx={{ ...glass, mb: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary">
                        AI Report disabled
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        Toggle "AI Report" in the top header to enable AI-powered analysis.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    if (loading || (isEnabled && !llmReport)) {
        return (
            <Card sx={{ ...glass, mb: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        Generating AI Trading Report...
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                        This may take 10-20 seconds.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    if (!llmReport.is_valid || llmReport.error_message) {
        return (
            <Card sx={{ ...glass, mb: 3 }}>
                <CardContent>
                    <Alert severity="warning" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight="bold">
                            AI Report Generation Failed
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {llmReport.error_message || "Unknown error occurred while generating the report."}
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const {
        executive_summary,
        technical_structure,
        key_driver,
        actionable_advice,
        bullish_probability_pct,
        bearish_probability_pct,
        confluence_rating
    } = llmReport;

    const getConfluenceColor = (rating) => {
        if (rating >= 8) return theme.palette.success.main;
        if (rating >= 5) return theme.palette.warning.main;
        return theme.palette.error.main;
    };

    return (
        <Card sx={{ ...glass, mb: 3, border: `1px solid ${theme.palette.primary.main}40` }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                    <AutoAwesomeIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ textTransform: 'capitalize' }}>
                        {llmReport.provider_used || "AI"} Global Analysis
                    </Typography>
                    <Chip size="small" label="BETA" sx={{ height: 16, fontSize: '0.6rem', ml: 1, backgroundColor: 'rgba(0,176,255,0.1)', color: '#00b0ff' }} />
                </Box>

                <Grid container spacing={2}>
                    {/* Card 1: Executive Summary */}
                    <Grid item xs={12}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" gutterBottom display="block">
                                EXECUTIVE SUMMARY
                            </Typography>
                            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                {executive_summary}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Card 2: Technical Structure */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" gutterBottom display="block">
                                TECHNICAL STRUCTURE
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {technical_structure}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Card 3: Key Driver */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" gutterBottom display="block">
                                MARKET KEY DRIVER
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                                {key_driver}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Card 4: Actionable Advice */}
                    <Grid item xs={12}>
                        <Box sx={{
                            p: 2,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.secondary.main}08)`,
                            border: '1px solid',
                            borderColor: `${theme.palette.primary.main}30`
                        }}>
                            <Typography variant="caption" color="primary.main" fontWeight="bold" gutterBottom display="block">
                                ACTIONABLE ADVICE
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                                {actionable_advice}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Card 5: Probabilities */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" gutterBottom display="block">
                                DIRECTIONAL PROBABILITY
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="success.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5 }} /> BULLISH
                                    </Typography>
                                    <Typography variant="caption" color="error.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                                        BEARISH <TrendingDownIcon sx={{ fontSize: 14, ml: 0.5 }} />
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden' }}>
                                    <Box sx={{ width: `${bullish_probability_pct}%`, bgcolor: 'success.main' }} />
                                    <Box sx={{ width: `${bearish_probability_pct}%`, bgcolor: 'error.main' }} />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                    <Typography variant="body2" fontWeight="bold">{bullish_probability_pct}%</Typography>
                                    <Typography variant="body2" fontWeight="bold">{bearish_probability_pct}%</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Card 6: Confluence Rating */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" gutterBottom display="block">
                                CONFLUENCE RATING
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                                <Typography variant="h3" fontWeight="900" sx={{ color: getConfluenceColor(confluence_rating) }}>
                                    {confluence_rating}
                                    <Typography component="span" variant="h6" color="text.secondary">/10</Typography>
                                </Typography>
                                <Rating
                                    value={confluence_rating / 2}
                                    precision={0.5}
                                    readOnly
                                    sx={{ color: getConfluenceColor(confluence_rating) }}
                                />
                            </Box>
                        </Box>
                    </Grid>

                </Grid>
            </CardContent>
        </Card>
    );
}
