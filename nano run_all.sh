#!/bin/bash
set +e

echo "=============================="
echo " MASTER-BOT : RUN ALL SYSTEM "
echo "=============================="

ROOT_DIR="$(pwd)"

# ===== LOAD ENV =====
if [ -f ".env.local" ]; then
  echo "[ENV] load .env.local"
  export $(grep -v '^#' .env.local | xargs)
else
  echo "[ENV] .env.local tidak ditemukan (skip)"
fi

# ===== INSTALL DEPENDENCIES =====
if [ -f "package.json" ]; then
  echo "[NPM] install dependencies"
  npm install
fi

# ===== RUN AI AGENT =====
if [ -f "ai_agent.sh" ]; then
  echo "[AI] run ai_agent.sh"
  chmod +x ai_agent.sh
  ./ai_agent.sh &
fi

# ===== RUN ENV SCRIPT =====
if [ -f "run_all_env_local.sh" ]; then
  echo "[ENV] run run_all_env_local.sh"
  chmod +x run_all_env_local.sh
  ./run_all_env_local.sh &
fi

# ===== RUN PARABOTS =====
if [ -d "parabots" ]; then
  echo "[BOT] starting parabots"
  for bot in parabots/*; do
    if [ -f "$bot" ]; then
      bash "$bot" &
    fi
  done
fi

# ===== RUN SERVICES =====
if [ -d "services" ]; then
  echo "[SERVICE] starting services"
  for svc in services/*; do
    if [ -f "$svc" ]; then
      bash "$svc" &
    fi
  done
fi

# ===== RUN FRONTEND =====
if [ -f "vite.config.ts" ]; then
  echo "[FRONTEND] npm run dev"
  npm run dev
fi

echo "=============================="
echo " SYSTEM RUNNING "
echo "=============================="
