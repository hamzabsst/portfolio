const members = ['hamza', 'visitor'];

// This intentionally models one channel, not a complete IRC implementation.
export function routeChannelMessage(sender, input) {
  if (!members.includes(sender)) throw new Error('Unknown client');
  const text = input.replace(/[\r\n\0]/g, ' ').trim();
  if (!text) throw new Error('Enter a message first.');
  if (text.length > 160) throw new Error('Keep messages under 160 characters.');
  return {
    sender,
    text,
    recipient: members.find((member) => member !== sender),
    outgoing: `PRIVMSG #systems :${text}\r\n`,
    incoming: `:${sender}!${sender}@localhost PRIVMSG #systems :${text}\r\n`,
  };
}
