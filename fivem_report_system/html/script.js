/* fivem_report_system/html/script.js */
// Główne zmienne
let playerData = {
    id: 0,
    name: "Gracz"
};
let reports = [];
let currentReport = null;
let attachments = [];
let isAdmin = false;

// Nasłuchiwanie wiadomości z gry
window.addEventListener('message', function(event) {
    const data = event.data;
    
    switch(data.type) {
        case 'showReportMenu':
            showReportMenu(data.playerData);
            break;
        case 'loadReports':
            loadReports(data.reports);
            break;
        case 'screenshotTaken':
            addAttachment(data.imageUrl);
            break;
        case 'newMessage':
            addMessage(data.reportId, data.message);
            break;
        case 'showImageViewer':
            showImageViewer(data.imageUrl);
            break;
        case 'newReportNotification':
            showNotification(`Nowe zgłoszenie od ${data.report.playerName}: ${data.report.title}`);
            break;
    }
});

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
});

// Inicjalizacja nasłuchiwania zdarzeń
function initEventListeners() {
    // Przyciski zamykania
    document.getElementById('closeReportBtn').addEventListener('click', closeUI);
    document.getElementById('cancelReportBtn').addEventListener('click', closeUI);
    document.getElementById('closeAdminBtn').addEventListener('click', closeUI);
    document.getElementById('closeDetailsBtn').addEventListener('click', function() {
        document.getElementById('reportDetails').style.display = 'none';
        document.getElementById('adminMenu').style.display = 'block';
    });
    document.getElementById('closeImageBtn').addEventListener('click', function() {
        document.getElementById('imageViewer').style.display = 'none';
    });
    
    // Formularz zgłoszenia
    document.getElementById('reportForm').addEventListener('submit', submitReport);
    document.getElementById('takeScreenshot').addEventListener('click', takeScreenshot);
    
    // Kategoria zgłoszenia - pokaż/ukryj pola zgłaszanego gracza
    document.getElementById('category').addEventListener('change', function() {
        const playerReportFields = document.querySelectorAll('.player-report');
        const isPlayerReport = this.value === 'player' || this.value === 'cheating' || this.value === 'griefing';
        
        playerReportFields.forEach(field => {
            field.style.display = isPlayerReport ? 'block' : 'none';
        });
    });
    
    // Zakładki w panelu admina
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Usuń klasę active ze wszystkich przycisków
            tabButtons.forEach(b => b.classList.remove('active'));
            // Dodaj klasę active do klikniętego przycisku
            this.classList.add('active');
            
            // Ukryj wszystkie panele zakładek
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.style.display = 'none';
            });
            
            // Pokaż wybraną zakładkę
            const tabId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).style.display = 'block';
            
            // Jeśli pokazujemy statystyki, zaktualizuj je
            if (this.getAttribute('data-tab') === 'stats') {
                updateStats();
            }
        });
    });
    
    // Filtrowanie zgłoszeń
    document.getElementById('searchReports').addEventListener('input', filterReports);
    document.getElementById('statusFilter').addEventListener('change', filterReports);
    document.getElementById('categoryFilter').addEventListener('change', filterReports);
    document.getElementById('priorityFilter').addEventListener('change', filterReports);
    
    // Akcje w szczegółach zgłoszenia
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!currentReport) return;
            const status = this.getAttribute('data-status');
            updateReportStatus(currentReport.id, status);
        });
    });
    
    document.getElementById('assignToMeBtn').addEventListener('click', function() {
        if (!currentReport) return;
        assignReportToMe(currentReport.id);
    });
    
    document.getElementById('teleportToPlayerBtn').addEventListener('click', function() {
        if (!currentReport) return;
        teleportToPlayer(currentReport.playerId);
    });
    
    document.getElementById('saveNotesBtn').addEventListener('click', function() {
        if (!currentReport) return;
        saveAdminNotes(currentReport.id);
    });
    
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
}

// Funkcje UI
function showReportMenu(data) {
    playerData = data;
    document.getElementById('reportMenu').style.display = 'block';
    document.getElementById('adminMenu').style.display = 'none';
    document.getElementById('reportDetails').style.display = 'none';
    
    // Resetuj formularz
    document.getElementById('reportForm').reset();
    document.getElementById('attachments-container').innerHTML = '';
    attachments = [];
}

function closeUI() {
    document.getElementById('reportMenu').style.display = 'none';
    document.getElementById('adminMenu').style.display = 'none';
    document.getElementById('reportDetails').style.display = 'none';
    document.getElementById('imageViewer').style.display = 'none';
    
    // Wyślij wiadomość do gry
    fetch(`https://${GetParentResourceName()}/closeUI`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
}

function submitReport(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        category: document.getElementById('category').value,
        priority: document.getElementById('priority').value,
        reportedPlayerId: document.getElementById('reportedPlayerId').value,
        reportedPlayerName: document.getElementById('reportedPlayerName').value,
        attachments: attachments,
        playerId: playerData.id,
        playerName: playerData.name
    };
    
    // Wyślij zgłoszenie do gry
    fetch(`https://${GetParentResourceName()}/submitReport`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              showNotification('Zgłoszenie zostało wysłane!');
              closeUI();
          }
      });
}

function takeScreenshot() {
    // Wyślij żądanie zrzutu ekranu do gry
    fetch(`https://${GetParentResourceName()}/takeScreenshot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });
}

function addAttachment(url) {
    if (attachments.length >= 5) {
        showNotification('Możesz dodać maksymalnie 5 załączników!', 'error');
        return;
    }
    
    attachments.push(url);
    
    const container = document.getElementById('attachments-container');
    const attachmentEl = document.createElement('div');
    attachmentEl.className = 'attachment';
    attachmentEl.innerHTML = `
        <img src="${url}" alt="Załącznik">
        <div class="remove-btn" data-index="${attachments.length - 1}">
            <i class="fas fa-times"></i>
        </div>
    `;
    
    container.appendChild(attachmentEl);
    
    // Dodaj nasłuchiwanie kliknięcia na przycisk usuwania
    attachmentEl.querySelector('.remove-btn').addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        attachments.splice(index, 1);
        container.removeChild(attachmentEl);
        
        // Zaktualizuj indeksy pozostałych załączników
        const removeBtns = container.querySelectorAll('.remove-btn');
        removeBtns.forEach((btn, i) => {
            btn.setAttribute('data-index', i);
        });
    });
}

function loadReports(reportData) {
    isAdmin = true;
    reports = reportData;
    
    document.getElementById('reportMenu').style.display = 'none';
    document.getElementById('adminMenu').style.display = 'block';
    document.getElementById('reportDetails').style.display = 'none';
    
    // Pokaż zakładkę zgłoszeń
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('reports-tab').style.display = 'block';
    document.getElementById('stats-tab').style.display = 'none';
    document.querySelector('[data-tab="reports"]').classList.add('active');
    
    filterReports();
    updateStats();
}

function filterReports() {
    const searchTerm = document.getElementById('searchReports').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    const filteredReports = Object.values(reports).filter(report => {
        // Filtrowanie po tekście
        const matchesSearch = 
            report.title.toLowerCase().includes(searchTerm) || 
            report.description.toLowerCase().includes(searchTerm) ||
            report.playerName.toLowerCase().includes(searchTerm) ||
            (report.reportedPlayerName && report.reportedPlayerName.toLowerCase().includes(searchTerm));
        
        // Filtrowanie po statusie
        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        
        // Filtrowanie po kategorii
        const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
        
        // Filtrowanie po priorytecie
        const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
        
        return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    });
    
    renderReportsList(filteredReports);
}

function renderReportsList(filteredReports) {
    const reportsList = document.getElementById('reportsList');
    
    if (filteredReports.length === 0) {
        reportsList.innerHTML = `
            <div class="no-reports">
                <i class="fas fa-inbox"></i>
                <p>Brak zgłoszeń spełniających kryteria</p>
            </div>
        `;
        return;
    }
    
    reportsList.innerHTML = '';
    
    // Sortuj zgłoszenia - najpierw po priorytecie, potem po dacie (najnowsze na górze)
    const sortedReports = filteredReports.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.createdAt - a.createdAt;
    });
    
    sortedReports.forEach(report => {
        const reportItem = document.createElement('div');
        reportItem.className = 'report-item';
        reportItem.setAttribute('data-id', report.id);
        
        // Określ klasy dla statusu i priorytetu
        const statusClass = getStatusClass(report.status);
        const priorityClass = getPriorityClass(report.priority);
        
        // Formatuj datę
        const date = new Date(report.createdAt * 1000).toLocaleString('pl-PL');
        
        reportItem.innerHTML = `
            <div class="report-item-header">
                <div class="report-item-title">${report.title}</div>
                <div class="report-item-badges">
                    <span class="badge ${statusClass}">${getStatusText(report.status)}</span>
                    <span class="badge ${priorityClass}">${getPriorityText(report.priority)}</span>
                </div>
            </div>
            <div class="report-item-meta">
                <div><i class="fas fa-user"></i> ${report.playerName} (ID: ${report.playerId})</div>
                <div><i class="fas fa-calendar-alt"></i> ${date}</div>
                ${report.assignedAdmin ? `<div><i class="fas fa-user-shield"></i> Przypisano: ${report.assignedAdmin}</div>` : ''}
            </div>
            <div class="report-item-description">${report.description}</div>
        `;
        
        reportItem.addEventListener('click', function() {
            const reportId = this.getAttribute('data-id');
            showReportDetails(reportId);
        });
        
        reportsList.appendChild(reportItem);
    });
}

function showReportDetails(reportId) {
    currentReport = reports[reportId];
    
    if (!currentReport) return;
    
    document.getElementById('adminMenu').style.display = 'none';
    document.getElementById('reportDetails').style.display = 'block';
    
    // Ustaw informacje o zgłoszeniu
    document.getElementById('reportIdDisplay').textContent = `#${currentReport.id}`;
    document.getElementById('reportTitle').textContent = currentReport.title;
    document.getElementById('categoryBadge').textContent = getCategoryText(currentReport.category);
    document.getElementById('categoryBadge').className = `badge ${getCategoryClass(currentReport.category)}`;
    document.getElementById('priorityBadge').textContent = getPriorityText(currentReport.priority);
    document.getElementById('priorityBadge').className = `badge ${getPriorityClass(currentReport.priority)}`;
    document.getElementById('statusBadge').textContent = getStatusText(currentReport.status);
    document.getElementById('statusBadge').className = `badge ${getStatusClass(currentReport.status)}`;
    
    document.getElementById('playerInfo').textContent = `Gracz: ${currentReport.playerName} (ID: ${currentReport.playerId})`;
    
    const reportedPlayerInfo = document.getElementById('reportedPlayerInfo');
    if (currentReport.reportedPlayerId && currentReport.reportedPlayerName) {
        reportedPlayerInfo.style.display = 'block';
        reportedPlayerInfo.querySelector('span').textContent = `Zgłoszony: ${currentReport.reportedPlayerName} (ID: ${currentReport.reportedPlayerId})`;
    } else {
        reportedPlayerInfo.style.display = 'none';
    }
    
    document.getElementById('reportDate').textContent = `Data: ${new Date(currentReport.createdAt * 1000).toLocaleString('pl-PL')}`;
    document.getElementById('reportDescription').textContent = currentReport.description;
    
    // Załączniki
    const attachmentsGrid = document.getElementById('attachmentsGrid');
    attachmentsGrid.innerHTML = '';
    
    if (currentReport.attachments && currentReport.attachments.length > 0) {
        document.getElementById('attachmentsCount').textContent = `(${currentReport.attachments.length})`;
        
        currentReport.attachments.forEach((url, index) => {
            const attachmentEl = document.createElement('div');
            attachmentEl.className = 'attachment-thumbnail';
            attachmentEl.innerHTML = `<img src="${url}" alt="Załącznik ${index + 1}">`;
            
            attachmentEl.addEventListener('click', function() {
                showImageViewer(url);
            });
            
            attachmentsGrid.appendChild(attachmentEl);
        });
    } else {
        document.getElementById('attachmentsCount').textContent = '(0)';
        attachmentsGrid.innerHTML = '<p class="text-secondary">Brak załączników</p>';
    }
    
    // Notatki admina
    document.getElementById('adminNotes').value = currentReport.adminNotes || '';
    
    // Wiadomości czatu
    renderMessages();
    
    // Zaznacz aktywny status
    document.querySelectorAll('.status-btn').forEach(btn => {
        const status = btn.getAttribute('data-status');
        if (status === currentReport.status) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function renderMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    if (!currentReport || !currentReport.messages || currentReport.messages.length === 0) {
        messagesContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                <i class="fas fa-comments" style="font-size: 24px; margin-bottom: 10px;"></i>
                <p>Brak wiadomości. Rozpocznij konwersację.</p>
            </div>
        `;
        return;
    }
    
    currentReport.messages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${msg.isAdmin ? 'admin' : 'player'}`;
        
        if (msg.isInternal) {
            messageEl.classList.add('message-internal');
        }
        
        const time = new Date(msg.timestamp * 1000).toLocaleTimeString('pl-PL');
        
        messageEl.innerHTML = `
            <div class="message-info">
                <span class="message-sender">${msg.sender}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-bubble">
                ${msg.isInternal ? '<i class="fas fa-eye-slash" style="margin-right: 5px;"></i>' : ''}
                ${msg.message}
            </div>
        `;
        
        messagesContainer.appendChild(messageEl);
    });
    
    // Przewiń do ostatniej wiadomości
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showImageViewer(url) {
    const viewer = document.getElementById('imageViewer');
    const image = document.getElementById('viewerImage');
    
    image.src = url;
    viewer.style.display = 'flex';
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    
    notificationMessage.textContent = message;
    
    // Ustaw kolor w zależności od typu
    if (type === 'error') {
        notification.style.borderLeftColor = 'var(--danger)';
        notification.querySelector('.notification-icon').style.backgroundColor = 'var(--danger)';
    } else if (type === 'warning') {
        notification.style.borderLeftColor = 'var(--warning)';
        notification.querySelector('.notification-icon').style.backgroundColor = 'var(--warning)';
    } else {
        notification.style.borderLeftColor = 'var(--primary)';
        notification.querySelector('.notification-icon').style.backgroundColor = 'var(--primary)';
    }
    
    notification.classList.add('show');
    
    // Ukryj powiadomienie po 5 sekundach
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Funkcje akcji
function updateReportStatus(reportId, status) {
    fetch(`https://${GetParentResourceName()}/updateReport`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reportId: reportId,
            updates: {
                status: status
            }
        })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              // Aktualizuj lokalnie
              currentReport.status = status;
              document.getElementById('statusBadge').textContent = getStatusText(status);
              document.getElementById('statusBadge').className = `badge ${getStatusClass(status)}`;
              
              // Zaznacz aktywny przycisk
              document.querySelectorAll('.status-btn').forEach(btn => {
                  if (btn.getAttribute('data-status') === status) {
                      btn.classList.add('active');
                  } else {
                      btn.classList.remove('active');
                  }
              });
              
              showNotification(`Status zmieniony na: ${getStatusText(status)}`);
          }
      });
}

function assignReportToMe(reportId) {
    fetch(`https://${GetParentResourceName()}/updateReport`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reportId: reportId,
            updates: {
                assignedAdmin: playerData.name,
                status: 'in-progress'
            }
        })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              // Aktualizuj lokalnie
              currentReport.assignedAdmin = playerData.name;
              currentReport.status = 'in-progress';
              
              document.getElementById('statusBadge').textContent = getStatusText('in-progress');
              document.getElementById('statusBadge').className = `badge ${getStatusClass('in-progress')}`;
              
              // Zaznacz aktywny przycisk
              document.querySelectorAll('.status-btn').forEach(btn => {
                  if (btn.getAttribute('data-status') === 'in-progress') {
                      btn.classList.add('active');
                  } else {
                      btn.classList.remove('active');
                  }
              });
              
              showNotification('Zgłoszenie przypisane do Ciebie');
          }
      });
}

function saveAdminNotes(reportId) {
    const notes = document.getElementById('adminNotes').value;
    
    fetch(`https://${GetParentResourceName()}/updateReport`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reportId: reportId,
            updates: {
                adminNotes: notes
            }
        })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              // Aktualizuj lokalnie
              currentReport.adminNotes = notes;
              showNotification('Notatki zapisane');
          }
      });
}

function teleportToPlayer(playerId) {
    fetch(`https://${GetParentResourceName()}/teleportToPlayer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            playerId: playerId
        })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              showNotification(`Teleportowano do gracza ID: ${playerId}`);
              closeUI();
          } else if (data.error) {
              showNotification(data.error, 'error');
          }
      });
}

function sendMessage() {
    if (!currentReport) return;
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    const isInternal = document.getElementById('internalMessage').checked;
    
    fetch(`https://${GetParentResourceName()}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            reportId: currentReport.id,
            message: message,
            isInternal: isInternal
        })
    }).then(response => response.json())
      .then(data => {
          if (data.success) {
              messageInput.value = '';
              
              // Dodaj wiadomość lokalnie
              const newMessage = {
                  id: currentReport.messages ? currentReport.messages.length + 1 : 1,
                  sender: playerData.name,
                  isAdmin: isAdmin,
                  message: message,
                  isInternal: isInternal,
                  timestamp: Math.floor(Date.now() / 1000)
              };
              
              if (!currentReport.messages) {
                  currentReport.messages = [];
              }
              
              currentReport.messages.push(newMessage);
              renderMessages();
          }
      });
}

function addMessage(reportId, message) {
    // Aktualizuj wiadomości w aktualnie otwartym zgłoszeniu
    if (currentReport && currentReport.id === reportId) {
        if (!currentReport.messages) {
            currentReport.messages = [];
        }
        
        currentReport.messages.push(message);
        renderMessages();
    }
    
    // Aktualizuj zgłoszenie w pełnej liście
    if (reports[reportId]) {
        if (!reports[reportId].messages) {
            reports[reportId].messages = [];
        }
        
        reports[reportId].messages.push(message);
    }
}

function updateStats() {
    // Zlicz statystyki
    let stats = {
        total: Object.keys(reports).length,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        categories: {},
        priorities: {}
    };
    
    Object.values(reports).forEach(report => {
        // Statusy
        if (report.status === 'open') stats.open++;
        else if (report.status === 'in-progress') stats.inProgress++;
        else if (report.status === 'resolved') stats.resolved++;
        else if (report.status === 'closed') stats.closed++;
        
        // Kategorie
        if (!stats.categories[report.category]) {
            stats.categories[report.category] = 0;
        }
        stats.categories[report.category]++;
        
        // Priorytety
        if (!stats.priorities[report.priority]) {
            stats.priorities[report.priority] = 0;
        }
        stats.priorities[report.priority]++;
    });
    
    // Ustaw liczniki
    document.getElementById('totalReports').textContent = stats.total;
    document.getElementById('openReports').textContent = stats.open;
    document.getElementById('inProgressReports').textContent = stats.inProgress;
    document.getElementById('resolvedReports').textContent = stats.resolved;
    
    // Rysuj wykresy
    renderCategoryChart(stats.categories);
    renderPriorityChart(stats.priorities);
}

// Funkcje wykresów
let categoryChart = null;
let priorityChart = null;

function renderCategoryChart(categories) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    // Zniszcz istniejący wykres
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const labels = [];
    const data = [];
    const colors = [];
    
    for (const category in categories) {
        labels.push(getCategoryText(category));
        data.push(categories[category]);
        colors.push(getCategoryColor(category));
    }
    
    categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'white'
                    }
                }
            }
        }
    });
}

function renderPriorityChart(priorities) {
    const ctx = document.getElementById('priorityChart').getContext('2d');
    
    // Zniszcz istniejący wykres
    if (priorityChart) {
        priorityChart.destroy();
    }
    
    const labels = [];
    const data = [];
    const colors = [];
    
    // Upewnij się, że priorytety są w odpowiedniej kolejności
    const priorityOrder = ['low', 'medium', 'high', 'urgent'];
    
    priorityOrder.forEach(priority => {
        if (priorities[priority]) {
            labels.push(getPriorityText(priority));
            data.push(priorities[priority]);
            colors.push(getPriorityColor(priority));
        }
    });
    
    priorityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Zgłoszenia',
                data: data,
                backgroundColor: colors,
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Funkcje pomocnicze
function getStatusText(status) {
    switch(status) {
        case 'open': return 'Otwarte';
        case 'in-progress': return 'W trakcie';
        case 'resolved': return 'Rozwiązane';
        case 'closed': return 'Zamknięte';
        default: return 'Nieznany';
    }
}

function getStatusClass(status) {
    switch(status) {
        case 'open': return 'badge-warning';
        case 'in-progress': return 'badge-info';
        case 'resolved': return 'badge-success';
        case 'closed': return 'badge-secondary';
        default: return 'badge-secondary';
    }
}

function getPriorityText(priority) {
    switch(priority) {
        case 'low': return 'Niski';
        case 'medium': return 'Średni';
        case 'high': return 'Wysoki';
        case 'urgent': return 'Pilny';
        default: return 'Nieznany';
    }
}

function getPriorityClass(priority) {
    switch(priority) {
        case 'low': return 'badge-success';
        case 'medium': return 'badge-info';
        case 'high': return 'badge-warning';
        case 'urgent': return 'badge-danger';
        default: return 'badge-secondary';
    }
}

function getPriorityColor(priority) {
    switch(priority) {
        case 'low': return '#10b981';
        case 'medium': return '#3b82f6';
        case 'high': return '#f59e0b';
        case 'urgent': return '#ef4444';
        default: return '#94a3b8';
    }
}

function getCategoryText(category) {
    switch(category) {
        case 'bug': return 'Bug/Błąd';
        case 'player': return 'Zgłoszenie gracza';
        case 'cheating': return 'Cheating';
        case 'griefing': return 'Griefing';
        case 'other': return 'Inne';
        default: return 'Nieznana';
    }
}

function getCategoryClass(category) {
    switch(category) {
        case 'bug': return 'badge-warning';
        case 'player': return 'badge-primary';
        case 'cheating': return 'badge-danger';
        case 'griefing': return 'badge-warning';
        case 'other': return 'badge-secondary';
        default: return 'badge-secondary';
    }
}

function getCategoryColor(category) {
    switch(category) {
        case 'bug': return '#f59e0b';
        case 'player': return '#7c3aed';
        case 'cheating': return '#ef4444';
        case 'griefing': return '#f59e0b';
        case 'other': return '#94a3b8';
        default: return '#94a3b8';
    }
}

// Funkcja pomocnicza do pobierania nazwy zasobu
function GetParentResourceName() {
    return 'fivem_report_system';
}