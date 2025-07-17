-- fivem_report_system/config.lua

Config = {}

-- Konfiguracja Discord
Config.DiscordWebhook = "TWÓJ_WEBHOOK_URL_DISCORD" -- Ustaw webhook URL do Discorda
Config.ScreenshotWebhook = "TWÓJ_WEBHOOK_DLA_SCREENÓW" -- Ustaw webhook URL dla zrzutów ekranu

-- Konfiguracja uprawnień
Config.AdminGroups = {
    "admin",
    "moderator",
    "superadmin"
}

-- Kody dostępu dla adminów (używane w wersji webowej)
Config.AdminCodes = {
    "ADMIN2024", 
    "SUPERADMIN", 
    "MODERATOR123",
    "FIVEM_ADMIN"
}

-- Konfiguracja zgłoszeń
Config.MaxAttachments = 5 -- Maksymalna liczba załączników na zgłoszenie
Config.AutoCloseAfterDays = 7 -- Automatycznie zamknij rozwiązane zgłoszenia po X dniach

-- Konfiguracja UI
Config.UIScale = 1.0 -- Skala interfejsu (1.0 = 100%)
Config.UITheme = "dark" -- "dark" lub "light"

-- Konfiguracja powiadomień
Config.EnableNotifications = true -- Włącz/wyłącz powiadomienia w grze
Config.EnableDiscordNotifications = true -- Włącz/wyłącz powiadomienia na Discordzie
Config.NotifyAdminsOnReportCreated = true -- Powiadom adminów kiedy powstaje nowe zgłoszenie

-- Konfiguracja komend
Config.Commands = {
    Report = "report", -- Komenda do otwierania formularza zgłoszenia
    AdminList = "reportlista", -- Komenda do otwierania panelu admina
    ReportStats = "reportstats" -- Komenda do wyświetlania statystyk zgłoszeń
}

-- Kategorie zgłoszeń
Config.Categories = {
    { value = "bug", label = "Bug/Błąd gry", icon = "exclamation-triangle", color = "#f59e0b", requiresReportedPlayer = false },
    { value = "player", label = "Zgłoszenie gracza", icon = "user", color = "#7c3aed", requiresReportedPlayer = true },
    { value = "cheating", label = "Cheating/Hacking", icon = "shield-alt", color = "#ef4444", requiresReportedPlayer = true },
    { value = "griefing", label = "Griefing", icon = "users", color = "#f59e0b", requiresReportedPlayer = true },
    { value = "other", label = "Inne", icon = "question-circle", color = "#94a3b8", requiresReportedPlayer = false }
}

-- Priorytety zgłoszeń
Config.Priorities = {
    { value = "low", label = "Niski", color = "#10b981" },
    { value = "medium", label = "Średni", color = "#3b82f6" },
    { value = "high", label = "Wysoki", color = "#f59e0b" },
    { value = "urgent", label = "Pilny", color = "#ef4444" }
}

-- Statusy zgłoszeń
Config.Statuses = {
    { value = "open", label = "Otwarte", color = "#f59e0b" },
    { value = "in-progress", label = "W trakcie", color = "#3b82f6" },
    { value = "resolved", label = "Rozwiązane", color = "#10b981" },
    { value = "closed", label = "Zamknięte", color = "#94a3b8" }
}