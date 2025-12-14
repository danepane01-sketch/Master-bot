#!/bin/bash

PROJECT_DIR="/workspaces/Master-bot"
LOG="agent.log"

AI - sudo su
echo "=== AI AGENT STARTED ===" | tee -a $LOG
set -e

while true; do
  echo
  echo "[$(date)] Agent running..." | tee -a $LOG
  cd "$PROJECT_DIR" || exit 1

  # 1. Auto install dependency (kalau Node.js)
  if [ -f package.json ]; then
    echo "Node project detected" | tee -a $LOG
    npm install >> $LOG 2>&1
    npm start >> $LOG 2>&1
  fi

  # 2. Auto run Python (kalau ada)
  if ls *.py >/dev/null 2>&1; then
    echo "Python detected" | tee -a $LOG
    python *.py >> $LOG 2>&1
  fi

  # 3. Auto run shell script
  if [ -f start.sh ]; then
    echo "Shell script detected" | tee -a $LOG
    bash start.sh >> $LOG 2>&1
  fi

  echo "Agent sleeping..." | tee -a $LOG
  sleep 10
done
