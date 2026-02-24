import React from "react";
import { useTranslation } from "react-i18next";
import { IconButton, Menu, MenuItem, Typography, Box, Tooltip } from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";

const LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "mr", label: "मराठी", flag: "🇮🇳" },
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleSelect = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem("i18nextLng", code);
        handleClose();
    };

    const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

    return (
        <>
            <Tooltip title="Language / भाषा">
                <IconButton
                    size="small"
                    onClick={handleOpen}
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1.5,
                        px: 0.8,
                        py: 0.4,
                        gap: 0.5,
                        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                    }}
                >
                    <TranslateIcon sx={{ fontSize: 14 }} />
                    <Typography
                        sx={{
                            fontFamily: '"JetBrains Mono", monospace',
                            fontSize: "0.58rem",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                        }}
                    >
                        {currentLang.code.toUpperCase()}
                    </Typography>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            minWidth: 140,
                            mt: 1,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                        },
                    },
                }}
            >
                {LANGUAGES.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        selected={i18n.language === lang.code}
                        onClick={() => handleSelect(lang.code)}
                        sx={{ gap: 1, py: 0.8 }}
                    >
                        <Typography sx={{ fontSize: "1rem" }}>{lang.flag}</Typography>
                        <Box>
                            <Typography variant="body2" fontWeight={600}>
                                {lang.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                                {lang.code.toUpperCase()}
                            </Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
