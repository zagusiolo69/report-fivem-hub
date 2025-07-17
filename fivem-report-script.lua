-- FiveM Report System Lua Script
-- Client Side (client.lua)

local isReportMenuOpen = false
local reportData = {}

-- Komenda /report
RegisterCommand('report', function()
    if not isReportMenuOpen then
        OpenReportMenu()
    end
end, false)

-- Komenda /reportlista (tylko dla adminów)
RegisterCommand('reportlista', function()
    if IsPlayerAdmin() then
        TriggerServerEvent('report:openAdminPanel')
    else
        TriggerEvent('chat:addMessage', {
            color = {255, 0, 0},
            multiline = true,
            args = {"System", "Nie masz uprawnień do tej komendy!"}
        })
    end
end, false)

function OpenReportMenu()
    isReportMenuOpen = true
    SetNuiFocus(true, true)
    
    SendNUIMessage({
        type = "openReportForm",
        playerData = {
            playerId = GetPlayerServerId(PlayerId()),
            playerName = GetPlayerName(PlayerId())
        }
    })
end

function IsPlayerAdmin()
    -- Tutaj dodaj logikę sprawdzania uprawnień admina
    -- Przykład: sprawdź grupę gracza, ace permissions itp.
    return IsPlayerAceAllowed(PlayerId(), "report.admin") or 
           GetPlayerIdentifierByType(PlayerId(), "license"):find("admin_license_here")
end

-- NUI Callbacks
RegisterNUICallback('submitReport', function(data, cb)
    TriggerServerEvent('report:submit', data)
    SetNuiFocus(false, false)
    isReportMenuOpen = false
    cb('ok')
end)

RegisterNUICallback('closeMenu', function(data, cb)
    SetNuiFocus(false, false)
    isReportMenuOpen = false
    cb('ok')
end)

-- Server Side (server.lua)

local reports = {}
local discordWebhook = "YOUR_DISCORD_WEBHOOK_URL_HERE"

-- Obsługa zgłoszenia
RegisterServerEvent('report:submit')
AddEventHandler('report:submit', function(reportData)
    local source = source
    local identifier = GetPlayerIdentifierByType(source, "license")
    
    local report = {
        id = "report_" .. os.time() .. "_" .. source,
        playerId = source,
        playerName = GetPlayerName(source),
        playerIdentifier = identifier,
        reportedPlayerId = reportData.reportedPlayerId,
        reportedPlayerName = reportData.reportedPlayerName,
        category = reportData.category,
        priority = reportData.priority,
        title = reportData.title,
        description = reportData.description,
        attachments = reportData.attachments or {},
        status = "open",
        createdAt = os.date("%Y-%m-%d %H:%M:%S"),
        updatedAt = os.date("%Y-%m-%d %H:%M:%S"),
        adminNotes = "",
        chatMessages = {}
    }
    
    table.insert(reports, report)
    
    -- Wyślij webhook do Discord
    SendDiscordWebhook(report)
    
    -- Powiadom graczy
    TriggerClientEvent('chat:addMessage', source, {
        color = {0, 255, 0},
        multiline = true,
        args = {"System", "Twoje zgłoszenie zostało wysłane! ID: " .. report.id}
    })
    
    -- Powiadom adminów online
    NotifyOnlineAdmins(report)
end)

-- Otwórz panel admina
RegisterServerEvent('report:openAdminPanel')
AddEventHandler('report:openAdminPanel', function()
    local source = source
    if IsPlayerAdmin(source) then
        TriggerClientEvent('report:openAdminPanel', source, reports)
    end
end)

function SendDiscordWebhook(report)
    local embed = {
        {
            ["title"] = "🚨 Nowe Zgłoszenie #" .. string.sub(report.id, -6),
            ["description"] = "**" .. report.title .. "**\n\n" .. report.description,
            ["color"] = report.priority == "urgent" and 16711680 or 8128255,
            ["fields"] = {
                {
                    ["name"] = "Zgłaszający",
                    ["value"] = report.playerName .. " (ID: " .. report.playerId .. ")",
                    ["inline"] = true
                },
                {
                    ["name"] = "Kategoria",
                    ["value"] = report.category,
                    ["inline"] = true
                },
                {
                    ["name"] = "Priorytet",
                    ["value"] = report.priority,
                    ["inline"] = true
                }
            },
            ["timestamp"] = os.date("!%Y-%m-%dT%H:%M:%SZ")
        }
    }
    
    PerformHttpRequest(discordWebhook, function(err, text, headers) end, 'POST', json.encode({embeds = embed}), {['Content-Type'] = 'application/json'})
end

function NotifyOnlineAdmins(report)
    for _, playerId in ipairs(GetPlayers()) do
        if IsPlayerAdmin(tonumber(playerId)) then
            TriggerClientEvent('chat:addMessage', tonumber(playerId), {
                color = {255, 165, 0},
                multiline = true,
                args = {"Admin", "Nowe zgłoszenie: " .. report.title .. " | /reportlista"}
            })
        end
    end
end

function IsPlayerAdmin(playerId)
    return IsPlayerAceAllowed(playerId, "report.admin")
end

-- HTML/CSS/JS (html/index.html)
--[[
<!DOCTYPE html>
<html>
<head>
    <title>Report System</title>
    <style>
        body { font-family: Arial; background: transparent; margin: 0; padding: 20px; }
        .report-form { background: rgba(0,0,0,0.9); color: white; padding: 20px; border-radius: 10px; max-width: 500px; margin: auto; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: #7c3aed; }
        input, select, textarea { width: 100%; padding: 8px; border: 1px solid #333; background: #222; color: white; border-radius: 5px; }
        button { background: #7c3aed; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #6d28d9; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div id="reportForm" class="report-form hidden">
        <h2>🚨 Nowe Zgłoszenie</h2>
        <form id="reportFormElement">
            <div class="form-group">
                <label>Kategoria:</label>
                <select id="category" required>
                    <option value="">Wybierz kategorię</option>
                    <option value="bug">Bug/Błąd</option>
                    <option value="player">Zgłoszenie gracza</option>
                    <option value="cheating">Cheating</option>
                    <option value="griefing">Griefing</option>
                    <option value="other">Inne</option>
                </select>
            </div>
            <div class="form-group">
                <label>Tytuł:</label>
                <input type="text" id="title" required>
            </div>
            <div class="form-group">
                <label>Opis:</label>
                <textarea id="description" rows="5" required></textarea>
            </div>
            <div class="form-group">
                <label>ID zgłaszanego gracza (opcjonalne):</label>
                <input type="text" id="reportedPlayerId">
            </div>
            <button type="submit">Wyślij Zgłoszenie</button>
            <button type="button" onclick="closeMenu()">Anuluj</button>
        </form>
    </div>

    <script>
        window.addEventListener('message', function(event) {
            if (event.data.type === "openReportForm") {
                document.getElementById('reportForm').classList.remove('hidden');
            }
        });

        document.getElementById('reportFormElement').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                category: document.getElementById('category').value,
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                reportedPlayerId: document.getElementById('reportedPlayerId').value,
                priority: 'medium'
            };
            
            fetch(`https://${GetParentResourceName()}/submitReport`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        });

        function closeMenu() {
            document.getElementById('reportForm').classList.add('hidden');
            fetch(`https://${GetParentResourceName()}/closeMenu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
        }
    </script>
</body>
</html>
--]]