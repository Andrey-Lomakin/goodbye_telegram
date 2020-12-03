const { Client } = require('tglib');

async function main() {
  const client = new Client();

  await client.ready;

  await client.tg.sendTextMessage('');
}

main();
