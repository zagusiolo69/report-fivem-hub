-- FiveM Report System z bazą danych - Server Side
-- server.lua

local MySQL = exports.oxmysql or exports.mysql_async or exports.ghmattimysql

-- Konfiguracja
local Config = {
    DiscordWebhook = "YOUR_DISCORD_WEBHOOK_URL_HERE",
    AdminCodes = {
        "ADMIN2024",
        "SUPERADMIN", 
        "MODERATOR123",
        "FIVEM_ADMIN"
    },
    MaxAttachmentsPerReport = 5,
    MaxFileSizeMB = 10,
    AutoCloseResolvedAfterDays = 7
}

-- Tabele w pamięci dla lepszej wydajności
local onlineAdmins = {}
local reportCache = {}

-- Event handlers
AddEventHandler('playerConnecting', function()
    local source = source
    local identifiers = GetPlayerIdentifiers(source)
    local license = GetLicenseFromIdentifiers(identifiers)
    local playerName = GetPlayerName(source)
    
    if license then
        -- Sprawdź czy gracz istnieje w bazie, jeśli nie - dodaj
        MySQL.Async.fetchScalar('SELECT id FROM players WHERE identifier = ?', {license}, function(playerId)
            if not playerId then
                MySQL.Async.execute('INSERT INTO players (identifier, player_name) VALUES (?, ?)', {
                    license, playerName
                })
            else
                MySQL.Async.execute('UPDATE players SET player_name = ?, last_seen = NOW() WHERE id = ?', {
                    playerName, playerId
                })
            end
        end)
        
        -- Sprawdź czy gracz jest adminem
        MySQL.Async.fetchScalar('SELECT admin_level FROM players WHERE identifier = ? AND admin_level > 0', {license}, function(adminLevel)
            if adminLevel and adminLevel > 0 then
                onlineAdmins[source] = {
                    level = adminLevel,
                    identifier = license,
                    name = playerName
                }
                print(("[Report System] Admin %s połączył się z serwerem"):format(playerName))
            end
        end)
    end
end)

AddEventHandler('playerDropped', function()
    local source = source
    if onlineAdmins[source] then
        onlineAdmins[source] = nil
    end
end)

-- Funkcje pomocnicze
function GetLicenseFromIdentifiers(identifiers)
    for _, identifier in pairs(identifiers) do
        if string.match(identifier, "license:") then
            return identifier
        end
    end
    return nil
end

function IsPlayerAdmin(source)
    return onlineAdmins[source] ~= nil
end

function GetPlayerFromDB(source, callback)
    local identifiers = GetPlayerIdentifiers(source)
    local license = GetLicenseFromIdentifiers(identifiers)
    
    if license then
        MySQL.Async.fetchAll('SELECT * FROM players WHERE identifier = ?', {license}, function(result)
            if result[1] then
                callback(result[1])
            else
                callback(nil)
            end
        end)
    else
        callback(nil)
    end
end

function GenerateReportId()
    return "RPT_" .. os.time() .. "_" .. math.random(1000, 9999)
end

-- Zgłoszenie nowego raportu
RegisterServerEvent('report:submit')
AddEventHandler('report:submit', function(reportData)
    local source = source
    
    GetPlayerFromDB(source, function(player)
        if not player then
            TriggerClientEvent('report:error', source, "Błąd: Nie można zidentyfikować gracza")
            return
        end
        
        local reportId = GenerateReportId()
        local reportedPlayerId = nil
        
        -- Jeśli zgłaszany gracz jest podany, znajdź go w bazie
        if reportData.reportedPlayerId and reportData.reportedPlayerId ~= "" then
            MySQL.Async.fetchScalar('SELECT id FROM players WHERE id = ? OR player_name LIKE ?', {
                tonumber(reportData.reportedPlayerId) or 0,
                "%" .. (reportData.reportedPlayerName or "") .. "%"
            }, function(foundPlayerId)
                reportedPlayerId = foundPlayerId
            end)
        end
        
        -- Wstaw zgłoszenie do bazy
        MySQL.Async.execute('INSERT INTO reports (report_id, player_id, reported_player_id, category, priority, title, description, server_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', {
            reportId,
            player.id,
            reportedPlayerId,
            reportData.category,
            reportData.priority or 'medium',
            reportData.title,
            reportData.description,
            GetConvar("sv_hostname", "FiveM Server")
        }, function(insertId)
            if insertId then
                -- Wyślij powiadomienie do gracza
                TriggerClientEvent('chat:addMessage', source, {
                    color = {0, 255, 0},
                    multiline = true,
                    args = {"System", ("Zgłoszenie wysłane! ID: %s"):format(reportId)}
                })
                
                -- Wyślij Discord webhook
                SendDiscordWebhook({
                    id = reportId,
                    title = reportData.title,
                    description = reportData.description,
                    category = reportData.category,
                    priority = reportData.priority or 'medium',
                    playerName = player.player_name,
                    playerId = player.id,
                    reportedPlayerName = reportData.reportedPlayerName
                })
                
                -- Powiadom adminów online
                NotifyOnlineAdmins(reportId, reportData.title, player.player_name)
                
                -- Zapisz w cache
                reportCache[reportId] = {
                    id = insertId,
                    report_id = reportId,
                    status = 'open',
                    created_at = os.date("%Y-%m-%d %H:%M:%S")
                }
                
                print(("[Report System] Nowe zgłoszenie: %s od %s"):format(reportId, player.player_name))
            else
                TriggerClientEvent('report:error', source, "Błąd: Nie można zapisać zgłoszenia")
            end
        end)
    end)
end)

-- Panel admina
RegisterServerEvent('report:getReports')
AddEventHandler('report:getReports', function()
    local source = source
    
    if not IsPlayerAdmin(source) then
        TriggerClientEvent('report:error', source, "Brak uprawnień")
        return
    end
    
    MySQL.Async.fetchAll([[
        SELECT 
            r.*,
            p.player_name,
            p.identifier as player_identifier,
            rp.player_name as reported_player_name,
            a.player_name as assigned_admin_name,
            (SELECT COUNT(*) FROM report_messages rm WHERE rm.report_id = r.id) as message_count,
            (SELECT COUNT(*) FROM report_attachments ra WHERE ra.report_id = r.id) as attachment_count
        FROM reports r
        LEFT JOIN players p ON r.player_id = p.id
        LEFT JOIN players rp ON r.reported_player_id = rp.id  
        LEFT JOIN players a ON r.assigned_admin_id = a.id
        ORDER BY 
            CASE WHEN r.priority = 'urgent' THEN 1
                 WHEN r.priority = 'high' THEN 2  
                 WHEN r.priority = 'medium' THEN 3
                 ELSE 4 END,
            r.created_at DESC
    ]], {}, function(reports)
        TriggerClientEvent('report:receiveReports', source, reports)
    end)
end)

-- Aktualizacja statusu zgłoszenia
RegisterServerEvent('report:updateStatus')
AddEventHandler('report:updateStatus', function(reportId, newStatus, adminNotes)
    local source = source
    
    if not IsPlayerAdmin(source) then
        return
    end
    
    local admin = onlineAdmins[source]
    
    MySQL.Async.execute('UPDATE reports SET status = ?, admin_notes = ?, updated_at = NOW() WHERE report_id = ?', {
        newStatus, adminNotes or "", reportId
    }, function(affectedRows)
        if affectedRows > 0 then
            -- Log akcji admina
            MySQL.Async.execute('INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details) VALUES ((SELECT id FROM players WHERE identifier = ?), ?, ?, (SELECT id FROM reports WHERE report_id = ?), ?)', {
                admin.identifier,
                'status_change',
                'report', 
                reportId,
                json.encode({old_status = 'unknown', new_status = newStatus, notes = adminNotes})
            })
            
            print(("[Report System] Admin %s zmienił status zgłoszenia %s na %s"):format(admin.name, reportId, newStatus))
        end
    end)
end)

-- Wysyłanie wiadomości w zgłoszeniu
RegisterServerEvent('report:sendMessage')
AddEventHandler('report:sendMessage', function(reportId, message, isInternal)
    local source = source
    
    GetPlayerFromDB(source, function(player)
        if not player then return end
        
        local senderType = IsPlayerAdmin(source) and 'admin' or 'player'
        
        MySQL.Async.execute('INSERT INTO report_messages (report_id, sender_id, sender_type, message, is_internal) VALUES ((SELECT id FROM reports WHERE report_id = ?), ?, ?, ?, ?)', {
            reportId, player.id, senderType, message, isInternal or false
        }, function(insertId)
            if insertId then
                -- Powiadom o nowej wiadomości
                local targetPlayers = {}
                
                if senderType == 'admin' then
                    -- Powiadom gracza który złożył zgłoszenie
                    MySQL.Async.fetchScalar('SELECT p.identifier FROM reports r JOIN players p ON r.player_id = p.id WHERE r.report_id = ?', {reportId}, function(playerIdentifier)
                        if playerIdentifier then
                            for playerId, _ in pairs(GetPlayers()) do
                                local identifiers = GetPlayerIdentifiers(playerId)
                                local license = GetLicenseFromIdentifiers(identifiers)
                                if license == playerIdentifier then
                                    TriggerClientEvent('chat:addMessage', playerId, {
                                        color = {0, 150, 255},
                                        multiline = true,
                                        args = {"Admin", ("Nowa wiadomość w zgłoszeniu %s"):format(reportId)}
                                    })
                                    break
                                end
                            end
                        end
                    end)
                else
                    -- Powiadom adminów online
                    for adminId, adminData in pairs(onlineAdmins) do
                        TriggerClientEvent('chat:addMessage', adminId, {
                            color = {255, 165, 0},
                            multiline = true,
                            args = {"Report", ("Nowa wiadomość w zgłoszeniu %s"):format(reportId)}
                        })
                    end
                end
            end
        end)
    end)
end)

-- Discord webhook
function SendDiscordWebhook(reportData)
    if Config.DiscordWebhook == "" then return end
    
    local priorityColors = {
        low = 0x00ff00,
        medium = 0xffff00, 
        high = 0xff8000,
        urgent = 0xff0000
    }
    
    local embed = {
        {
            ["title"] = "🚨 Nowe Zgłoszenie #" .. reportData.id,
            ["description"] = "**" .. reportData.title .. "**\n\n" .. reportData.description,
            ["color"] = priorityColors[reportData.priority] or 0x7c3aed,
            ["fields"] = {
                {
                    ["name"] = "Zgłaszający",
                    ["value"] = reportData.playerName .. " (ID: " .. reportData.playerId .. ")",
                    ["inline"] = true
                },
                {
                    ["name"] = "Kategoria", 
                    ["value"] = reportData.category,
                    ["inline"] = true
                },
                {
                    ["name"] = "Priorytet",
                    ["value"] = reportData.priority,
                    ["inline"] = true
                }
            },
            ["timestamp"] = os.date("!%Y-%m-%dT%H:%M:%SZ"),
            ["footer"] = {
                ["text"] = "FiveM Report System"
            }
        }
    }
    
    if reportData.reportedPlayerName then
        table.insert(embed[1].fields, {
            ["name"] = "Zgłoszony gracz",
            ["value"] = reportData.reportedPlayerName,
            ["inline"] = true
        })
    end
    
    PerformHttpRequest(Config.DiscordWebhook, function(err, text, headers) 
        if err ~= 200 then
            print(("[Report System] Błąd wysyłania webhook Discord: %s"):format(err))
        end
    end, 'POST', json.encode({embeds = embed}), {['Content-Type'] = 'application/json'})
end

function NotifyOnlineAdmins(reportId, title, playerName)
    for adminId, adminData in pairs(onlineAdmins) do
        TriggerClientEvent('chat:addMessage', adminId, {
            color = {255, 165, 0},
            multiline = true,
            args = {"Admin", ("🚨 Nowe zgłoszenie %s: %s od %s"):format(reportId, title, playerName)}
        })
    end
end

-- Komendy
RegisterCommand('reportstats', function(source, args)
    if not IsPlayerAdmin(source) then
        TriggerClientEvent('chat:addMessage', source, {
            color = {255, 0, 0},
            args = {"System", "Brak uprawnień!"}
        })
        return
    end
    
    MySQL.Async.fetchAll('SELECT status, COUNT(*) as count FROM reports GROUP BY status', {}, function(stats)
        local message = "📊 Statystyki zgłoszeń:\n"
        for _, stat in pairs(stats) do
            message = message .. ("• %s: %d\n"):format(stat.status, stat.count)
        end
        
        TriggerClientEvent('chat:addMessage', source, {
            color = {0, 255, 255},
            multiline = true,
            args = {"Stats", message}
        })
    end)
end, true)

-- Automatyczne zamykanie rozwiązanych zgłoszeń
CreateThread(function()
    while true do
        Wait(3600000) -- Co godzinę
        
        MySQL.Async.execute([[
            UPDATE reports 
            SET status = 'closed', updated_at = NOW() 
            WHERE status = 'resolved' 
            AND resolved_at < DATE_SUB(NOW(), INTERVAL ? DAY)
        ]], {Config.AutoCloseResolvedAfterDays})
        
        Wait(3600000) -- Czekaj godzinę przed następnym sprawdzeniem
    end
end)

print("[Report System] Załadowano system zgłoszeń z bazą danych")