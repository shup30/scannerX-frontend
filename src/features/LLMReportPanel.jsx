import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    CircularProgress,
    Alert,
    useTheme,
    Chip,
    Divider,
    Tooltip,
    Collapse,
    IconButton,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import LayersIcon from '@mui/icons-material/Layers';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BlockIcon from '@mui/icons-material/Block';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Render a newline-separated bullet string as individual <li> elements */
function BulletList({ text, color }) {
    const theme = useTheme();
    if (!text) return null;
    const lines = text
        .split('\n')
        .map(l => l.replace(/^[•\-*]\s*/, '').trim())
        .filter(Boolean);
    return (
        <Box component="ul" sx={{ m: 0, pl: 2, listStyle: 'none' }}>
            {lines.map((line, i) => (
                <Box
                    component="li"
                    key={i}
                    sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        mb: 0.75,
                        '&:last-child': { mb: 0 },
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            mt: '5px',
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: color || theme.palette.primary.main,
                            flexShrink: 0,
                        }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '0.83rem', lineHeight: 1.55 }}>
                        {line}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

function SectionCard({ icon, label, labelColor, children, sx = {}, accent }) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(0,0,0,0.03)',
                border: '1px solid',
                borderColor: accent
                    ? `${accent}40`
                    : theme.palette.divider,
                borderLeft: accent ? `3px solid ${accent}` : undefined,
                height: '100%',
                ...sx,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                {icon &&
                    React.cloneElement(icon, {
                        sx: { fontSize: 14, color: labelColor || 'text.secondary' },
                    })}
                <Typography
                    variant="caption"
                    fontWeight="700"
                    sx={{
                        letterSpacing: '0.08em',
                        color: labelColor || 'text.secondary',
                        textTransform: 'uppercase',
                    }}
                >
                    {label}
                </Typography>
            </Box>
            {children}
        </Box>
    );
}

function getConfluenceColor(rating, theme) {
    if (rating >= 7.5) return theme.palette.success.main;
    if (rating >= 5) return theme.palette.warning.main;
    return theme.palette.error.main;
}

function HealthBadge({ note }) {
    const theme = useTheme();
    if (!note) return null;
    const isLowTrust = /low.self.trust|low_self_trust|degraded|out of sync/i.test(note);
    const isCautious = /cautious/i.test(note);
    const color = isLowTrust
        ? theme.palette.error.main
        : isCautious
            ? theme.palette.warning.main
            : theme.palette.success.main;
    const label = isLowTrust ? 'LOW SELF-TRUST' : isCautious ? 'CAUTIOUS' : 'TRUSTED';
    return (
        <Chip
            size="small"
            label={label}
            sx={{
                height: 18,
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                bgcolor: `${color}18`,
                color,
                border: `1px solid ${color}50`,
            }}
        />
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LLMReportPanel({ llmReport, isEnabled, loading, glass }) {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(true);

    // ── Disabled state ────────────────────────────────────────────────
    if (!isEnabled) {
        return (
            <Card sx={{ ...glass, mb: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.4 }} />
                    <Typography variant="h6" color="text.secondary">
                        AI Trade Interpreter disabled
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                        Toggle "AI Report" in the header to enable actionable signal interpretation.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    // ── Loading state ─────────────────────────────────────────────────
    if (loading || (isEnabled && !llmReport)) {
        return (
            <Card sx={{ ...glass, mb: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={36} sx={{ mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                        Interpreting system signals…
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                        Analysing all 11 modules. Usually 10–20 seconds.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    // ── Error state ───────────────────────────────────────────────────
    if (!llmReport?.is_valid || llmReport?.error_message) {
        return (
            <Card sx={{ ...glass, mb: 3 }}>
                <CardContent>
                    <Alert severity="warning">
                        <Typography variant="body2" fontWeight="bold">
                            AI Interpretation Failed
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {llmReport?.error_message || 'Unknown error during report generation.'}
                        </Typography>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const {
        executive_summary,
        system_state_interpretation,
        trade_setup,
        invalidation_conditions,
        key_levels,
        session_expiry_context,
        system_health_note,
        bullish_probability_pct,
        bearish_probability_pct,
        confluence_rating,
        provider_used,
    } = llmReport;

    const confColor = getConfluenceColor(confluence_rating, theme);

    // Determine headline action chip from trade_setup text
    const isWait = /wait|no setup|no trade|flat/i.test(trade_setup);
    const isLong = /long|bullish entry|buy/i.test(trade_setup) && !isWait;
    const isShort = /short|bearish entry|sell/i.test(trade_setup) && !isWait;
    const actionColor = isWait
        ? theme.palette.warning.main
        : isLong
            ? theme.palette.success.main
            : isShort
                ? theme.palette.error.main
                : theme.palette.info.main;
    const actionLabel = isWait ? 'WAIT' : isLong ? 'LONG SETUP' : isShort ? 'SHORT SETUP' : 'SIGNAL';

    return (
        <Card
            sx={{
                ...glass,
                mb: 3,
                border: `1px solid ${theme.palette.primary.main}30`,
                overflow: 'visible',
            }}
        >
            <CardContent sx={{ pb: '12px !important' }}>

                {/* ── Header row ── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesomeIcon color="primary" sx={{ fontSize: 18 }} />
                        <Typography variant="subtitle1" fontWeight="700" color="primary.main">
                            AI Trade Interpreter
                        </Typography>
                        <Chip
                            size="small"
                            label={actionLabel}
                            sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                bgcolor: `${actionColor}18`,
                                color: actionColor,
                                border: `1px solid ${actionColor}50`,
                            }}
                        />
                        <HealthBadge note={system_health_note} />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem' }}>
                            via {provider_used}
                        </Typography>
                        <IconButton size="small" onClick={() => setExpanded(v => !v)}>
                            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </IconButton>
                    </Box>
                </Box>

                {/* ── Executive summary (always visible) ── */}
                <Box
                    sx={{
                        p: 1.75,
                        mb: 2,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}0A, ${theme.palette.secondary.main}08)`,
                        border: `1px solid ${theme.palette.primary.main}25`,
                    }}
                >
                    <Typography variant="body2" sx={{ lineHeight: 1.65, fontWeight: 500 }}>
                        {executive_summary}
                    </Typography>
                </Box>

                <Collapse in={expanded}>
                    <Grid container spacing={1.5}>

                        {/* ── Row 1: System state + Trade setup ── */}
                        <Grid item xs={12} md={6}>
                            <SectionCard
                                icon={<LayersIcon />}
                                label="What the System is Detecting"
                                labelColor={theme.palette.info.main}
                                accent={theme.palette.info.main}
                                sx={{ minHeight: 140 }}
                            >
                                <Typography variant="body2" sx={{ fontSize: '0.83rem', lineHeight: 1.6 }}>
                                    {system_state_interpretation}
                                </Typography>
                            </SectionCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <SectionCard
                                icon={<TrackChangesIcon />}
                                label="Trade Setup — How to Act"
                                labelColor={actionColor}
                                accent={actionColor}
                                sx={{ minHeight: 140 }}
                            >
                                <Typography variant="body2" sx={{ fontSize: '0.83rem', lineHeight: 1.6 }}>
                                    {trade_setup}
                                </Typography>
                            </SectionCard>
                        </Grid>

                        {/* ── Row 2: Invalidation + Key levels ── */}
                        <Grid item xs={12} md={6}>
                            <SectionCard
                                icon={<BlockIcon />}
                                label="Setup Invalidation — Exit If…"
                                labelColor={theme.palette.error.main}
                                accent={theme.palette.error.main}
                            >
                                <BulletList
                                    text={invalidation_conditions}
                                    color={theme.palette.error.main}
                                />
                            </SectionCard>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <SectionCard
                                icon={<LayersIcon />}
                                label="Key Levels"
                                labelColor={theme.palette.warning.main}
                                accent={theme.palette.warning.main}
                            >
                                <BulletList
                                    text={key_levels}
                                    color={theme.palette.warning.main}
                                />
                            </SectionCard>
                        </Grid>

                        {/* ── Row 3: Session/Expiry + System health ── */}
                        <Grid item xs={12} md={8}>
                            <SectionCard
                                icon={<AccessTimeIcon />}
                                label="Session & Expiry — How This Changes Your Plan"
                                labelColor={theme.palette.secondary.main}
                                accent={theme.palette.secondary.main}
                            >
                                <Typography variant="body2" sx={{ fontSize: '0.83rem', lineHeight: 1.6 }}>
                                    {session_expiry_context}
                                </Typography>
                            </SectionCard>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <SectionCard
                                icon={<MonitorHeartIcon />}
                                label="System Health"
                                labelColor={
                                    /low.self.trust/i.test(system_health_note || '')
                                        ? theme.palette.error.main
                                        : /cautious/i.test(system_health_note || '')
                                            ? theme.palette.warning.main
                                            : theme.palette.success.main
                                }
                            >
                                <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                                    {system_health_note}
                                </Typography>
                            </SectionCard>
                        </Grid>

                        {/* ── Row 4: Probability bar + Confluence score ── */}
                        <Grid item xs={12} md={7}>
                            <SectionCard label="Directional Probability" icon={<TrendingUpIcon />}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography
                                        variant="caption"
                                        fontWeight="700"
                                        sx={{ color: theme.palette.success.main, display: 'flex', alignItems: 'center', gap: 0.3 }}
                                    >
                                        <TrendingUpIcon sx={{ fontSize: 13 }} /> BULLISH
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        fontWeight="700"
                                        sx={{ color: theme.palette.error.main, display: 'flex', alignItems: 'center', gap: 0.3 }}
                                    >
                                        BEARISH <TrendingDownIcon sx={{ fontSize: 13 }} />
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)' }}>
                                    <Tooltip title={`Bullish: ${bullish_probability_pct}%`}>
                                        <Box
                                            sx={{
                                                width: `${bullish_probability_pct}%`,
                                                bgcolor: theme.palette.success.main,
                                                transition: 'width 0.6s ease',
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title={`Bearish: ${bearish_probability_pct}%`}>
                                        <Box
                                            sx={{
                                                width: `${bearish_probability_pct}%`,
                                                bgcolor: theme.palette.error.main,
                                                transition: 'width 0.6s ease',
                                            }}
                                        />
                                    </Tooltip>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                    <Typography variant="body2" fontWeight="700" color="success.main">
                                        {bullish_probability_pct}%
                                    </Typography>
                                    <Typography variant="body2" fontWeight="700" color="error.main">
                                        {bearish_probability_pct}%
                                    </Typography>
                                </Box>
                            </SectionCard>
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <SectionCard label="Module Confluence" icon={<AutoAwesomeIcon />}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        mt: 0.5,
                                    }}
                                >
                                    <Typography
                                        variant="h3"
                                        fontWeight="900"
                                        sx={{ color: confColor, lineHeight: 1 }}
                                    >
                                        {typeof confluence_rating === 'number'
                                            ? confluence_rating.toFixed(1)
                                            : confluence_rating}
                                        <Typography component="span" variant="h6" color="text.secondary">
                                            /10
                                        </Typography>
                                    </Typography>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {confluence_rating >= 7.5
                                                ? 'Strong alignment'
                                                : confluence_rating >= 5
                                                    ? 'Moderate alignment'
                                                    : 'Weak / conflicted'}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled">
                                            {confluence_rating >= 7.5
                                                ? 'Most modules agree — higher conviction'
                                                : confluence_rating >= 5
                                                    ? 'Partial agreement — reduce size'
                                                    : 'Modules disagree — stay flat'}
                                        </Typography>
                                    </Box>
                                </Box>
                                {/* Mini bar */}
                                <Box
                                    sx={{
                                        mt: 1.5,
                                        height: 5,
                                        borderRadius: 3,
                                        bgcolor: 'rgba(0,0,0,0.08)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: '100%',
                                            width: `${(confluence_rating / 10) * 100}%`,
                                            bgcolor: confColor,
                                            borderRadius: 3,
                                            transition: 'width 0.6s ease',
                                        }}
                                    />
                                </Box>
                            </SectionCard>
                        </Grid>

                    </Grid>
                </Collapse>
            </CardContent>
        </Card>
    );
}
