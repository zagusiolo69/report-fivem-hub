-- fivem_report_system/client.lua

local isReportMenuOpen = false
local isAdminMenuOpen = false
local isImageViewOpen = false
local selectedReport = nil
local viewingImage = nil

-- Funkcja do otwierania menu zgłoszeń
function OpenReportMenu()
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
    
    isAdminMenuOpen = true
    SetNuiFocus(true, true)
    
    -- Pobierz listę zgłoszeń z serwera
    TriggerServerEvent('report:getReports')
end

-- Zarejestrowanie komend
RegisterCommand('report', function()
    if not isReportMenuOpen and not isAdminMenuOpen then
        OpenReportMenu()
    end
end, false)

RegisterCommand('reportlista', function()
    if not isReportMenuOpen and not isAdminMenuOpen then
        OpenAdminMenu()
    end
end, false)

-- Sprawdzenie czy gracz jest adminem
function IsPlayerAdmin()
    -- W rzeczywistej implementacji połącz to ze swoim systemem uprawnień
    -- Przykładowo: sprawdź grupę gracza, ace permissions itp.
    local playerAceGroup = "admin"  -- Ustaw swoją grupę administratora
    return IsPlayerAceAllowed(playerAceGroup)
end

-- Odbieranie listy zgłoszeń
RegisterNetEvent('report:receiveReports')
AddEventHandler('report:receiveReports', function(reports)
    SendNUIMessage({
        type = "loadReports",
        reports = reports
    })
end)

-- Odbieranie wiadomości czatu
RegisterNetEvent('report:receiveMessage')
AddEventHandler('report:receiveMessage', function(reportId, message)
    SendNUIMessage({
        type = "newMessage",
        reportId = reportId,
        message = message
    })
end)

-- NUI Callbacks

-- Zamknięcie okna
RegisterNUICallback('closeUI', function(data, cb)
    SetNuiFocus(false, false)
    isReportMenuOpen = false
    isAdminMenuOpen = false
    isImageViewOpen = false
    cb({})
end)

-- Wysłanie zgłoszenia
RegisterNUICallback('submitReport', function(data, cb)
    TriggerServerEvent('report:submitReport', data)
    SetNuiFocus(false, false)
    isReportMenuOpen = false
    cb({success = true})
end)

-- Pobieranie screenshota
RegisterNUICallback('takeScreenshot', function(data, cb)
    -- Najpierw zamknij interfejs aby zrobić screenshot bez UI
    SetNuiFocus(false, false)
    isReportMenuOpen = false
    
    -- Odczekaj chwilę aby UI zniknęło
    Citizen.Wait(200)
    
    -- Zrób screenshot
    exports['screenshot-basic']:requestScreenshotUpload(
        GetConvar("report_webhook_url", ""), -- URL dla uploadu screenshotów
        'files[]',
        function(data)
            local resp = json.decode(data)
            local imageUrl = resp.files[1]
            
            -- Teraz ponownie otwórz menu z dołączonym screenem
            SetNuiFocus(true, true)
            isReportMenuOpen = true
            
            SendNUIMessage({
                type = "screenshotTaken",
                imageUrl = imageUrl
            })
            
            cb({success = true, imageUrl = imageUrl})
        end
    )
end)

-- Aktualizacja zgłoszenia przez admina
RegisterNUICallback('updateReport', function(data, cb)
    TriggerServerEvent('report:updateReport', data.reportId, data.updates)
    cb({success = true})
end)

-- Wysłanie wiadomości w zgłoszeniu
RegisterNUICallback('sendMessage', function(data, cb)
    TriggerServerEvent('report:sendMessage', data.reportId, data.message, data.isInternal or false)
    cb({success = true})
end)

-- Podgląd obrazka
RegisterNUICallback('viewImage', function(data, cb)
    viewingImage = data.imageUrl
    isImageViewOpen = true
    
    SendNUIMessage({
        type = "showImageViewer",
        imageUrl = data.imageUrl
    })
    
    cb({success = true})
end)

-- Teleport do gracza (tylko admin)
RegisterNUICallback('teleportToPlayer', function(data, cb)
    if not IsPlayerAdmin() then
        cb({success = false, error = "Brak uprawnień"})
        return
    end
    
    local targetServerId = tonumber(data.playerId)
    if not targetServerId then
        cb({success = false, error = "Nieprawidłowe ID gracza"})
        return
    end
    
    TriggerServerEvent('report:requestTeleport', targetServerId)
    cb({success = true})
end)

-- Teleportacja
RegisterNetEvent('report:teleportToCoords')
AddEventHandler('report:teleportToCoords', function(x, y, z)
    SetEntityCoords(PlayerPedId(), x, y, z, false, false, false, true)
end)

-- Powiadomienie o nowym zgłoszeniu (dla adminów)
RegisterNetEvent('report:notifyNewReport')
AddEventHandler('report:notifyNewReport', function(reportData)
    if IsPlayerAdmin() then
        -- Wyświetl powiadomienie dla admina
        SendNUIMessage({
            type = "newReportNotification",
            report = reportData
        })
        
        -- Zagraj dźwięk powiadomienia
        PlaySoundFrontend(-1, "MP_5_SECOND_TIMER", "HUD_FRONTEND_DEFAULT_SOUNDSET", false)
    end
end)