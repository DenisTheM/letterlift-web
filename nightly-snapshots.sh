
  # ─── 3. DB Schema Snapshot (LetterLift_DB_Schema.md) ───
  DB_OUTPUT="LetterLift_DB_Schema.md"
  if command -v supabase &>/dev/null; then
    PGURL=$(supabase db url --project-ref hqcrvmepmglrzcsnekiv 2>/dev/null || echo "")
    if [ -n "$PGURL" ] && command -v psql &>/dev/null; then
      {
        echo "# LetterLift – Supabase DB Schema"
        echo "> Erstellt am: ${TIMESTAMP}"
        echo ""
        psql "$PGURL" -t -A -c "
          SELECT table_name FROM information_schema.tables
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          ORDER BY table_name;
        " 2>/dev/null | while read -r tbl; do
          echo "## ${tbl}"
          echo "| Spalte | Typ | Nullable | Default |"
          echo "|--------|-----|----------|---------|"
          psql "$PGURL" -t -A -F'|' -c "
            SELECT column_name, data_type || COALESCE('(' || character_maximum_length || ')', ''),
                   is_nullable, COALESCE(column_default, '')
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${tbl}'
            ORDER BY ordinal_position;
          " 2>/dev/null | while IFS='|' read -r col typ nul def; do
            echo "| ${col} | ${typ} | ${nul} | ${def} |"
          done
          echo ""
        done
      } > "${DB_OUTPUT}"
      echo "✅ ${DB_OUTPUT}"
    else
      echo "⚠️  DB-URL oder psql nicht verfügbar – DB-Snapshot übersprungen"
    fi
  fi
