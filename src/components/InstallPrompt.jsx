import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Slide,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    GetApp as GetAppIcon,
    Close as CloseIcon,
    IosShare as IosShareIcon,
} from '@mui/icons-material';

const DISMISS_KEY = 'pwa-install-dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone === true;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [showIosHint, setShowIosHint] = useState(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        // Don't show if already installed
        if (isInStandaloneMode()) return;

        // Don't show if recently dismissed
        const dismissed = localStorage.getItem(DISMISS_KEY);
        if (dismissed && Date.now() - parseInt(dismissed, 10) < DISMISS_DURATION) return;

        // Android / Windows / Chrome / Edge
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowBanner(true);
        };
        window.addEventListener('beforeinstallprompt', handler);

        // iOS Safari hint
        if (isIos() && !isInStandaloneMode()) {
            setShowIosHint(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        setShowIosHint(false);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
    };

    // ── iOS Install Instructions ──
    if (showIosHint) {
        return (
            <Slide direction={isMobile ? 'up' : 'down'} in={showIosHint}>
                <Box
                    sx={{
                        position: 'fixed',
                        ...(isMobile
                            ? { bottom: 0, left: 0, right: 0 }
                            : { top: 0, left: 0, right: 0 }),
                        zIndex: 9999,
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(15, 20, 25, 0.97)'
                            : 'rgba(255, 255, 255, 0.97)',
                        backdropFilter: 'blur(20px)',
                        borderTop: isMobile ? `1px solid ${theme.palette.primary.main}30` : 'none',
                        borderBottom: !isMobile ? `1px solid ${theme.palette.primary.main}30` : 'none',
                        px: 2.5,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        boxShadow: isMobile
                            ? '0 -8px 32px rgba(0,0,0,0.3)'
                            : '0 8px 32px rgba(0,0,0,0.3)',
                    }}
                >
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: `${theme.palette.primary.main}15`,
                            border: `1px solid ${theme.palette.primary.main}30`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <IosShareIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            sx={{
                                fontFamily: '"JetBrains Mono", monospace',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                color: theme.palette.text.primary,
                            }}
                        >
                            Install ScannerX
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: '0.75rem',
                                color: theme.palette.text.secondary,
                                mt: 0.3,
                            }}
                        >
                            Tap <IosShareIcon sx={{ fontSize: 14, verticalAlign: 'middle', mx: 0.3 }} /> then "Add to Home Screen"
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleDismiss} sx={{ color: theme.palette.text.disabled }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Slide>
        );
    }

    // ── Standard Install Banner (Android / Windows) ──
    if (!showBanner) return null;

    return (
        <Slide direction={isMobile ? 'up' : 'down'} in={showBanner}>
            <Box
                sx={{
                    position: 'fixed',
                    ...(isMobile
                        ? { bottom: 0, left: 0, right: 0 }
                        : { top: 0, left: 0, right: 0 }),
                    zIndex: 9999,
                    background: theme.palette.mode === 'dark'
                        ? 'rgba(15, 20, 25, 0.97)'
                        : 'rgba(255, 255, 255, 0.97)',
                    backdropFilter: 'blur(20px)',
                    borderTop: isMobile ? `1px solid ${theme.palette.primary.main}30` : 'none',
                    borderBottom: !isMobile ? `1px solid ${theme.palette.primary.main}30` : 'none',
                    px: 2.5,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    boxShadow: isMobile
                        ? '0 -8px 32px rgba(0,0,0,0.3)'
                        : '0 8px 32px rgba(0,0,0,0.3)',
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.main}40)`,
                        border: `1px solid ${theme.palette.primary.main}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <GetAppIcon sx={{ color: theme.palette.primary.main, fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            color: theme.palette.text.primary,
                        }}
                    >
                        Install ScannerX
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '0.75rem',
                            color: theme.palette.text.secondary,
                            mt: 0.3,
                        }}
                    >
                        Get the full app experience — works offline!
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleInstall}
                    sx={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        letterSpacing: '0.04em',
                        px: 2,
                        py: 0.8,
                        borderRadius: 1.5,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        color: theme.palette.primary.contrastText,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: `0 4px 16px ${theme.palette.primary.main}50`,
                            transform: 'translateY(-1px)',
                        },
                        textTransform: 'none',
                        flexShrink: 0,
                    }}
                >
                    Install
                </Button>
                <IconButton size="small" onClick={handleDismiss} sx={{ color: theme.palette.text.disabled }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
        </Slide>
    );
}
