import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { MonoLabel, DirectionBadge, CategoryBadge } from "./components";

export default function StrategyInfoDialog({
  open,
  onClose,
  stratKey,
  strategy,
  intradayDays,
  mainTab,
  getIcon,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!strategy) return null;

  const isShort = strategy.signalType === "SHORT";
  const ac = isShort ? theme.palette.error.main : theme.palette.primary.main;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.5, pt: isMobile ? 2.5 : 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              background: `${ac}18`,
              border: `2px solid ${ac}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: ac,
              "& svg": { fontSize: 22 },
            }}
          >
            {getIcon(strategy.icon)}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                fontSize: isMobile ? "0.9rem" : "1rem",
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              {strategy.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <DirectionBadge signalType={strategy.signalType} size="small" />
              <CategoryBadge category={strategy.category} size="small" />
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography
          sx={{
            fontSize: "0.85rem",
            color: theme.palette.text.secondary,
            fontFamily: '"Inter", sans-serif',
            mb: 3,
            lineHeight: 1.7,
            p: 2,
            borderRadius: 2,
            background: theme.palette.background.elevated,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {strategy.description}
        </Typography>

        <MonoLabel
          color={theme.palette.text.disabled}
          size="0.68rem"
          spacing="0.1em"
        >
          Entry Conditions
        </MonoLabel>
        <Stack spacing={1} sx={{ mt: 1.5, mb: 3 }}>
          {(strategy.conditions || []).map((c, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                p: 1.5,
                borderRadius: 2,
                background: `${ac}08`,
                border: `1.5px solid ${ac}20`,
                transition: "all 0.2s",
                "&:hover": {
                  background: `${ac}12`,
                  borderColor: `${ac}35`,
                  transform: "translateX(4px)",
                },
              }}
            >
              <CheckCircleIcon
                sx={{
                  fontSize: 16,
                  color: ac,
                  flexShrink: 0,
                  filter: `drop-shadow(0 2px 4px ${ac}40)`,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontFamily: '"JetBrains Mono", monospace',
                  color: theme.palette.text.secondary,
                  lineHeight: 1.5,
                }}
              >
                {c}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: theme.palette.background.elevated,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <MonoLabel
            color={theme.palette.text.disabled}
            size="0.68rem"
            spacing="0.08em"
          >
            Scanner Configuration
          </MonoLabel>
          <Box sx={{ mt: 1.5 }}>
            {[
              ["Data Source", "5-minute intraday candles"],
              [
                "Lookback Period",
                `${intradayDays} day${intradayDays > 1 ? "s" : ""} (~${intradayDays * 75} candles)`,
              ],
              [
                "Scan Mode",
                mainTab === 0
                  ? "Live Scanner"
                  : mainTab === 1
                    ? "1:3 R:R Backtest"
                    : "Auto-Scan + Alerts",
              ],
              ["Max Hold Time", "50 candles (~4 hours)"],
              ["Risk:Reward", "1:3 (equal stop & target)"],
            ].map(([label, value]) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.72rem",
                    color: theme.palette.text.disabled,
                  }}
                >
                  {label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: "0.72rem",
                    color: ac,
                    fontWeight: 600,
                    textAlign: "right",
                  }}
                >
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          fullWidth={isMobile}
          variant="contained"
          sx={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.75rem",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: theme.palette.primary.contrastText,
            fontWeight: 700,
            py: 1,
          }}
        >
          GOT IT
        </Button>
      </DialogActions>
    </Dialog>
  );
}
