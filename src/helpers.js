const prompt = require('prompt-sync')();

function getUserNumber(text) {
  const number = prompt(text);
  if (Number.isNaN(Number(number))) throw Error('invalid user input');
  return number;
}

function filterRooms(chats) {
  return chats.filter(
    (ch) => (ch._ === 'chat' && !ch.deactivated) || ch.megagroup,
  );
}

function selectChat(allRooms) {
  const selectIndexChat = getUserNumber('Enter select chat (index) : ');
  return allRooms[selectIndexChat];
}

function filterUserMessages(allMessages, user) {
  return allMessages.filter(
    (msg) => msg && msg.user && msg && user && msg.user === user.id && !msg.media,
  );
}

function getMessagesToDelete(myMessages) {
  const offsetMsg = getUserNumber('how many messages to leave : ');
  return myMessages
    .slice(Number(offsetMsg))
    .map((msg) => msg && msg.id)
    .filter((msg) => msg);
}

module.exports = {
  getUserNumber, filterRooms, selectChat, filterUserMessages, getMessagesToDelete,
};
