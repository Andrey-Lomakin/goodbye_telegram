// https://github.com/alik0211/mtproto-core/blob/master/docs/authentication.md
const { userClient } = require('./api');

async function getUser() {
  try {
    const user = await userClient.user();
    return user.users[0];
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return null;
  }
}

module.exports = { getUser };
