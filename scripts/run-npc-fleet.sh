#!/usr/bin/env bash
set -euo pipefail

COUNT="${NPC_COUNT:-50}"
SERVER_URL="${SERVER_URL:-ws://localhost:8081}"
SESSION_TAG="${SESSION_TAG:-session-1}"

for i in $(seq 0 $((COUNT-1))); do
  SESSION_TAG="$SESSION_TAG" SERVER_URL="$SERVER_URL" NPC_COUNT=1 node npc/src/index.js &
done

wait
