#!/usr/bin/env python3

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Generate Snowflake IDs
# @raycast.mode silent

# Optional parameters:
# @raycast.icon ❄️
# @raycast.argument1 { "type": "text", "placeholder": "count (default: 5)", "optional": true }
# @raycast.packageName Developer Utils

# Documentation:
# @raycast.description Generate N Snowflake IDs (Crockford Base32) and copy to clipboard

import sys
import time
import os
import subprocess
import uuid
import hashlib

EPOCH = 1288834974657  # Twitter Snowflake epoch (2010-11-04T01:42:54.657Z)
MACHINE_ID_BITS = 10
SEQUENCE_BITS = 12
MAX_MACHINE_ID = (1 << MACHINE_ID_BITS) - 1
MAX_SEQUENCE = (1 << SEQUENCE_BITS) - 1
TIMESTAMP_SHIFT = MACHINE_ID_BITS + SEQUENCE_BITS
MACHINE_ID_SHIFT = SEQUENCE_BITS

CROCKFORD_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz"


def get_machine_id():
    raw = hashlib.md5(f"{uuid.getnode()}-{os.getpid()}".encode()).digest()
    value = int.from_bytes(raw[:4], "big")
    return value & MAX_MACHINE_ID


machine_id = get_machine_id()
sequence = int.from_bytes(os.urandom(2), "big") & MAX_SEQUENCE
last_timestamp = -1


def next_id():
    global sequence, last_timestamp

    timestamp = int(time.time() * 1000)

    if timestamp < last_timestamp:
        raise RuntimeError("Clock moved backwards")

    if timestamp == last_timestamp:
        sequence = (sequence + 1) & MAX_SEQUENCE
        if sequence == 0:
            while timestamp <= last_timestamp:
                timestamp = int(time.time() * 1000)
    else:
        sequence = (sequence + 1) & MAX_SEQUENCE

    last_timestamp = timestamp

    id_val = ((timestamp - EPOCH) << TIMESTAMP_SHIFT) | (machine_id << MACHINE_ID_SHIFT) | sequence
    return encode_crockford_base32(id_val)


def encode_crockford_base32(value):
    byte_data = value.to_bytes(8, byteorder="big")
    result = []
    buffer = 0
    bits_in_buffer = 0

    for b in byte_data:
        buffer = (buffer << 8) | b
        bits_in_buffer += 8
        while bits_in_buffer >= 5:
            index = (buffer >> (bits_in_buffer - 5)) & 0x1F
            result.append(CROCKFORD_ALPHABET[index])
            bits_in_buffer -= 5

    if bits_in_buffer > 0:
        index = (buffer << (5 - bits_in_buffer)) & 0x1F
        result.append(CROCKFORD_ALPHABET[index])

    return "".join(result)


def main():
    count = 5
    if len(sys.argv) > 1 and sys.argv[1].strip():
        try:
            count = int(sys.argv[1].strip())
        except ValueError:
            print("Invalid count, using default 5")
            count = 5

    count = max(1, min(count, 1000))

    ids = [next_id() for _ in range(count)]
    output = "\n".join(ids)

    subprocess.run(["pbcopy"], input=output.encode(), check=True)
    print(f"Copied {count} Snowflake IDs to clipboard")


if __name__ == "__main__":
    main()
