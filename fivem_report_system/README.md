## FiveM Report System - Instrukcja instalacji

### Wymagania
- Serwer FiveM
- Zasób [screenshot-basic](https://github.com/citizenfx/screenshot-basic) (wymagany do robienia zrzutów ekranu)
- (Opcjonalnie) Baza danych MySQL dla pełnej funkcjonalności

### Instalacja

1. **Pobierz pliki zasobu**:
   Skopiuj cały folder `fivem_report_system` do katalogu `resources` na twoim serwerze FiveM.

2. **Konfiguracja Discord Webhook**:
   - Utwórz webhook na swoim serwerze Discord
   - Otwórz plik `config.lua` i zastąp `TWÓJ_WEBHOOK_URL_DISCORD` i `TWÓJ_WEBHOOK_DLA_SCREENÓW` swoimi prawdziwymi adresami URL webhooków

3. **Dodaj zasób do server.cfg**:
   ```
   ensure screenshot-basic  # Upewnij się, że ten zasób jest załadowany
   ensure fivem_report_system
   ```

4. **Konfiguracja bazy danych (opcjonalna, ale zalecana)**:
   - Utwórz bazę danych MySQL na swoim serwerze
   - Zaimportuj schemat z pliku `database_schema.sql`
   - Skonfiguruj połączenie z bazą danych w swoim zasobie MySQL (np. oxmysql, mysql-async)

5. **Konfiguracja uprawnień admina**:
   - Domyślnie system używa ACE permissions
   - Dodaj do server.cfg:
   ```
   # Uprawnienia dla systemu zgłoszeń
   add_ace group.admin report.admin allow  # Grupa admin ma dostęp do systemu zgłoszeń
   add_ace group.moderator report.admin allow  # Grupa moderator ma dostęp do systemu zgłoszeń
   
   # Dodaj graczy do grup
   add_principal identifier.license:LICENCJA_ADMINA group.admin  # Zamień LICENCJA_ADMINA na prawdziwą licencję
   ```

### Komendy

- `/report` - Otwiera formularz zgłoszenia dla graczy
- `/reportlista` - Otwiera panel administratora (tylko dla adminów)
- `/reportstats` - Wyświetla statystyki zgłoszeń (tylko dla adminów)

### Funkcje

- **Dla graczy**:
  - Zgłaszanie problemów, bugów, innych graczy
  - Załączanie zrzutów ekranu
  - Komunikacja z adminami przez czat wewnętrzny

- **Dla adminów**:
  - Panel zarządzania zgłoszeniami
  - Filtrowanie i wyszukiwanie zgłoszeń
  - Zmiana statusu zgłoszeń
  - Przypisywanie zgłoszeń do adminów
  - Wewnętrzne notatki administratora
  - Teleportacja do gracza
  - Statystyki zgłoszeń

- **Integracje**:
  - Discord webhooks
  - Baza danych MySQL
  - System zrzutów ekranu

### Dostosowywanie

System został zaprojektowany tak, aby można go było łatwo dostosować:

1. **Wygląd UI**:
   - Edytuj `html/styles.css` aby zmienić kolory, czcionki i układy
   - Zmień `Config.UITheme` w `config.lua` aby przełączać między ciemnym i jasnym motywem

2. **Kategorie i priorytety**:
   - Edytuj sekcje `Config.Categories` i `Config.Priorities` w `config.lua`

3. **Kody dostępu adminów**:
   - Edytuj `Config.AdminCodes` w `config.lua`

4. **Powiadomienia i zachowanie**:
   - Dostosuj opcje w `config.lua`

### Rozwiązywanie problemów

- **UI się nie otwiera**: Upewnij się, że ścieżka do `ui_page` w `fxmanifest.lua` jest poprawna
- **Błędy NUI**: Sprawdź konsolę przeglądarki (F8 w grze, potem F12)
- **Brak uprawnień admina**: Sprawdź konfigurację ACE permissions w `server.cfg`
- **Problemy z webhookami**: Upewnij się, że adresy URL webhooków są poprawne i dostępne

### Wsparcie

Jeśli masz problemy lub pytania dotyczące tego zasobu, możesz skontaktować się z autorem za pośrednictwem:
- Discord: [TWÓJ_DISCORD]
- Forum: [TWÓJ_LINK_DO_FORUM]

---

© 2024 Twój Autor - Wszelkie prawa zastrzeżone