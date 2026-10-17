const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const timePattern = /^(\d{2}):(\d{2})$/;

const getLocalParts = (instant: number, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  return Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
};

const partsMatch = (actual: Record<string, number>, expected: number[]) =>
  actual.year === expected[0] &&
  actual.month === expected[1] &&
  actual.day === expected[2] &&
  actual.hour === expected[3] &&
  actual.minute === expected[4] &&
  actual.second === 0;

const resolveLocalTime = (parts: number[], timeZone: string) => {
  const nominalUtc = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]);
  const offsets = new Set<number>();

  for (let delta = -36; delta <= 36; delta += 1) {
    const sample = nominalUtc + delta * 60 * 60 * 1000;
    const local = getLocalParts(sample, timeZone);
    const localAsUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    offsets.add(localAsUtc - sample);
  }

  const candidates = [...offsets]
    .map((offset) => nominalUtc - offset)
    .filter((instant) => partsMatch(getLocalParts(instant, timeZone), parts))
    .sort((left, right) => left - right);

  // During a repeated DST hour, choose the first occurrence. For a skipped
  // wall time, move forward to the first valid minute after the DST gap.
  if (candidates.length) return candidates[0];
  for (let minute = 1; minute <= 180; minute += 1) {
    const shifted = new Date(nominalUtc + minute * 60_000);
    const shiftedParts = [
      shifted.getUTCFullYear(),
      shifted.getUTCMonth() + 1,
      shifted.getUTCDate(),
      shifted.getUTCHours(),
      shifted.getUTCMinutes(),
    ];
    const resolved = resolveExactLocalTime(shiftedParts, timeZone, offsets);
    if (resolved !== null) return resolved;
  }
  throw new Error("Could not resolve the delivery time in its timezone.");
};

const resolveExactLocalTime = (
  parts: number[],
  timeZone: string,
  knownOffsets: Set<number>,
) => {
  const nominalUtc = Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]);
  for (const offset of knownOffsets) {
    const instant = nominalUtc - offset;
    if (partsMatch(getLocalParts(instant, timeZone), parts)) return instant;
  }
  return null;
};

export const getLetterReleaseAt = (
  deliveryDate: string,
  deliveryTime: string | undefined,
  timeZone = "UTC",
) => {
  const dateMatch = datePattern.exec(deliveryDate);
  const timeMatch = timePattern.exec(deliveryTime ?? "00:00");
  if (!dateMatch || !timeMatch) throw new Error("Invalid letter release date or time.");

  const parts = [
    Number(dateMatch[1]),
    Number(dateMatch[2]),
    Number(dateMatch[3]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
  ];
  const check = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  if (
    check.getUTCFullYear() !== parts[0] ||
    check.getUTCMonth() + 1 !== parts[1] ||
    check.getUTCDate() !== parts[2] ||
    parts[3] > 23 ||
    parts[4] > 59
  ) {
    throw new Error("Invalid letter release date or time.");
  }

  // Validate the IANA zone before resolving wall-clock time.
  new Intl.DateTimeFormat("en-US", { timeZone }).format(0);
  return resolveLocalTime(parts, timeZone);
};

export const isLetterReleased = (
  letter: { releaseAt?: number; deliveryDate: string; deliveryTime?: string; deliveryTimezone?: string },
  now: number,
) => now >= (letter.releaseAt ?? getLetterReleaseAt(
  letter.deliveryDate,
  letter.deliveryTime,
  letter.deliveryTimezone ?? "UTC",
));
