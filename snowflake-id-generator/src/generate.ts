import { Clipboard, LaunchProps, showHUD } from "@raycast/api";
import { createHash, randomBytes } from "node:crypto";
import { hostname } from "node:os";

const EPOCH = 1288834974657n; // Twitter Snowflake epoch (2010-11-04T01:42:54.657Z)
const MACHINE_ID_BITS = 10n;
const SEQUENCE_BITS = 12n;
const MAX_MACHINE_ID = (1n << MACHINE_ID_BITS) - 1n;
const MAX_SEQUENCE = (1n << SEQUENCE_BITS) - 1n;
const TIMESTAMP_SHIFT = MACHINE_ID_BITS + SEQUENCE_BITS;
const MACHINE_ID_SHIFT = SEQUENCE_BITS;

const CROCKFORD_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";
const DEFAULT_COUNT = 1;
const MAX_COUNT = 1000;

function getMachineId(): bigint {
  const raw = createHash("md5").update(`${hostname()}-${process.pid}`).digest();
  return BigInt(raw.readUInt32BE(0)) & MAX_MACHINE_ID;
}

function encodeCrockfordBase32(value: bigint): string {
  const bytes = Buffer.alloc(8);
  bytes.writeBigUInt64BE(value);

  let result = "";
  let buffer = 0;
  let bitsInBuffer = 0;
  for (const b of bytes) {
    buffer = ((buffer << 8) | b) & 0xffff;
    bitsInBuffer += 8;
    while (bitsInBuffer >= 5) {
      result += CROCKFORD_ALPHABET[(buffer >> (bitsInBuffer - 5)) & 0x1f];
      bitsInBuffer -= 5;
    }
  }
  if (bitsInBuffer > 0) {
    result += CROCKFORD_ALPHABET[(buffer << (5 - bitsInBuffer)) & 0x1f];
  }
  return result;
}

function createGenerator(): () => string {
  const machineId = getMachineId();
  let sequence = BigInt(randomBytes(2).readUInt16BE(0)) & MAX_SEQUENCE;
  let lastTimestamp = -1n;

  return () => {
    let timestamp = BigInt(Date.now());
    if (timestamp < lastTimestamp) {
      throw new Error("Clock moved backwards");
    }

    sequence = (sequence + 1n) & MAX_SEQUENCE;
    if (timestamp === lastTimestamp && sequence === 0n) {
      while (timestamp <= lastTimestamp) {
        timestamp = BigInt(Date.now());
      }
    }
    lastTimestamp = timestamp;

    const id = ((timestamp - EPOCH) << TIMESTAMP_SHIFT) | (machineId << MACHINE_ID_SHIFT) | sequence;
    return encodeCrockfordBase32(id);
  };
}

function parseCount(input: string | undefined): number {
  const parsed = Number.parseInt(input?.trim() ?? "", 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_COUNT;
  }
  return Math.max(1, Math.min(parsed, MAX_COUNT));
}

export default async function Command(props: LaunchProps<{ arguments: Arguments.Generate }>) {
  const count = parseCount(props.arguments.count);
  const nextId = createGenerator();
  const ids = Array.from({ length: count }, () => nextId());

  await Clipboard.copy(ids.join("\n"));
  await showHUD(`Copied ${count} Snowflake ID${count > 1 ? "s" : ""} to clipboard`);
}
