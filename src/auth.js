// https://github.com/alik0211/mtproto-core/blob/master/docs/authentication.md
const prompt = require('prompt-sync')();

const api = require('./api');

async function getUser() {
  try {
    const user = await api.call('users.getFullUser', {
      id: {
        _: 'inputUserSelf',
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

function sendCode(phone) {
  return api.call('auth.sendCode', {
    phone_number: phone,
    settings: {
      _: 'codeSettings',
    },
  });
}

function signIn({ code, phone, phone_code_hash }) {
  return api.call('auth.signIn', {
    phone_code: code,
    phone_number: phone,
    phone_code_hash,
  });
}

function getPassword() {
  return api.call('account.getPassword');
}

function checkPassword({ srp_id, A, M1 }) {
  return api.call('auth.checkPassword', {
    password: {
      _: 'inputCheckPasswordSRP',
      srp_id,
      A,
      M1,
    },
  });
}

async function auth() {
  const phone = process.env.USER_PHONE || prompt('Enter phone number: ');

  const { phone_code_hash } = await sendCode(phone);

  const code = prompt('Enter confirmation code: ');

  try {
    const authResult = await signIn({
      code,
      phone,
      phone_code_hash,
    });

    console.log('authResult:', authResult);
  } catch (error) {
    if (error.error_message !== 'SESSION_PASSWORD_NEEDED') {
      return;
    }

    // 2FA

    const { srp_id, current_algo, srp_B } = await getPassword();
    const {
      g, p, salt1, salt2,
    } = current_algo;

    const password = process.env.USER_PASSWORD || prompt('Enter password: ');

    const { A, M1 } = await api.mtproto.crypto.getSRPParams({
      g,
      p,
      salt1,
      salt2,
      gB: srp_B,
      password,
    });

    const authResult = await checkPassword({ srp_id, A, M1 });

    console.log('authResult:', authResult);
  }
}

module.exports = { auth, getUser };
