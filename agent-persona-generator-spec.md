# Specyfikacja: Prosta aplikacja do generowania osobowości agenta

Aplikacja pozwala użytkownikowi zdefiniować „DNA” agenta (parametry osobowości, temperamentu, stylu komunikacji, roli), a następnie – z użyciem LLM – wygenerować komplet plików:

- `SOUL.md`
- `IDENTITY.md`
- opcjonalnie `USER.md`

Pliki te są przeznaczone np. dla agentów w środowisku OpenClaw.

---

## 1. Cel aplikacji

Aplikacja powinna umożliwiać:

1. **Tworzenie nowego agenta** na podstawie interaktywnego formularza ("DNA"):
   - wybór archetypu roli (np. dev, researcher, automation),
   - ustawienie cech temperamentu i stylu komunikacji,
   - wskazanie głównych domen/specjalizacji.

2. **Generowanie gotowych plików osobowości** przy użyciu LLM:
   - `SOUL.md` – zasady, styl, zachowanie agenta,
   - `IDENTITY.md` – tożsamość, nazwa, vibe,
   - `USER.md` – sposób traktowania użytkownika (opcjonalny / generowany, jeśli włączone).

3. **Podgląd i edycję wygenerowanych plików** przed eksportem.

4. **Eksport plików** w formie paczki (np. ZIP) i/lub snippetów konfiguracyjnych do OpenClaw.

Założenie: aplikacja opiera się na LLM do translacji "DNA" → naturalny język w plikach .md. Logika formularza i struktura "DNA" ma być możliwie prosta i zrozumiała, a szczegóły promptów i integracji z modelem zostają po stronie implementacji.

---

## 2. Główne scenariusze użycia

### 2.1. Stwórz nowego agenta

1. Użytkownik wybiera archetyp (np. "Developer", "Researcher").
2. Ustawia temperament i styl komunikacji (suwaki/przełączniki).
3. Wskazuje główne domeny (obszary, w których agent ma się czuć "jak u siebie").
4. Przegląda podsumowanie DNA.
5. Klika "Generuj" – aplikacja wysyła DNA do LLM, otrzymuje `SOUL.md` / `IDENTITY.md` / `USER.md`.
6. Użytkownik ogląda pliki, w razie potrzeby regeneruje lub ręcznie edytuje.
7. Eksportuje paczkę plików.

### 2.2. Edytuj istniejącego agenta

1. Użytkownik wkleja istniejące DNA (JSON) lub ładuje je z pliku.
2. Formularz wypełnia się odpowiednimi wartościami.
3. Użytkownik modyfikuje wybrane parametry.
4. Regeneruje pliki i eksportuje.

### 2.3. Klonuj agenta z modyfikacjami

1. Użytkownik wybiera istniejące DNA (np. z listy presetów / poprzednio zapisanych profilów).
2. Nadaje nową nazwę agentowi.
3. Dostosowuje kilka parametrów (np. więcej humoru, inna domena).
4. Generuje nowy zestaw plików.

---

## 3. Struktura aplikacji (ekrany / kroki)

### 3.1. Ekran startowy

Elementy:

- Krótki opis: czym jest aplikacja i do czego służy.
- 3 główne akcje:
  - **Nowy agent od zera**
  - **Nowy agent na bazie archetypu** (lista wstępnie zdefiniowanych osobowości)
  - **Załaduj istniejące DNA** (wklejenie JSON lub upload pliku)

Cel UX: szybkie wejście w tworzenie nowego profilu lub pracę na istniejącym.

---

### 3.2. Krok 1 – Archetyp / rola

Celem kroku jest przybliżone określenie funkcji agenta.

Elementy:

- Lista kart archetypów, np.:
  - General Assistant
  - Developer
  - Researcher
  - Automation / DevOps
  - PM / Organizer
  - Coach
  - Storyteller

Każda karta zawiera:

- nazwę,
- krótki opis (1–2 zdania),
- proste tagi (np. "techniczny", "kreatywny", "analityczny").

UX:

- Po kliknięciu archetypu w bocznym panelu pokazuje się opis wybranego archetypu.
- Użytkownik klika "Dalej", żeby przejść do ustawień temperamentu.

---

### 3.3. Krok 2 – Temperament i styl emocjonalny

Celem jest odwzorowanie bazowych cech typu: melancholijny, radosny, gniewny, wyniosły, itp.

**Parametry (suwaki lub selektory):**

- **Nastrój (valence)** – oś: "pesymistyczny ↔ neutralny ↔ optymistyczny".
- **Energia** – "spokojny ↔ pobudzony".
- **Ciepło** – "chłodny / zdystansowany ↔ ciepły / empatyczny".
- **Dominacja** – "łagodny / uległy ↔ dominujący / stanowczy".
- **Stabilność emocjonalna** – "reaktywny ↔ stabilny".

UX:

- Nad/sąsiadująco można dodać presety typu:
  - "Melancholijny"
  - "Radosny"
  - "Gniewny"
  - "Wyniosły"
  Kliknięcie presetów ustawia suwaki; użytkownik może je potem ręcznie korygować.
- Boczne mini-podsumowanie słowne (krótka fraza) generowane na podstawie ustawień lub przez LLM: np. "Spokojny, lekko melancholijny, ale ciepły i empatyczny".

---

### 3.4. Krok 3 – Styl komunikacji i pracy

Celem jest zdefiniowanie, **jak agent mówi i jak pracuje**.

**Sekcja: Styl wypowiedzi**

- Formalność – przełącznik/skala: "bardzo luźny ↔ neutralny ↔ formalny".
- Humor – skala 0–5 (od "zero żartów" do "sporo żartów").
- Bezpośredniość – "dyplomatyczny ↔ wprost".
- Długość odpowiedzi – wybór: "krótko", "średnio", "szczegółowo".
- Struktura:
  - preferencje: "listy punktowane", "narracyjnie", "mieszane" (np. checkboxy / radio).
- Poziom żargonu – "mało żargonu ↔ dużo żargonu".

**Sekcja: Styl pracy**

- Domyślna głębokość odpowiedzi – "overview ↔ deep dive".
- Styl tłumaczenia:
  - "od razu do konkretów",
  - "krok po kroku",
  - "najpierw teoria, potem przykład".
- Korzystanie z narzędzi – suwak "sporadycznie ↔ zawsze kiedy przyspiesza pracę".
- Tolerancja niepewności – "woli przyznać 'nie wiem' ↔ woli spekulować i szukać hipotez".

**Sekcja: Relacja z użytkownikiem**

- Sposób zwracania się do użytkownika (np. "Ty", "Pan/Pani", ksywka).
- Styl feedbacku – "delikatny ↔ szczery ↔ brutalnie szczery".
- Nacisk na działanie – "reaktywny (odpowiada na pytania) ↔ proaktywny (proponuje zadania i rozwiązania)".

UX:

- Na dole można pokazać krótkie, generowane podsumowanie: 2–3 zdania opisujące styl tego agenta (preview).

---

### 3.5. Krok 4 – Domeny i specjalizacja

Celem jest wskazanie obszarów, w których agent ma się specjalizować.

Elementy:

- Lista checkboxów / tagów (możliwość wyboru kilku):
  - Coding / Engineering
  - Research / Synthesizing
  - Automation / DevOps / Home Assistant
  - Writing / Editing
  - Planning / PM / Organization
  - Media / Music / Entertainment
  - + pole "Inne" (własny tag)

- Możliwość oznaczenia niektórych jako "priorytetowe" (np. max 2–3).

UX:

- Prosty tekst typu: "Agent będzie zachowywał się jak [rola] skupiony głównie na [domeny]".

---

### 3.6. Krok 5 – Podsumowanie DNA / tryb zaawansowany

Celem jest pokazanie kompletnej konfiguracji przed generacją plików.

Elementy:

- Czytelne podsumowanie:
  - podstawowe dane (nazwa, rola, język),
  - temperament,
  - styl komunikacji i pracy,
  - domeny.

- Widok JSON/struktury ("DNA") z opcją **Advanced Edit**:
  - w trybie zaawansowanym użytkownik może bezpośrednio edytować JSON (dla power userów),
  - prosty format, który potem będzie wejściem do LLM.

UX:

- Przycisk „Generuj pliki” dostępny dopiero po tym kroku.

---

### 3.7. Krok 6 – Generacja plików przez LLM

Po kliknięciu "Generuj":

1. Aplikacja tworzy payload dla LLM:
   - struktura DNA z poprzednich kroków,
   - opis docelowego formatu plików (`SOUL.md`, `IDENTITY.md`, opcjonalnie `USER.md`),
   - ewentualne przykładowe pliki jako few-shot.

2. LLM zwraca JSON z polami:

   ```json
   {
     "soul_md": "...",
     "identity_md": "...",
     "user_md": "..." // opcjonalne
   }
   ```

3. Aplikacja pokazuje wynik w postaci zakładek:
   - SOUL.md,
   - IDENTITY.md,
   - USER.md (jeśli generowany).

Każda zakładka powinna umożliwiać:

- edycję tekstu (markdown editor / prosta textarea),
- przycisk "Regeneruj tę sekcję" – ponowne wywołanie LLM z tym samym DNA + kontekstem,
- możliwość przywrócenia poprzedniej wersji (historia lokalna w ramach sesji).

---

### 3.8. Eksport

Opcje eksportu:

- **Pobierz paczkę**:
  - ZIP zawierający `SOUL.md`, `IDENTITY.md`, `USER.md` (jeśli generowany).

- **Snippety do OpenClaw**:
  - wygenerowany fragment JSON/JSON5 dla `openclaw.json`:

    ```json5
    "agents": {
      "entries": {
        "nowy-agent-id": {
          "label": "Przyjazny Researcher",
          "repo": "/ścieżka/do/repo/agenta"
        }
      }
    }
    ```

- **Kopiuj do schowka** dla poszczególnych plików.

---

## 4. Dodatkowe elementy UX

### 4.1. Presety temperamentu

Nad suwakami temperamentu można dodać przyciski presetów:

- Melancholijny
- Radosny
- Gniewny
- Wyniosły

Każdy preset ustawia zestaw wartości; użytkownik może je później korygować ręcznie.

### 4.2. Mini-preview odpowiedzi agenta

Po wygenerowaniu plików można dodać prosty komponent "Przetestuj agenta":

- pole tekstowe z pytaniem użytkownika,
- odpowiedź generowana przez LLM z użyciem wygenerowanego SOUL/IDENTITY jako system prompt (symulacja zachowania agenta).

To służy tylko jako UX-owy podgląd, nie jest częścią samego DNA.

### 4.3. Tryb "Simple" vs "Advanced"

- **Simple** – pokazuje tylko kluczowe suwaki:
  - rola, formalność, humor, bezpośredniość, długość odpowiedzi, 1–2 domeny.

- **Advanced** – odsłania wszystkie parametry temperamentu i szczegółowe cechy.

Użytkownik może przełączyć się między trybami; advanced zawsze pokazuje pełne DNA.

---

## 5. Zakres dla implementującego agenta (dev)

Ta specyfikacja skupia się na funkcjonalności i UX.

Implementujący agent powinien zająć się:

- wyborem technologii frontend/back-end (web/CLI/TUI – w zależności od wymagań),
- implementacją formularzy i przechowywania DNA,
- zdefiniowaniem JSON schema dla DNA (na bazie opisanych pól),
- integracją z LLM (provider, autoryzacja, limity, obsługa błędów),
- przygotowaniem promptów typu: "DNA → SOUL/IDENTITY/USER", w tym few-shotów,
- obsługą historii wersji wygenerowanych plików w ramach jednej sesji,
- mechanizmem eksportu (ZIP, snippety konfiguracyjne, kopiowanie do schowka),
- opcjonalnie: przechowywaniem presetów i zapisanych profili agentów.

Szczegóły techniczne (stack, architektura, konkretne endpointy do LLM) mogą zostać zaprojektowane osobno przez agenta odpowiedzialnego za implementację.