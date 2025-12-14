#!/usr/bin/env bash
set -e

FILE="env.local"

if [ ! -f "$FILE" ]; then
  echo "❌ env.local tidak ditemukan"
  exit 1
fi

echo "▶ Parsing & menjalankan env.local (safe mode)"
echo "-------------------------------------------"

while IFS= read -r line || [ -n "$line" ]; do
  # skip kosong & komentar
  [[ -z "$line" || "$line" =~ ^# ]] && continue

  # blok perintah berbahaya
  if echo "$line" | grep -Eiq "(sudo|su |backdoor|apt-get|rm -rf|chmod 777|mkfs)"; then
    echo "⚠️ DIBLOK (unsafe): $line"
    continue
  fi

  # export variable
  if echo "$line" | grep -Eq '^[A-Za-z_][A-Za-z0-9_]*='; then
    export "$line"
    echo "✓ ENV SET: $line"
    continue
  fi

  # export dengan keyword export
  if echo "$line" | grep -Eq '^export '; then
    eval "$line"
    echo "✓ EXPORT: $line"
    continue
  fi

  # command biasa (AMAN)
  echo "▶ RUN: $line"
  eval "$line" || echo "⚠️ Gagal: $line"

done < "$FILE"

echo "-------------------------------------------"
echo "▶ ENV AKTIF:"
env | grep -E "AI_|OLLAMA|ENTERPRISE|CACHED|VIRUS|RUN"

echo "-------------------------------------------"
echo "▶ Menjalankan aplikasi jika ada"

if [ -f package.json ]; then
  npm install && npm start
elif [ -f app.py ]; then
  python3 app.py
elif [ -f main.sh ]; then
  bash main.sh
else
  echo "⚠️ Tidak ada aplikasi utama ditemukan"
fi

echo "✅ SELESAI"
