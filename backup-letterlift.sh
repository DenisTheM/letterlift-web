#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# LetterLift — Automatisches Backup-Script
# Sichert täglich an 2 Orte: Lokal + NAS
# ═══════════════════════════════════════════════════════════════

# ── Konfiguration ──────────────────────────────────────────────
PROJEKT_NAME="letterlift-web"
PROJEKT_ORDNER="/Users/denisscheller/Projekte/letterlift-web"
LOKAL_SICHERUNG="/Users/denisscheller/Projekte/letterlift-web/Sicherungen"
NAS_SICHERUNG="/Volumes/Data/Sicherungen LetterLift"

# ── Datum & Duplikat-Check ─────────────────────────────────────
HEUTE=$(date +%Y-%m-%d)
LOKAL_ZIEL="$LOKAL_SICHERUNG/$HEUTE"
NAS_ZIEL="$NAS_SICHERUNG/$HEUTE"
LOCKFILE="/tmp/backup-${PROJEKT_NAME}-${HEUTE}.lock"

# Farben
GRUEN="\033[0;32m"
GELB="\033[0;33m"
ROT="\033[0;31m"
BLAU="\033[0;34m"
RESET="\033[0m"

log()  { echo -e "${BLAU}[$(date +%H:%M:%S)]${RESET} $1"; }
ok()   { echo -e "${GRUEN}  ✓${RESET} $1"; }
warn() { echo -e "${GELB}  ⚠${RESET} $1"; }
err()  { echo -e "${ROT}  ✗${RESET} $1"; }

echo ""
echo -e "${BLAU}═══════════════════════════════════════════════${RESET}"
echo -e "${BLAU}  📦 ${PROJEKT_NAME} — Backup${RESET}"
echo -e "${BLAU}═══════════════════════════════════════════════${RESET}"
echo ""

# ── Duplikat-Schutz (nur 1x pro Tag) ──────────────────────────
if [ -f "$LOCKFILE" ]; then
    warn "Backup für heute ($HEUTE) bereits erledigt. Überspringe."
    exit 0
fi

# ── Projektordner prüfen ───────────────────────────────────────
if [ ! -d "$PROJEKT_ORDNER" ]; then
    err "Projektordner nicht gefunden: $PROJEKT_ORDNER"
    exit 1
fi

# ── rsync-Optionen (welche Dateien gesichert werden) ───────────
RSYNC_OPTS=(
    -av --progress
    --exclude='node_modules'
    --exclude='.next'
    --exclude='.vercel'
    --exclude='Sicherungen'
    --exclude='.git/objects'
    --include='*/'
    --include='*.html'
    --include='*.css'
    --include='*.js'
    --include='*.jsx'
    --include='*.tsx'
    --include='*.ts'
    --include='*.json'
    --include='*.sql'
    --include='*.md'
    --include='*.png'
    --include='*.jpg'
    --include='*.jpeg'
    --include='*.gif'
    --include='*.webp'
    --include='*.svg'
    --include='*.ico'
    --include='*.woff'
    --include='*.woff2'
    --include='*.ttf'
    --include='*.otf'
    --include='*.eot'
    --include='*.env'
    --include='*.env.*'
    --include='.gitignore'
    --include='.gitconfig'
    --include='*.sh'
    --include='*.plist'
    --include='*.toml'
    --include='*.yaml'
    --include='*.yml'
    --include='*.xml'
    --include='*.txt'
    --include='*.lock'
    --exclude='*'
)

# ── 1. Lokales Backup ─────────────────────────────────────────
log "Lokales Backup → $LOKAL_ZIEL"
mkdir -p "$LOKAL_ZIEL"
rsync "${RSYNC_OPTS[@]}" "$PROJEKT_ORDNER/" "$LOKAL_ZIEL/"

if [ $? -eq 0 ]; then
    GROESSE=$(du -sh "$LOKAL_ZIEL" | cut -f1)
    ok "Lokal gesichert ($GROESSE)"
else
    err "Lokales Backup fehlgeschlagen!"
fi

# ── 2. NAS-Backup (fehlertolerant) ────────────────────────────
log "NAS-Backup → $NAS_ZIEL"

if [ -d "$NAS_SICHERUNG" ]; then
    mkdir -p "$NAS_ZIEL"
    rsync "${RSYNC_OPTS[@]}" "$PROJEKT_ORDNER/" "$NAS_ZIEL/"

    if [ $? -eq 0 ]; then
        GROESSE_NAS=$(du -sh "$NAS_ZIEL" | cut -f1)
        ok "NAS gesichert ($GROESSE_NAS)"
    else
        warn "NAS-Backup hatte Fehler (Dateien evtl. teilweise gesichert)"
    fi
else
    warn "NAS nicht verbunden — NAS-Backup übersprungen"
fi

# ── 3. Alte Sicherungen aufräumen (> 30 Tage) ─────────────────
log "Räume Sicherungen älter als 30 Tage auf..."

aufgeraeumt=0

# Lokal aufräumen
if [ -d "$LOKAL_SICHERUNG" ]; then
    find "$LOKAL_SICHERUNG" -maxdepth 1 -type d -name "20*" -mtime +30 | while read dir; do
        rm -rf "$dir"
        ((aufgeraeumt++))
    done
fi

# NAS aufräumen
if [ -d "$NAS_SICHERUNG" ]; then
    find "$NAS_SICHERUNG" -maxdepth 1 -type d -name "20*" -mtime +30 | while read dir; do
        rm -rf "$dir"
        ((aufgeraeumt++))
    done
fi

ok "Aufräumen erledigt"

# ── Lockfile setzen (verhindert Duplikate) ─────────────────────
touch "$LOCKFILE"

# ── Fertig ─────────────────────────────────────────────────────
echo ""
echo -e "${GRUEN}═══════════════════════════════════════════════${RESET}"
echo -e "${GRUEN}  ✅ Backup abgeschlossen — $HEUTE${RESET}"
echo -e "${GRUEN}═══════════════════════════════════════════════${RESET}"
echo ""
