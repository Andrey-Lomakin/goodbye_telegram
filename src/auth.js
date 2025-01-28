// https://github.com/alik0211/mtproto-core/blob/master/docs/authentication.md
// import { authClient } from './api/api';
const prompt = require('prompt-sync')();
const { authClient } = require('./api');

async function auth() {
  const phone = process.env.USER_PHONE || prompt('Enter phone number: ');

  const { phone_code_hash } = await authClient.sendCode(phone);

  const code = prompt('Enter confirmation code: ');

  try {
    await authClient.signIn(code, phone, phone_code_hash);
  } catch (error) {
    if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
      return;
    }

    // 2FA
    const { srp_id, current_algo, srp_B } = await authClient.getPassword();
    const {
      g, p, salt1, salt2,
    } = current_algo;

    const password = process.env.USER_PASSWORD || prompt('Enter password: ');

    const { A, M1 } = await authClient.getSRPParams(
      g,
      p,
      salt1,
      salt2,
      srp_B,
      password,
    );

    await authClient.checkPassword(srp_id, A, M1);
  }
}

module.exports = { auth };
