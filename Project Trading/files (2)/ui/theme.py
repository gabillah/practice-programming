"""ui/theme.py — Light-mode colour palette and font definitions."""

COLOURS = {
    # Backgrounds
    "bg":       "#F5F6FA",
    "bg2":      "#FFFFFF",
    "bg3":      "#EAECF4",
    "bg_dark":  "#2C3E50",
    "sidebar":  "#FAFBFF",
    "card":     "#FFFFFF",
    "card_border":"#DDE1EC",
    # Text
    "text":     "#1A1D2E",
    "text2":    "#5A5F7A",
    "text3":    "#8A8FA8",
    "text_inv": "#FFFFFF",
    # Accents
    "accent":   "#2563EB",
    "accent2":  "#7C3AED",
    "accent_lt":"#EFF6FF",
    # Trading
    "buy":      "#16A34A",
    "buy_bg":   "#F0FDF4",
    "sell":     "#DC2626",
    "sell_bg":  "#FEF2F2",
    "profit":   "#16A34A",
    "loss":     "#DC2626",
    # UI elements
    "border":   "#E2E5F0",
    "hover":    "#EFF6FF",
    "selected": "#DBEAFE",
    "input_bg": "#F9FAFB",
    "btn":      "#2563EB",
    "btn_hover":"#1D4ED8",
    "btn_text": "#FFFFFF",
    "warning":  "#D97706",
    "warn_bg":  "#FFFBEB",
    "danger":   "#DC2626",
    "danger_bg":"#FEF2F2",
    "success":  "#16A34A",
    "success_bg":"#F0FDF4",
    # Chart
    "chart_bg":    "#FFFFFF",
    "chart_grid":  "#F0F1F7",
    "candle_bull": "#16A34A",
    "candle_bear": "#DC2626",
    "ema_fast":    "#2563EB",
    "ema_slow":    "#F59E0B",
    "ema_trend":   "#7C3AED",
    "bb_band":     "#9CA3AF",
    "supertrend_b":"#16A34A",
    "supertrend_s":"#DC2626",
    "signal_buy":  "#16A34A",
    "signal_sell": "#DC2626",
    "rsi_line":    "#7C3AED",
    "rsi_ob":      "#DC2626",
    "rsi_os":      "#16A34A",
    "vwap":        "#F97316",
}

FONTS = {
    "default":  ("Segoe UI", 10),
    "small":    ("Segoe UI", 9),
    "large":    ("Segoe UI", 12),
    "xlarge":   ("Segoe UI", 16, "bold"),
    "title":    ("Segoe UI", 22, "bold"),
    "mono":     ("Consolas", 10),
    "mono_sm":  ("Consolas", 9),
    "bold":     ("Segoe UI", 10, "bold"),
    "bold_sm":  ("Segoe UI", 9, "bold"),
    "bold_lg":  ("Segoe UI", 13, "bold"),
    "price":    ("Consolas", 14, "bold"),
    "price_sm": ("Consolas", 11),
}

PADDING = {"xs":2,"sm":4,"md":8,"lg":12,"xl":16,"xxl":24}
RADIUS  = 6   # corner radius (visual only, Tkinter uses relief)
