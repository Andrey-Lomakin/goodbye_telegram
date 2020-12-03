require('dotenv').config()
const { MTProto } = require('@mtproto/core');

async function main() {
  const api_id = process.env.API_ID;
  const api_hash = process.env.API_HASH;

  // 1. Create an instance
  const mtproto = new MTProto({
    api_id,
    api_hash,
  });

  // 2. Provide params for initConnection method (optional)
  mtproto.updateInitConnectionParams({
    app_version: '10.0.0',
  });

  // 3. Get the user country code
  mtproto.call('help.getNearestDc').then(result => {
    console.log(`country:`, result.country);
  });
}

main();
