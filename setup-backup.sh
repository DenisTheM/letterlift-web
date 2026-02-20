#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# LetterLift — Backup Setup (einmalig ausführen)
# Richtet automatisches tägliches Backup ein
# ═══════════════════════════════════════════════════════════════

GRUEN="\033[0;32m"
BLAU="\033[0;34m"
ROT="\033[0;31m"
RESET="\033[0m"

PROJEKT="/Users/denisscheller/Projekte/letterlift-web"
PLIST_NAME="ch.letterlift.backup.plist"
LAUNCH_DIR="$HOME/Library/LaunchAgents"

echo ""
echo -e "${BLAU}═══════════════════════════════════════════════${RESET}"
echo -e "${BLAU}  🔧 LetterLift Backup — Einrichtung${RESET}"
echo -e "${BLAU}═══════════════════════════════════════════════${RESET}"
echo ""

# ── 1. Backup-Script an den richtigen Ort kopieren ─────────────
echo -e "${BLAU}[1/4]${RESET} Backup-Script installieren..."
cp "$(dirname "$0")/backup-letterlift.sh" "$PROJEKT/backup-letterlift.sh"
chmod +x "$PROJEKT/backup-letterlift.sh"
echo -e "${GRUEN}  ✓${RESET} Script installiert"

# ── 2. Sicherungsordner erstellen ──────────────────────────────
echo -e "${BLAU}[2/4]${RESET} Sicherungsordner erstellen..."
mkdir -p "$PROJEKT/Sicherungen"
echo -e "${GRUEN}  ✓${RESET} Ordner bereit"

# ── 3. Launch Agent installieren ───────────────────────────────
echo -e "${BLAU}[3/4]${RESET} Zeitplan einrichten (täglich 22:00 Uhr)..."

mkdir -p "$LAUNCH_DIR"

# Falls schon vorhanden, zuerst entladen
if launchctl list | grep -q "ch.letterlift.backup"; then
    launchctl unload "$LAUNCH_DIR/$PLIST_NAME" 2>/dev/null
fi

cp "$(dirname "$0")/$PLIST_NAME" "$LAUNCH_DIR/$PLIST_NAME"
launchctl load "$LAUNCH_DIR/$PLIST_NAME"
echo -e "${GRUEN}  ✓${RESET} Zeitplan aktiv"

# ── 4. Sicherungen in .gitignore eintragen ────────────────────
echo -e "${BLAU}[4/4]${RESET} .gitignore aktualisieren..."
GITIGNORE="$PROJEKT/.gitignore"
if [ -f "$GITIGNORE" ]; then
    if ! grep -q "Sicherungen/" "$GITIGNORE"; then
        echo "" >> "$GITIGNORE"
        echo "# Lokale Backups" >> "$GITIGNORE"
        echo "Sicherungen/" >> "$GITIGNORE"
        echo -e "${GRUEN}  ✓${RESET} 'Sicherungen/' zur .gitignore hinzugefügt"
    else
        echo -e "${GRUEN}  ✓${RESET} Bereits in .gitignore"
    fi
else
    echo "Sicherungen/" > "$GITIGNORE"
    echo -e "${GRUEN}  ✓${RESET} .gitignore erstellt"
fi

# ── Fertig ─────────────────────────────────────────────────────
echo ""
echo -e "${GRUEN}═══════════════════════════════════════════════${RESET}"
echo -e "${GRUEN}  ✅ Einrichtung abgeschlossen!${RESET}"
echo -e "${GRUEN}═══════════════════════════════════════════════${RESET}"
echo ""
echo "  📅 Backup läuft täglich um 22:00 Uhr automatisch"
echo "  💤 Falls der Mac schläft: wird beim Aufwachen nachgeholt"
echo "  📂 Lokal:  $PROJEKT/Sicherungen/"
echo "  💾 NAS:    /Volumes/Data/Sicherungen LetterLift/"
echo ""
echo "  Manuell starten:  bash $PROJEKT/backup-letterlift.sh"
echo "  Log anschauen:    cat /tmp/letterlift-backup.log"
echo ""
