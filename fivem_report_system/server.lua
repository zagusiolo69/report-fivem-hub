-- fivem_report_system/server.lua

local reports = {}
local lastReportId = 0

-- Konfiguracja
local Config = {
    DiscordWebhook = "TWÓJ_WEBHOOK_URL_DISCORD",
    ScreenshotWebhook = "TWÓJ_WEBHOOK_DLA_SCREENÓW",
    AdminGroups = {"admin", "moderator", "superadmin"},
    EnableScreenshots = true,
    MaxAttachments = 5,
    AutoCloseAfterDays = 7
}

-- Generowanie ID zgłoszenia
function GenerateReportId()
    lastReportId = lastReportId + 1
    return "RPT-" .. os.date("%y%m%d") .. "-" .. lastReportId
end

-- Sprawdzenie czy gracz jest adminem
function IsPlayerAdmin(source)
    local identifiers = GetPlayerIdentifiers(source)
    
    -- Sprawdź grupy ACE (jeśli używasz ACE permissions)
    for _, group in ipairs(Config.AdminGroups) do
        if IsPlayerAceAllowed(source, group) then
            return true
        end
    end
    
    -- Możesz dodać własną logikę sprawdzania admina
    -- np. sprawdzanie licencji, bazy danych, itp.
    
    return false
end

-- Wysyłanie zgłoszenia na Discord
function SendToDiscord(title, message, color, fields)
    if Config.DiscordWebhook == "" or Config.DiscordWebhook == "TWÓJ_WEBHOOK_URL_DISCORD" then
        print("Discord webhook nie jest skonfigurowany!")
        return
    end
    
    local embed = {
        {
            ["title"] = title,
            ["description"] = message,
            ["color"] = color or 7447695, -- fioletowy
            ["footer"] = {
                ["text"] = "FiveM Report System • " .. os.date("%Y-%m-%d %H:%M:%S")
            },
            ["fields"] = fields or {}
        }
    }
    
    PerformHttpRequest(Config.DiscordWebhook, function(err, text, headers) end, 'POST', json.encode({embeds = embed}), { ['Content-Type'] = 'application/json' })
end

-- Powiadomienie adminów online
function NotifyAdmins(message, excludeSource)
    local players = GetPlayers()
    for _, playerId in ipairs(players) do
        playerId = tonumber(playerId)
        if playerId ~= excludeSource and IsPlayerAdmin(playerId) then
            TriggerClientEvent('chat:addMessage', playerId, {
                color = {255, 165, 0},
                multiline = true,
                args = {"[ADMIN]", message}
            })
        end
    end
end

-- Endpoint zgłoszenia
RegisterServerEvent('report:submitReport')
AddEventHandler('report:submitReport', function(data)
    local source = source
    local reportId = GenerateReportId()
    local playerName = GetPlayerName(source)
    local playerIdentifiers = GetPlayerIdentifiers(source)
    
    -- Pobierz koordynaty gracza
    local ped = GetPlayerPed(source)
    local coords = GetEntityCoords(ped)
    
    -- Stwórz nowe zgłoszenie
    local newReport = {
        id = reportId,
        title = data.title,
        description = data.description,
        category = data.category,
        priority = data.priority or "medium",
        status = "open",
        attachments = data.attachments or {},
        reportedPlayerId = data.reportedPlayerId,
        reportedPlayerName = data.reportedPlayerName,
        playerId = source,
        playerName = playerName,
        playerIdentifiers = playerIdentifiers,
        adminNotes = "",
        messages = {},
        location = {x = coords.x, y = coords.y, z = coords.z},
        createdAt = os.time(),
        updatedAt = os.time(),
        assignedAdmin = nil
    }
    
    -- Dodaj do kolekcji zgłoszeń
    reports[reportId] = newReport
    
    -- Powiadom gracza
    TriggerClientEvent('chat:addMessage', source, {
        color = {0, 255, 0},
        multiline = true,
        args = {"System", "Twoje zgłoszenie zostało wysłane! ID: " .. reportId}
    })
    
    -- Powiadom adminów
    NotifyAdmins("Nowe zgłoszenie: " .. reportId .. " - " .. data.title, source)
    
    -- Wyślij na Discord
    local fields = {
        {name = "Gracz", value = playerName .. " (ID: " .. source .. ")", inline = true},
        {name = "Kategoria", value = data.category, inline = true},
        {name = "Priorytet", value = data.priority or "Medium", inline = true},
    }
    
    if data.reportedPlayerId then
        table.insert(fields, {name = "Zgłoszony gracz", value = data.reportedPlayerName .. " (ID: " .. data.reportedPlayerId .. ")", inline = true})
    end
    
    -- Dodaj załączniki jeśli są
    if #(data.attachments or {}) > 0 then
        local attachmentsList = ""
        for i, url in ipairs(data.attachments) do
            attachmentsList = attachmentsList .. "• [Załącznik " .. i .. "](" .. url .. ")\n"
        end
        table.insert(fields, {name = "Załączniki", value = attachmentsList})
    end
    
    SendToDiscord("🚨 Nowe zgłoszenie #" .. reportId, data.description, 0xff5500, fields)
    
    -- Powiadom wszystkich adminów online o nowym zgłoszeniu
    for _, playerId in ipairs(GetPlayers()) do
        playerId = tonumber(playerId)
        if IsPlayerAdmin(playerId) then
            TriggerClientEvent('report:notifyNewReport', playerId, newReport)
        end
    end
end)

-- Pobieranie zgłoszeń (tylko dla adminów)
RegisterServerEvent('report:getReports')
AddEventHandler('report:getReports', function()
    local source = source
    
    if not IsPlayerAdmin(source) then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            args = {"System", "Nie masz uprawnień do tej komendy!"}
        })
        return
    end
    
    TriggerClientEvent('report:receiveReports', source, reports)
end)

-- Aktualizacja zgłoszenia
RegisterServerEvent('report:updateReport')
AddEventHandler('report:updateReport', function(reportId, updates)
    local source = source
    
    if not IsPlayerAdmin(source) then
        return
    end
    
    if not reports[reportId] then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            args = {"System", "Zgłoszenie o ID " .. reportId .. " nie istnieje!"}
        })
        return
    end
    
    -- Aktualizuj zgłoszenie
    for key, value in pairs(updates) do
        reports[reportId][key] = value
    end
    
    reports[reportId].updatedAt = os.time()
    
    -- Powiadom gracza o zmianie statusu
    if updates.status then
        local statusText = "nieznany"
        if updates.status == "open" then statusText = "otwarte"
        elseif updates.status == "in-progress" then statusText = "w trakcie"
        elseif updates.status == "resolved" then statusText = "rozwiązane"
        elseif updates.status == "closed" then statusText = "zamknięte"
        end
        
        TriggerClientEvent('chat:addMessage', reports[reportId].playerId, {
            color = {0, 191, 255},
            args = {"System", "Status twojego zgłoszenia #" .. reportId .. " został zmieniony na: " .. statusText}
        })
    end
    
    -- Jeśli admin się przypisał
    if updates.assignedAdmin then
        local adminName = GetPlayerName(source)
        
        TriggerClientEvent('chat:addMessage', reports[reportId].playerId, {
            color = {0, 191, 255},
            args = {"System", "Administrator " .. adminName .. " zajął się twoim zgłoszeniem #" .. reportId}
        })
    end
    
    -- Powiadom innych adminów
    NotifyAdmins("Zgłoszenie #" .. reportId .. " zostało zaktualizowane przez " .. GetPlayerName(source), source)
    
    -- Aktualizuj wszystkich adminów
    for _, playerId in ipairs(GetPlayers()) do
        playerId = tonumber(playerId)
        if IsPlayerAdmin(playerId) then
            TriggerClientEvent('report:receiveReports', playerId, reports)
        end
    end
end)

-- Wysyłanie wiadomości
RegisterServerEvent('report:sendMessage')
AddEventHandler('report:sendMessage', function(reportId, message, isInternal)
    local source = source
    local isAdmin = IsPlayerAdmin(source)
    local senderName = GetPlayerName(source)
    
    if not reports[reportId] then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            args = {"System", "Zgłoszenie o ID " .. reportId .. " nie istnieje!"}
        })
        return
    end
    
    -- Jeśli to wiadomość wewnętrzna, tylko admini mogą ją wysłać i widzieć
    if isInternal and not isAdmin then
        return
    end
    
    local newMessage = {
        id = #reports[reportId].messages + 1,
        sender = senderName,
        senderId = source,
        isAdmin = isAdmin,
        message = message,
        isInternal = isInternal or false,
        timestamp = os.time()
    }
    
    table.insert(reports[reportId].messages, newMessage)
    reports[reportId].updatedAt = os.time()
    
    -- Powiadom admina o wiadomości od gracza
    if not isAdmin then
        NotifyAdmins("Nowa wiadomość w zgłoszeniu #" .. reportId .. " od " .. senderName, nil)
    else
        -- Powiadom gracza o wiadomości od admina (tylko jeśli nie jest wewnętrzna)
        if not isInternal then
            TriggerClientEvent('chat:addMessage', reports[reportId].playerId, {
                color = {0, 191, 255},
                args = {"Admin", "Nowa wiadomość w twoim zgłoszeniu #" .. reportId}
            })
        end
    end
    
    -- Aktualizuj czat dla wszystkich zainteresowanych
    for _, playerId in ipairs(GetPlayers()) do
        playerId = tonumber(playerId)
        if playerId == reports[reportId].playerId or IsPlayerAdmin(playerId) then
            TriggerClientEvent('report:receiveMessage', playerId, reportId, newMessage)
        end
    end
end)

-- Teleportacja admina do gracza
RegisterServerEvent('report:requestTeleport')
AddEventHandler('report:requestTeleport', function(targetPlayerId)
    local source = source
    
    if not IsPlayerAdmin(source) then
        return
    end
    
    local targetPed = GetPlayerPed(targetPlayerId)
    if not targetPed or targetPed == 0 then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            args = {"System", "Gracz o ID " .. targetPlayerId .. " nie jest online!"}
        })
        return
    end
    
    local targetCoords = GetEntityCoords(targetPed)
    TriggerClientEvent('report:teleportToCoords', source, targetCoords.x, targetCoords.y, targetCoords.z)
    
    -- Powiadom admina
    TriggerClientEvent('chat:addMessage', source, {
        color = {0, 255, 0},
        args = {"System", "Teleportowano do gracza " .. GetPlayerName(targetPlayerId) .. " (ID: " .. targetPlayerId .. ")"}
    })
    
    -- Log teleportacji
    print("[Report System] Admin " .. GetPlayerName(source) .. " teleportował się do gracza " .. GetPlayerName(targetPlayerId))
end)

-- Zapisywanie danych przed restartem serwera
AddEventHandler('onResourceStop', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    
    -- Tutaj możesz zapisać raporty do bazy danych lub pliku
    print("[Report System] Zapisywanie " .. #reports .. " zgłoszeń...")
    
    -- Przykład zapisywania do pliku
    local file = io.open('reports_backup.json', 'w')
    if file then
        file:write(json.encode(reports))
        file:close()
        print("[Report System] Zgłoszenia zapisane!")
    else
        print("[Report System] Błąd podczas zapisywania zgłoszeń!")
    end
end)

-- Wczytanie danych przy starcie
AddEventHandler('onResourceStart', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    
    -- Tutaj możesz wczytać raporty z bazy danych lub pliku
    print("[Report System] Inicjalizacja systemu zgłoszeń...")
    
    -- Przykład wczytywania z pliku
    local file = io.open('reports_backup.json', 'r')
    if file then
        local content = file:read("*all")
        file:close()
        
        reports = json.decode(content) or {}
        lastReportId = #reports
        print("[Report System] Wczytano " .. #reports .. " zgłoszeń!")
    else
        print("[Report System] Brak zapisanych zgłoszeń lub błąd podczas wczytywania!")
    end
end)

print("[Report System] System zgłoszeń został załadowany!")