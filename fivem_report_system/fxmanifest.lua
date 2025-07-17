-- fivem_report_system/fxmanifest.lua

fx_version 'cerulean'
game 'gta5'

name 'FiveM Report System'
author 'Twój Autor'
description 'System zgłoszeń dla serwerów FiveM z panelem webowym i obsługą administracyjną'
version '1.0.0'

ui_page 'html/index.html'

-- Pliki klienckie
client_scripts {
    'client.lua'
}

-- Pliki serwerowe
server_scripts {
    'server.lua'
}

-- Pliki współdzielone
shared_scripts {
    'config.lua'
}

-- Pliki interfejsu
files {
    'html/index.html',
    'html/styles.css',
    'html/script.js',
}

-- Zależności
dependencies {
    'screenshot-basic' -- Wymagane do robienia zrzutów ekranu
}

-- Konwary serwerowe (ustaw je w server.cfg)
server_export 'GetReportById'
server_export 'GetAllReports'
server_export 'AddReport'
server_export 'UpdateReport'
server_export 'IsPlayerAdmin'

-- Eksporty klienckie
export 'OpenReportMenu'
export 'OpenAdminMenu'