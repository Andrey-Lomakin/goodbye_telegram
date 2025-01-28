const { sleep } = require('@mtproto/core/src/utils/common');

const { chatClient } = require('./api');

const OFFSET_MESSAGES = 100; // 100 max value
const DELAY = 1100; // 1 sec

async function getAllMessages({
  targetRoom,
  prevMessage = [],
  add_offset = 0,
  offsetLimit = 0,
}) {
  await sleep(DELAY); // bans on frequent requests
  console.log(`get ${add_offset}-${add_offset + OFFSET_MESSAGES} messages`);
  let currentMessages = [];

  let peer;

  if (targetRoom._ === 'channel') {
    peer = {
      _: 'inputPeerChannel',
      channel_id: targetRoom.id,
      access_hash: targetRoom.access_hash,
    };
  }
  if (targetRoom._ === 'chat') {
    peer = {
      _: 'inputPeerChat',
      chat_id: targetRoom.id,
    };
  }

  const { messages } = await chatClient.getHistory(
    peer,
    OFFSET_MESSAGES,
    add_offset,
  );

  currentMessages = messages.map((msg) => ({
    text: msg.message ? msg.message.slice(0, 60) : msg.message,
    user: msg.from_id && msg.from_id.user_id,
    textDate: new Date(msg.date * 1000).toISOString().slice(0, -8),
    ...msg,
  }));

  if (currentMessages.length < OFFSET_MESSAGES) {
    return [...prevMessage, ...currentMessages];
  }

  if (offsetLimit && add_offset >= offsetLimit) {
    return [...prevMessage, ...currentMessages];
  }

  return getAllMessages({
    targetRoom,
    prevMessage: [...prevMessage, ...currentMessages],
    add_offset: add_offset + OFFSET_MESSAGES,
    offsetLimit,
  });
}

async function deleteMessages(room, ids) {
  let resultDelete;
  if (room._ === 'channel') {
    resultDelete = await chatClient.deleteChannelMessages(room, ids);
  }
  if (room._ === 'chat') {
    resultDelete = await chatClient.deleteChatMessages(ids);
  }

  console.log(
    `Complete, deleted ${resultDelete.pts_count} messages / ${ids.length}`,
  );
  if (ids.length > Number(resultDelete.pts_count)) {
    await deleteMessages(room, ids.slice(resultDelete.pts_count));
  }
}

module.exports = { getAllMessages, deleteMessages };
