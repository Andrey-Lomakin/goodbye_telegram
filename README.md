# Delete message history from Telegram chats

*Attention: this script will delete your messages and make them inaccessible to other users, but not to the telegram server.*

## Install

1. Clone this repo
2. Run 
```bash
npm install
```

## Usage
### 1. Creating your Telegram Application (required)

https://core.telegram.org/api/obtaining_api_id

### 2. Create a .env file in the root directory of your project. (optional)
```dosini
API_ID={insert your API_ID}
API_HASH={insert your API_ID}
USER_PHONE={insert your phone number}
USER_PASSWORD={insert your password}
```
**OR** will be requested at runtime

### 3. Run
```bash
node ./index.js
```

At runtime, it will show your chats.

You will choose a chat and you will be asked how many messages to leave (and will show your messages).

Profit!
