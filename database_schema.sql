-- Schemat bazy danych MySQL/MariaDB dla systemu zgłoszeń FiveM

-- Tabela użytkowników/graczy
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(100) UNIQUE NOT NULL,
    license VARCHAR(100) UNIQUE,
    discord VARCHAR(100),
    steam VARCHAR(100),
    player_name VARCHAR(50) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    admin_level INT DEFAULT 0, -- 0=gracz, 1=moderator, 2=admin, 3=super admin
    first_join TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela zgłoszeń
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) UNIQUE NOT NULL,
    player_id INT NOT NULL,
    reported_player_id INT NULL,
    category ENUM('bug', 'player', 'cheating', 'griefing', 'other') NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_admin_id INT NULL,
    admin_notes TEXT,
    server_id VARCHAR(10) NULL,
    location_x FLOAT NULL,
    location_y FLOAT NULL,
    location_z FLOAT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_player_id) REFERENCES players(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_admin_id) REFERENCES players(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
);

-- Tabela załączników (screenshoty, zdjęcia)
CREATE TABLE IF NOT EXISTS report_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES players(id) ON DELETE CASCADE
);

-- Tabela wiadomości czatu między graczami a adminami
CREATE TABLE IF NOT EXISTS report_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_type ENUM('player', 'admin') NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- wiadomości tylko dla adminów
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_report_id (report_id),
    INDEX idx_created_at (created_at)
);

-- Tabela logów akcji adminów
CREATE TABLE IF NOT EXISTS admin_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action_type ENUM('status_change', 'assignment', 'note_added', 'message_sent', 'report_closed') NOT NULL,
    target_type ENUM('report', 'player') NOT NULL,
    target_id INT NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES players(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);

-- Tabela kategorii zgłoszeń (rozszerzalna)
CREATE TABLE IF NOT EXISTS report_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    category_label VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    requires_reported_player BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela konfiguracji systemu
CREATE TABLE IF NOT EXISTS system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES players(id) ON DELETE SET NULL
);

-- Tabela statystyk
CREATE TABLE IF NOT EXISTS report_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_date DATE NOT NULL,
    total_reports INT DEFAULT 0,
    open_reports INT DEFAULT 0,
    in_progress_reports INT DEFAULT 0,
    resolved_reports INT DEFAULT 0,
    closed_reports INT DEFAULT 0,
    urgent_reports INT DEFAULT 0,
    avg_resolution_time_hours DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_stat_date (stat_date)
);

-- Wstawienie podstawowych kategorii
INSERT INTO report_categories (category_name, category_label, icon, color, requires_reported_player) VALUES
('bug', 'Bug/Błąd', 'AlertTriangle', '#f59e0b', FALSE),
('player', 'Zgłoszenie gracza', 'User', '#ef4444', TRUE),
('cheating', 'Cheating', 'Shield', '#ef4444', TRUE),
('griefing', 'Griefing', 'Users', '#f59e0b', TRUE),
('other', 'Inne', 'HelpCircle', '#6b7280', FALSE);

-- Wstawienie podstawowej konfiguracji
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('discord_webhook_url', '', 'string', 'URL webhook do Discord dla powiadomień'),
('auto_close_resolved_after_days', '7', 'integer', 'Automatycznie zamknij rozwiązane zgłoszenia po X dniach'),
('max_attachments_per_report', '5', 'integer', 'Maksymalna liczba załączników na zgłoszenie'),
('max_file_size_mb', '10', 'integer', 'Maksymalny rozmiar pliku w MB'),
('enable_player_notifications', 'true', 'boolean', 'Włącz powiadomienia dla graczy'),
('enable_admin_notifications', 'true', 'boolean', 'Włącz powiadomienia dla adminów'),
('require_screenshot_for_cheating', 'true', 'boolean', 'Wymagaj screenshota dla zgłoszeń cheating');

-- Procedura do aktualizacji statystyk
DELIMITER //
CREATE PROCEDURE UpdateDailyStats()
BEGIN
    INSERT INTO report_stats (
        stat_date,
        total_reports,
        open_reports,
        in_progress_reports,
        resolved_reports,
        closed_reports,
        urgent_reports,
        avg_resolution_time_hours
    )
    SELECT 
        CURDATE(),
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_reports,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_reports,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_reports,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_reports,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_reports,
        AVG(CASE 
            WHEN resolved_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
            ELSE NULL 
        END) as avg_resolution_time_hours
    FROM reports 
    WHERE DATE(created_at) = CURDATE()
    ON DUPLICATE KEY UPDATE
        total_reports = VALUES(total_reports),
        open_reports = VALUES(open_reports),
        in_progress_reports = VALUES(in_progress_reports),
        resolved_reports = VALUES(resolved_reports),
        closed_reports = VALUES(closed_reports),
        urgent_reports = VALUES(urgent_reports),
        avg_resolution_time_hours = VALUES(avg_resolution_time_hours);
END //
DELIMITER ;

-- Event do automatycznego aktualizowania statystyk (uruchamiany codziennie o północy)
CREATE EVENT IF NOT EXISTS daily_stats_update
ON SCHEDULE EVERY 1 DAY
STARTS '2024-01-01 00:00:00'
DO
    CALL UpdateDailyStats();

-- Widoki dla łatwiejszego dostępu do danych
CREATE VIEW reports_with_players AS
SELECT 
    r.*,
    p.player_name,
    p.identifier as player_identifier,
    rp.player_name as reported_player_name,
    rp.identifier as reported_player_identifier,
    a.player_name as assigned_admin_name,
    (SELECT COUNT(*) FROM report_messages rm WHERE rm.report_id = r.id) as message_count,
    (SELECT COUNT(*) FROM report_attachments ra WHERE ra.report_id = r.id) as attachment_count
FROM reports r
LEFT JOIN players p ON r.player_id = p.id
LEFT JOIN players rp ON r.reported_player_id = rp.id
LEFT JOIN players a ON r.assigned_admin_id = a.id;

-- Indeksy dla lepszej wydajności
CREATE INDEX idx_reports_status_priority ON reports(status, priority);
CREATE INDEX idx_reports_created_at_status ON reports(created_at, status);
CREATE INDEX idx_players_identifier ON players(identifier);
CREATE INDEX idx_players_admin_level ON players(admin_level);

-- Przykładowe zapytania użyteczne w aplikacji:

-- Pobranie wszystkich otwartych zgłoszeń z informacjami o graczach
-- SELECT * FROM reports_with_players WHERE status IN ('open', 'in-progress') ORDER BY priority DESC, created_at ASC;

-- Statystyki dla dashboardu admina
-- SELECT 
--     COUNT(*) as total,
--     SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
--     SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_count,
--     SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
--     SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_count
-- FROM reports;

-- Pobranie wiadomości dla konkretnego zgłoszenia
-- SELECT 
--     rm.*,
--     p.player_name as sender_name
-- FROM report_messages rm
-- JOIN players p ON rm.sender_id = p.id
-- WHERE rm.report_id = ? 
-- ORDER BY rm.created_at ASC;