export function parseNumbers(text) {
  const tokens = text.trim().split(/[\s,]+/);
  if (tokens.length < 2 || tokens.length > 40) throw new Error('Enter 2–40 distinct integers.');
  if (tokens.some((token) => !/^-?\d+$/.test(token)))
    throw new Error('Use whole numbers separated by spaces or commas.');
  const values = tokens.map(Number);
  if (
    values.some((value) => !Number.isInteger(value) || value < -2147483648 || value > 2147483647)
  ) {
    throw new Error('Each number must fit a signed 32-bit integer.');
  }
  if (new Set(values).size !== values.length) throw new Error('Duplicate numbers are not allowed.');
  return values;
}

// Educational minimum-first strategy. This is separate from the C cost-based sorter.
export function buildStackTrace(values) {
  const a = [...values];
  const b = [];
  const frames = [{ a: [...a], b: [], operation: 'ready' }];
  function record(operation) {
    frames.push({ a: [...a], b: [...b], operation });
  }
  if (a.every((value, index) => index === 0 || a[index - 1] < value)) return frames;
  while (a.length) {
    const index = a.indexOf(Math.min(...a));
    if (index <= a.length / 2) {
      for (let turn = 0; turn < index; turn++) {
        a.push(a.shift());
        record('ra');
      }
    } else {
      for (let turn = a.length; turn > index; turn--) {
        a.unshift(a.pop());
        record('rra');
      }
    }
    b.unshift(a.shift());
    record('pb');
  }
  while (b.length) {
    a.unshift(b.shift());
    record('pa');
  }
  return frames;
}
