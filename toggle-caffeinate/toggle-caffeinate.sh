#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Toggle Caffeinate
# @raycast.mode compact

# Optional parameters:
# @raycast.icon ☕️
# @raycast.packageName System
# @raycast.description 시스템 슬립만 막고 디스플레이는 꺼지도록 caffeinate -i 를 토글합니다.

PIDFILE="$HOME/.cache/raycast-caffeinate.pid"
mkdir -p "$(dirname "$PIDFILE")"

if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  kill "$(cat "$PIDFILE")"
  rm -f "$PIDFILE"
  echo "Caffeinate OFF"
else
  nohup caffeinate -i >/dev/null 2>&1 &
  echo $! > "$PIDFILE"
  disown
  echo "Caffeinate ON (화면은 꺼짐, 작업은 계속)"
fi
