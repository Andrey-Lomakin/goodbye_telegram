const prompt = require('prompt-sync')();

function getUserNumber(text) {
  const number = prompt(text);
  if (Number.isNaN(Number(number))) throw Error('invalid user input');
  return number;
}

module.exports = { getUserNumber };
