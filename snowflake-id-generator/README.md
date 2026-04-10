# Snowflake ID Generator

> [English](./README_EN.md)

Crockford Base32로 인코딩된 고유 Snowflake ID를 생성하여 클립보드에 복사합니다.

## 기능

- Twitter Snowflake 알고리즘 (epoch: 2010-11-04)
- Crockford Base32 인코딩 (URL-safe, 사람이 읽기 쉬움)
- N개 ID 한 번에 생성 (기본값: 5, 최대: 1000)
- Machine ID는 하드웨어 + PID 기반
- 같은 밀리초 내에서 단조 증가 보장

## 설치

1. **Raycast 설정** > **Extensions** > **Script Commands** 열기
2. **Add Directories**에서 `snowflake-id-generator` 폴더 선택
3. Raycast에서 "Generate Snowflake IDs" 검색

## 사용법

- Raycast에서 커맨드 실행
- 생성할 개수 입력 (선택, 기본값 5)
- ID가 자동으로 클립보드에 복사됨

## ID 구조

```
 64-bit Snowflake ID
├─ 42 bits ─┤─ 10 bits ─┤─ 12 bits ─┤
  timestamp   machine_id   sequence
```

- **Timestamp**: epoch(2010-11-04T01:42:54.657Z)부터 경과한 밀리초
- **Machine ID**: MAC 주소 + PID의 MD5 해시, 10비트 마스킹
- **Sequence**: 밀리초 단위 카운터 (0-4095)
