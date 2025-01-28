require('dotenv').config();
const { chatClient } = require('./src/api');
const { getUser } = require('./src/user');
const { auth } = require('./src/auth');
const { getAllMessages, deleteMessages } = require('./src/chat');
const {
  getUserNumber, filterRooms, selectChat, filterUserMessages, getMessagesToDelete,
} = require('./src/helpers');

async function main() {
  try {
    const user = await getUser();
    if (!user) await auth();

    const { chats } = await chatClient.getDialogs();
    const allRooms = filterRooms(chats);

    console.table(allRooms, ['id', 'title']);

    const targetRoom = selectChat(allRooms);
    const offsetLimit = getUserNumber('the maximum number of messages to request (0=All) : ');
    const allMessages = await getAllMessages({ targetRoom, offsetLimit });

    const myMessages = filterUserMessages(allMessages, user);

    console.table(myMessages, ['id', 'text', 'textDate']);

    const deleteMessagesIDs = getMessagesToDelete(myMessages);

    await deleteMessages(targetRoom, deleteMessagesIDs);
  } catch (error) {
    console.log(`Error: ${error.message}`);
  }
  process.exit(1);
}

main();
