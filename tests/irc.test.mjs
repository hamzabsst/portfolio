import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../js/irc-model.js', import.meta.url));
const { routeChannelMessage } = await import(
  `data:text/javascript;base64,${source.toString('base64')}`
);
const message = routeChannelMessage('hamza', 'hello');
assert.equal(message.recipient, 'visitor');
assert.equal(message.outgoing, 'PRIVMSG #systems :hello\r\n');
assert.equal(
  message.incoming,
  ':hamza!hamza@localhost PRIVMSG #systems :hello\r\n',
);
assert.equal(routeChannelMessage('visitor', 'hey').recipient, 'hamza');
assert.equal(
  routeChannelMessage('hamza', 'hi\r\nJOIN #other\0').text,
  'hi  JOIN #other',
);
assert.throws(() => routeChannelMessage('stranger', 'hi'), /Unknown client/);
assert.throws(() => routeChannelMessage('hamza', '   '), /Enter a message/);
assert.throws(() => routeChannelMessage('hamza', 'a'.repeat(161)), /160/);
console.log('IRC routing and command framing checks passed.');
