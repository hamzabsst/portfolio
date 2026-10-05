export function createTable(count, timeToDie, timeToEat, timeToSleep) {
  return {
    time: 0,
    timeToDie,
    timeToEat,
    timeToSleep,
    forks: Array(count).fill(null),
    philosophers: Array.from({ length: count }, (_, id) => ({
      id,
      state: 'thinking',
      lastMeal: 0,
      until: 0,
      meals: 0,
    })),
    dead: null,
  };
}

export function stepTable(table, delta) {
  if (table.dead !== null) return;
  table.time += delta;
  const people = table.philosophers;
  for (const person of people) {
    if (table.time - person.lastMeal >= table.timeToDie) {
      person.state = 'dead';
      table.dead = person.id;
      return;
    }
    if (person.state === 'eating' && table.time >= person.until) {
      table.forks[person.id] = null;
      table.forks[(person.id + 1) % people.length] = null;
      person.state = 'sleeping';
      person.until = table.time + table.timeToSleep;
    } else if (person.state === 'sleeping' && table.time >= person.until)
      person.state = 'thinking';
  }
  // Rotate acquisition priority. A philosopher must own both forks before eating.
  const priority = Math.floor(table.time / 250) % people.length;
  for (let offset = 0; offset < people.length; offset++) {
    const person = people[(priority + offset) % people.length];
    if (!['thinking', 'waiting'].includes(person.state)) continue;
    const left = person.id;
    const right = (person.id + 1) % people.length;
    person.state = 'waiting';
    if (table.forks[left] === null && table.forks[right] === null) {
      table.forks[left] = table.forks[right] = person.id;
      person.state = 'eating';
      person.lastMeal = table.time;
      person.until = table.time + table.timeToEat;
      person.meals++;
    }
  }
}
