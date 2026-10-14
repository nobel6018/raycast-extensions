# Snowflake ID Generator

> [한국어](./README.md)

Generate unique Snowflake IDs encoded in Crockford Base32, copied to clipboard.

## Features

- Twitter Snowflake algorithm (epoch: 2010-11-04)
- Crockford Base32 encoding (URL-safe, human-readable)
- Generates N IDs at once (default: 1, max: 1000)
- Machine ID derived from hostname + PID
- Monotonically increasing within the same millisecond

## Setup

Run this from the repo root to register it in Raycast automatically.

```bash
./install.sh snowflake-id-generator
```

Then search "Generate Snowflake IDs" in Raycast.

## Usage

- Launch the command from Raycast
- Optionally enter a count (e.g., `10`)
- IDs are copied to clipboard automatically

## ID Structure

```
 64-bit Snowflake ID
├─ 42 bits ─┤─ 10 bits ─┤─ 12 bits ─┤
  timestamp   machine_id   sequence
```

- **Timestamp**: milliseconds since epoch (2010-11-04T01:42:54.657Z)
- **Machine ID**: MD5 hash of hostname + PID, masked to 10 bits
- **Sequence**: per-millisecond counter (0-4095)
