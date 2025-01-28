/* eslint-disable import/prefer-default-export */
// https://github.com/alik0211/mtproto-core/blob/master/docs/handling-common-errors.md
const MTProto = require('@mtproto/core');
const { sleep } = require('@mtproto/core/src/utils/common');
const prompt = require('prompt-sync')();
const path = require('path');

const FLOOD_DELAY = 1000;

const mtproto = new MTProto({
  api_id: process.env.API_ID || prompt('Enter API_ID: '),
  api_hash: process.env.API_HASH || prompt('Enter API_HASH: '),
  storageOptions: {
    path: path.resolve(__dirname, './data/1.json'),
  },
});

const client = {
  mtproto,
  call(method, params, options = {}) {
    return mtproto.call(method, params, options).catch(async (error) => {
      console.log(`${method} error:`, error);

      const { error_code, error_message } = error;

      if (error_code === 420) {
        const seconds = +error_message.split('FLOOD_WAIT_')[1];
        const ms = seconds * FLOOD_DELAY;

        await sleep(ms);

        return this.call(method, params, options);
      }

      if (error_code === 303) {
        const [type, dcId] = error_message.split('_MIGRATE_');

        // If auth.sendCode call on incorrect DC need change default DC,
        // because call auth.signIn on incorrect DC return PHONE_CODE_EXPIRED error
        if (type === 'PHONE') {
          await mtproto.setDefaultDc(+dcId);
        } else {
          options = {
            ...options,
            dcId: +dcId,
          };
        }

        return this.call(method, params, options);
      }

      return Promise.reject(error);
    });
  },
};

const authClient = {
  /**
   *
   * @param {*} phone string
   * @returns {Promise<{phone_code_hash: string}>}
   */
  sendCode: (phone) => client.call('auth.sendCode', {
    phone_number: phone,
    settings: {
      _: 'codeSettings',
    },
  }),

  /**
   * @param {*} code string
   * @param {*} phone string
   * @param {*} phone_code_hash string
   * @returns {Promise<{user: any}>}
   */
  signIn: (code, phone, phone_code_hash) => client.call('auth.signIn', {
    phone_code: code,
    phone_number: phone,
    phone_code_hash,
  }),

  /**
   * @returns {Promise<{srp_id: string, current_algo: any, srp_B: string}>}
   */
  getPassword: () => client.call('account.getPassword'),

  /**
   * @param {*} g string
   * @param {*} p string
   * @param {*} salt1 string
   * @param {*} salt2 string
   * @param {*} srp_B string
   * @param {*} password string
   * @returns {Promise<{A: string, M1: string}>}
   */
  getSRPParams: (g, p, salt1, salt2, srp_B, password) => client.call('auth.checkPassword', {
    password: {
      _: 'inputCheckPasswordSRP',
      g,
      p,
      salt1,
      salt2,
      srp_B,
      password,
    },
  }),

  /**
   * @param {*} srp_id string
   * @param {*} A string
   * @param {*} M1 string
   * @returns {Promise<{user: any}>}
   */
  checkPassword: (srp_id, A, M1) => client.call('auth.checkPassword', {
    password: {
      _: 'inputCheckPasswordSRP',
      srp_id,
      A,
      M1,
    },
  }),
};

const userClient = {
  /**
   * @returns {Promise<{users: any[]}>}
   */
  user: () => client.call('users.getFullUser', {
    id: {
      _: 'inputUserSelf',
    },
  }),
};

const chatClient = {
  /**
   *
   * @param {*} peer object
   * @param {*} limit number
   * @param {*} add_offset number
   * @returns {Promise<{messages: any[]}>}
   */
  getHistory: (peer, limit, add_offset) => client.call('messages.getHistory', {
    peer,
    limit,
    add_offset,
  }),

  /**
   * @param {*} channel object
   * @param {*} ids number[]
   * @returns {Promise<{messages: any[]}>}
   */
  deleteChannelMessages: (channel, ids) => client.call('channels.deleteMessages', {
    channel: {
      _: 'inputPeerChannel',
      channel_id: channel.id,
      access_hash: channel.access_hash,
    },
    id: ids,
  }),

  /**
   * @param {*} ids number[]
   * @returns {Promise<{messages: any[]}>}
   */
  deleteChatMessages: (ids) => client.call('messages.deleteMessages', {
    revoke: true,
    id: ids,
  }),

  /**
   * @returns {Promise<{chats: any[]}>}
   */
  getDialogs: () => client.call('messages.getDialogs', {
    offset_id: 0,
    limit: 100,
    hash: 0,
    exclude_pinned: false,
    offset_peer: { _: 'inputPeerSelf' },
  }),

};

module.exports = { authClient, userClient, chatClient };
