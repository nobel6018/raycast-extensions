# Snowflake ID Generator

> [한국어](./README.md)

Generate unique Snowflake IDs encoded in Crockford Base32, copied to clipboard.

## Features

- Twitter Snowflake algorithm (epoch: 2010-11-04)
- Crockford Base32 encoding (URL-safe, human-readable)
- Generates N IDs at once (default: 5, max: 1000)
- Machine ID derived from hardware + PID
- Monotonically increasing within the same millisecond

## Setup

1. Open **Raycast Settings** > **Extensions** > **Script Commands**
2. Click **Add Directories** and select the `snowflake-id-generator` folder
3. Search "Generate Snowflake IDs" in Raycast

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
- **Machine ID**: MD5 hash of MAC address + PID, masked to 10 bits
- **Sequence**: per-millisecond counter (0-4095)
