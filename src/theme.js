import { createTheme } from "@mui/material";

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#00d4aa" : "#00b288",
        light: "#3de7c2",
        dark: "#008866",
        contrastText: mode === "dark" ? "#001a14" : "#ffffff",
      },
      secondary: {
        main: mode === "dark" ? "#ff4d6d" : "#e63950",
        light: "#ff7a94",
        dark: "#cc3d57",
      },
      success: {
        main: "#00e676",
        light: "#66ff99",
        dark: "#00b248",
      },
      error: {
        main: "#ff1744",
        light: "#ff5169",
        dark: "#c4001d",
      },
      warning: {
        main: "#ffab00",
        light: "#ffc633",
        dark: "#cc8900",
      },
      info: {
        main: "#00b0ff",
        light: "#33bfff",
        dark: "#008dcc",
      },
      background: {
        default: mode === "dark" ? "#0a0e14" : "#f5f7fa",
        paper: mode === "dark" ? "#0f1419" : "#ffffff",
        elevated: mode === "dark" ? "#151a21" : "#fafbfc",
      },
      text: {
        primary: mode === "dark" ? "#e2e8f0" : "#1a202c",
        secondary: mode === "dark" ? "#94a3b8" : "#4a5568",
        disabled: mode === "dark" ? "#475569" : "#a0aec0",
      },
      divider: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      h4: {
        fontWeight: 800,
        letterSpacing: "-0.03em",
        fontFamily: '"JetBrains Mono", monospace',
      },
      h5: {
        fontWeight: 700,
        letterSpacing: "-0.02em",
        fontFamily: '"JetBrains Mono", monospace',
      },
      h6: {
        fontWeight: 600,
        fontFamily: '"JetBrains Mono", monospace',
      },
      body1: { fontFamily: '"Inter", sans-serif', fontSize: "0.9rem" },
      body2: { fontFamily: '"Inter", sans-serif', fontSize: "0.8rem" },
      button: {
        textTransform: "none",
        fontWeight: 700,
        letterSpacing: "0.04em",
        fontFamily: '"JetBrains Mono", monospace',
      },
    },
    shape: { borderRadius: 12 },
    shadows: [
      "none",
      mode === "dark"
        ? "0 1px 3px rgba(0,0,0,0.3)"
        : "0 1px 3px rgba(0,0,0,0.08)",
      mode === "dark"
        ? "0 4px 12px rgba(0,0,0,0.4)"
        : "0 4px 12px rgba(0,0,0,0.1)",
      mode === "dark"
        ? "0 8px 24px rgba(0,0,0,0.5)"
        : "0 8px 24px rgba(0,0,0,0.12)",
      mode === "dark"
        ? "0 12px 32px rgba(0,0,0,0.6)"
        : "0 12px 32px rgba(0,0,0,0.14)",
      ...Array(20).fill(
        mode === "dark"
          ? "0 16px 48px rgba(0,0,0,0.7)"
          : "0 16px 48px rgba(0,0,0,0.16)",
      ),
    ],
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(0,0,0,0.06)",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              borderColor:
                mode === "dark"
                  ? "rgba(0,212,170,0.25)"
                  : "rgba(0,178,136,0.3)",
              boxShadow:
                mode === "dark"
                  ? "0 8px 32px rgba(0,212,170,0.12)"
                  : "0 8px 32px rgba(0,178,136,0.15)",
              transform: "translateY(-2px)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "10px 24px",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow:
                mode === "dark"
                  ? "0 8px 24px rgba(0,0,0,0.4)"
                  : "0 8px 24px rgba(0,0,0,0.15)",
              transform: "translateY(-2px)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.7rem",
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
              background: mode === "dark" ? "#0a0e14" : "#f8fafc",
              color: mode === "dark" ? "#64748b" : "#475569",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              borderBottom:
                mode === "dark"
                  ? "2px solid rgba(255,255,255,0.08)"
                  : "2px solid rgba(0,0,0,0.08)",
              padding: "12px 16px",
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              background:
                mode === "dark"
                  ? "rgba(0,212,170,0.04)"
                  : "rgba(0,178,136,0.05)",
            },
            transition: "background 0.2s",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.05)"
                : "1px solid rgba(0,0,0,0.05)",
            padding: "12px 16px",
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 600,
            fontSize: "0.75rem",
            letterSpacing: "0.06em",
            minHeight: 48,
            transition: "all 0.2s",
            "&:hover": {
              color: mode === "dark" ? "#00d4aa" : "#00b288",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background:
              mode === "dark"
                ? "rgba(10,14,20,0.95)"
                : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(24px) saturate(180%)",
            borderBottom:
              mode === "dark"
                ? "1px solid rgba(0,212,170,0.15)"
                : "1px solid rgba(0,178,136,0.15)",
            boxShadow: "none",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            border:
              mode === "dark"
                ? "1px solid rgba(0,212,170,0.2)"
                : "1px solid rgba(0,178,136,0.2)",
            boxShadow:
              mode === "dark"
                ? "0 24px 80px rgba(0,0,0,0.8)"
                : "0 24px 80px rgba(0,0,0,0.3)",
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 3,
            borderRadius: 3,
          },
          bar: {
            borderRadius: 3,
          },
        },
      },
    },
  });
