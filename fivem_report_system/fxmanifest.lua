
fx_version 'cerulean'
game 'gta5'

name 'FiveM Report System'
author 'Twój Autor'
description 'System zgłoszeń dla serwerów FiveM z React UI'
version '1.0.0'

ui_page 'dist/index.html'

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

-- Pliki interfejsu - React build
files {
    'dist/**/*'
}

-- Eksporty
export 'OpenReportMenu'
export 'OpenAdminMenu'
