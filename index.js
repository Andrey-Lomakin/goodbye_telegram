require('dotenv').config();

const api = require('./src/api');
const { getUser, auth } = require('./src/auth');
const { getAllMessages, deleteMessages } = require('./src/chat');
const { getUserNumber } = require('./src/helpers');

async function main() {
  try {
    const user = (await getUser()).users[0];
    if (!user) await auth();

    // https://core.telegram.org/method/messages.getDialogs
    const { chats } = await api.call('messages.getDialogs', {
      offset_id: 0,
      limit: 100,
      hash: 0,
      exclude_pinned: false,
      offset_peer: { _: 'inputPeerSelf' },
    });

    const allRooms = chats
      .filter((ch) => (ch._ === 'chat' && !ch.deactivated) || ch.megagroup);
    console.table(allRooms, ['id', 'title']);

    const selectIndexChat = getUserNumber('Enter select chat (index) : ');

    const targetRoom = allRooms[selectIndexChat];

    const offsetLimit = getUserNumber('the maximum number of messages to request (0 max) : ');
    const allMessages = await getAllMessages({ targetRoom, offsetLimit });

    const myMessages = allMessages.filter(
      (msg) => (msg && msg.user)
        && msg.user === user.id && !msg.media,
    );
    console.table(myMessages, ['id', 'text', 'textDate']);

    const offsetMsg = getUserNumber('how many messages to leave : ');

    const deleteMessagesIDs = myMessages.slice(Number(offsetMsg)).map((msg) => msg.id);

    await deleteMessages(targetRoom, deleteMessagesIDs);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  process.exit(1);
}

main();
