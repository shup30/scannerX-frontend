import React from "react";
import { Box, Typography, IconButton, Slide, useTheme, useMediaQuery } from "@mui/material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import { formatTs } from "./utils";

export default function AlertToast({ alert, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!alert) return null;

  const isLong = alert.signal_type === "LONG";

  return (
    <Slide direction="left" in={!!alert} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          bottom: isMobile ? 80 : 24,
          right: isMobile ? 12 : 24,
          left: isMobile ? 12 : "auto",
          zIndex: 9999,
          minWidth: isMobile ? "auto" : 320,
          maxWidth: isMobile ? "100%" : 380,
          background: isLong
            ? theme.palette.mode === "dark"
              ? "rgba(0,20,15,0.98)"
              : "rgba(240,255,248,0.98)"
            : theme.palette.mode === "dark"
              ? "rgba(20,4,8,0.98)"
              : "rgba(255,240,245,0.98)",
          border: `2px solid ${isLong ? theme.palette.success.main + "70" : theme.palette.error.main + "70"}`,
          borderLeft: `4px solid ${isLong ? theme.palette.success.main : theme.palette.error.main}`,
          borderRadius: 3,
          p: isMobile ? 1.5 : 2,
          boxShadow: isLong
            ? `0 16px 48px ${theme.palette.success.main}35`
            : `0 16px 48px ${theme.palette.error.main}35`,
          backdropFilter: "blur(24px) saturate(180%)",
          animation: "slideInBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          "@keyframes slideInBounce": {
            "0%": {
              transform: "translateX(100%) scale(0.8)",
              opacity: 0,
            },
            "60%": {
              transform: "translateX(-10px) scale(1.05)",
              opacity: 1,
            },
            "100%": {
              transform: "translateX(0) scale(1)",
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 0.8,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: isLong
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                boxShadow: `0 0 12px ${isLong ? theme.palette.success.main : theme.palette.error.main}`,
                animation: "blink 1.2s infinite",
                "@keyframes blink": {
                  "0%,100%": { opacity: 1, transform: "scale(1)" },
                  "50%": { opacity: 0.3, transform: "scale(0.9)" },
                },
              }}
            />
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: isMobile ? "0.68rem" : "0.72rem",
                color: theme.palette.text.secondary,
                letterSpacing: "0.12em",
              }}
            >
              🔔 NEW SIGNAL
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: theme.palette.text.disabled,
              p: 0.3,
              ml: 1,
              "&:hover": {
                color: theme.palette.text.primary,
                background: theme.palette.action.hover,
              },
            }}
          >
            <CancelIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Typography
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 800,
            fontSize: isMobile ? "1.2rem" : "1.4rem",
            color: isLong
              ? theme.palette.success.main
              : theme.palette.error.main,
            mb: 0.5,
            letterSpacing: "-0.02em",
            textShadow: `0 2px 8px ${isLong ? theme.palette.success.main : theme.palette.error.main}30`,
          }}
        >
          {isLong ? "▲" : "▼"} {alert.symbol}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            mb: 0.8,
          }}
        >
          <Typography
            sx={{
              fontSize: isMobile ? "0.7rem" : "0.75rem",
              color: theme.palette.text.secondary,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            {alert.strategy_key?.replace(/-/g, " ")}
          </Typography>
          <Box
            sx={{
              px: 1,
              py: 0.3,
              borderRadius: 1.5,
              background: `${isLong ? theme.palette.success.main : theme.palette.error.main}20`,
              border: `1px solid ${isLong ? theme.palette.success.main : theme.palette.error.main}40`,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "0.75rem",
                fontWeight: 700,
                color: isLong
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              }}
            >
              ₹{alert.values?.close}
            </Typography>
          </Box>
        </Box>

        <Typography
          sx={{
            fontSize: "0.68rem",
            color: theme.palette.text.disabled,
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          {formatTs(alert.timestamp)}
        </Typography>
      </Box>
    </Slide>
  );
}
