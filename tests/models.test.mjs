import assert from 'node:assert/strict';
import { parseNumbers, buildStackTrace } from '../js/stack-model.js';
import { createTable, stepTable } from '../js/philosopher-model.js';

function replay(values, frames) {
  const a = [...values],
    b = [];
  for (const frame of frames.slice(1)) {
    if (frame.operation === 'ra') a.push(a.shift());
    else if (frame.operation === 'rra') a.unshift(a.pop());
    else if (frame.operation === 'pb') b.unshift(a.shift());
    else if (frame.operation === 'pa') a.unshift(b.shift());
    else assert.fail('Unexpected operation');
    assert.deepEqual(a, frame.a);
    assert.deepEqual(b, frame.b);
  }
  assert.deepEqual(
    a,
    [...values].sort((x, y) => x - y),
  );
  assert.deepEqual(b, []);
}
for (let size = 2; size <= 40; size++) {
  const values = Array.from({ length: size }, (_, i) => i - 20).reverse();
  replay(values, buildStackTrace(values));
  const rotated = [...values.slice(1), values[0]];
  replay(rotated, buildStackTrace(rotated));
}
replay([-2147483648, 2147483647, 0, -1], buildStackTrace([-2147483648, 2147483647, 0, -1]));
assert.equal(buildStackTrace([1, 2, 3]).length, 1);
assert.deepEqual(parseNumbers('3, -2  0'), [3, -2, 0]);
for (const invalid of ['', '1', '1 1', '1 a', '1 2.5', '1 2147483648'])
  assert.throws(() => parseNumbers(invalid));
for (const count of [2, 3, 4, 5, 6, 7, 8]) {
  const table = createTable(count, 10000, 300, 400);
  for (let time = 0; time < 15000; time += 50) {
    stepTable(table, 50);
    assert.equal(table.dead, null);
    table.philosophers
      .filter((p) => p.state === 'eating')
      .forEach((p) => {
        assert.equal(table.forks[p.id], p.id);
        assert.equal(table.forks[(p.id + 1) % count], p.id);
      });
    table.forks.forEach((owner, index) => {
      if (owner !== null) {
        assert.equal(table.philosophers[owner].state, 'eating');
        assert(index === owner || index === (owner + 1) % count);
      }
    });
  }
  assert(table.philosophers.every((p) => p.meals > 0));
}
const starving = createTable(5, 100, 1000, 1000);
stepTable(starving, 100);
assert.notEqual(starving.dead, null);
console.log(
  'PASS: valid operation replay, sorting, integer validation, fork ownership, progress and starvation.',
);
