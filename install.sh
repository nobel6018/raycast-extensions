#!/bin/bash
# 레포의 모든 확장을 빌드해서 Raycast 에 등록한다.
# ray develop 은 빌드 결과를 ~/.config/raycast/extensions 로 복사한 뒤 watch 모드로 들어가므로,
# 등록이 끝나면 종료해도 확장은 Raycast 에 남는다.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
TARGETS=("$@")
if [ ${#TARGETS[@]} -eq 0 ]; then
  for manifest in "$ROOT"/*/package.json; do
    TARGETS+=("$(basename "$(dirname "$manifest")")")
  done
fi

for name in "${TARGETS[@]}"; do
  echo "==> $name"
  cd "$ROOT/$name"
  npm install --no-audit --no-fund --silent
  npx ray develop &
  pid=$!
  # 등록 디렉터리가 생기면 watch 모드를 끝낸다 (최대 60초)
  for _ in $(seq 60); do
    [ -d "$HOME/.config/raycast/extensions/$name" ] && sleep 2 && break
    sleep 1
  done
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
done

echo "등록 완료: ${TARGETS[*]}"
