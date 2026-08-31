# Toggle Caffeinate

> [English](./README_EN.md)

시스템 슬립만 막고 디스플레이는 꺼지도록 `caffeinate -i`를 토글합니다.

## 기능

- 한 번 실행하면 ON, 다시 실행하면 OFF
- `caffeinate -i` 사용: 화면은 평소처럼 꺼지지만 시스템은 잠들지 않음 (빌드, 다운로드 등 백그라운드 작업 유지)
- PID 파일(`~/.cache/raycast-caffeinate.pid`)로 상태를 추적해서 중복 실행 방지
- 프로세스가 외부에서 종료된 경우(재부팅 등)에도 stale PID를 감지하고 새로 시작

## 설치

1. **Raycast 설정** > **Extensions** > **Script Commands** 열기
2. **Add Directories**에서 `toggle-caffeinate` 폴더 선택
3. Raycast에서 "Toggle Caffeinate" 검색

## 동작 방식

| 상태 | 실행 결과 |
|------|----------|
| OFF | `caffeinate -i` 백그라운드 시작, "Caffeinate ON" 표시 |
| ON | 실행 중인 프로세스 종료, "Caffeinate OFF" 표시 |

디스플레이까지 켜두고 싶다면 스크립트의 `-i`를 `-di`로 바꾸세요.
