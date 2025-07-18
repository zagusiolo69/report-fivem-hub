
-- fivem_report_system/client.lua

local isReportMenuOpen = false
local isAdminMenuOpen = false

-- Funkcja do otwierania menu zgłoszeń
function OpenReportMenu()
    if isReportMenuOpen or isAdminMenuOpen then return end
    
    isReportMenuOpen = true
    SetNuiFocus(true, true)
    
    -- Pobierz dane gracza
    local playerId = GetPlayerServerId(PlayerId())
    local playerName = GetPlayerName(PlayerId())
    
    SendNUIMessage({
        type = "showReportMenu",
        playerData = {
            id = playerId,
            name = playerName
        }
    })
end

-- Funkcja do otwierania menu administratora
function OpenAdminMenu()
    if not IsPlayerAdmin() then
        TriggerEvent('chat:addMessage', {
            color = {255, 0, 0},
            multiline = true,
            args = {"System", "Nie masz uprawnień do tej komendy!"}
        })
        return
    end
    
    if isReportMenuOpen or isAdminMenuOpen then return end
    
    isAdminMenuOpen = true
    SetNuiFocus(true, true)
    
    -- Pobierz listę zgłoszeń z serwera
    TriggerServerEvent('report:getReports')
    
    SendNUIMessage({
        type = "showAdminMenu"
    })
end

-- Zarejestrowanie komend
RegisterCommand('report', function()
    OpenReportMenu()
end, false)

RegisterCommand('reportlista', function()
    OpenAdminMenu()
end, false)

-- Sprawdzenie czy gracz jest adminem (połącz ze swoim systemem uprawnień)
function IsPlayerAdmin()
    -- W rzeczywistej implementacji połącz to ze swoim systemem uprawnień
    return IsPlayerAceAllowed(GetPlayerServerId(PlayerId()), "command.reportlista")
end

-- NUI Callbacks
RegisterNUICallback('closeUI', function(data, cb)
    SetNuiFocus(false, false)
    isReportMenuOpen = false
    isAdminMenuOpen = false
    
    SendNUIMessage({
        type = "hideUI"
    })
    
    cb({success = true})
end)

-- Wysłanie zgłoszenia
RegisterNUICallback('submitReport', function(data, cb)
    TriggerServerEvent('report:submitReport', data)
    
    SetNuiFocus(false, false)
    isReportMenuOpen = false
    
    SendNUIMessage({
        type = "hideUI"
    })
    
    cb({success = true})
end)

-- Pozostałe callbacki dla admina
RegisterNUICallback('updateReport', function(data, cb)
    TriggerServerEvent('report:updateReport', data.reportId, data.updates)
    cb({success = true})
end)

RegisterNUICallback('sendMessage', function(data, cb)
    TriggerServerEvent('report:sendMessage', data.reportId, data.message, data.isInternal or false)
    cb({success = true})
end)

RegisterNUICallback('teleportToPlayer', function(data, cb)
    if not IsPlayerAdmin() then
        cb({success = false, error = "Brak uprawnień"})
        return
    end
    
    TriggerServerEvent('report:requestTeleport', tonumber(data.playerId))
    cb({success = true})
end)

-- Odbieranie danych z serwera
RegisterNetEvent('report:receiveReports')
AddEventHandler('report:receiveReports', function(reports)
    SendNUIMessage({
        type = "loadReports",
        reports = reports
    })
end)

RegisterNetEvent('report:receiveMessage')
AddEventHandler('report:receiveMessage', function(reportId, message)
    SendNUIMessage({
        type = "newMessage",
        reportId = reportId,
        message = message
    })
end)

RegisterNetEvent('report:teleportToCoords')
AddEventHandler('report:teleportToCoords', function(x, y, z)
    SetEntityCoords(PlayerPedId(), x, y, z, false, false, false, true)
end)

-- Powiadomienie o nowym zgłoszeniu (dla adminów)
RegisterNetEvent('report:notifyNewReport')
AddEventHandler('report:notifyNewReport', function(reportData)
    if IsPlayerAdmin() then
        SendNUIMessage({
            type = "newReportNotification",
            report = reportData
        })
        
        PlaySoundFrontend(-1, "MP_5_SECOND_TIMER", "HUD_FRONTEND_DEFAULT_SOUNDSET", false)
    end
end)
