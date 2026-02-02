/**
 * Zalo CLI - Command line interface for Zalo operations
 * 
 * Based on zca-js documentation: https://tdung.gitbook.io/zca-js
 * 
 * Usage:
 *   node cli/index.js login
 *   node cli/index.js accounts
 *   node cli/index.js groups --account=OWN_ID
 *   node cli/index.js send --account=OWN_ID --to=THREAD_ID --message="Hello"
 *   node cli/index.js disconnect --account=OWN_ID
 *   node cli/index.js find-user --account=OWN_ID --phone=0909090909
 *   node cli/index.js friends --account=OWN_ID
 *   ... and 20+ more commands
 */

import { Command } from 'commander';

// Core commands
import { loginCommand } from './commands/login.js';
import { accountsCommand } from './commands/accounts.js';
import { disconnectCommand } from './commands/disconnect.js';

// Messaging commands
import { sendCommand } from './commands/send.js';
import { sendFileCommand } from './commands/send-file.js';
import { deleteMessageCommand } from './commands/delete-message.js';
import { reactCommand } from './commands/react.js';

// User commands
import { findUserCommand } from './commands/find-user.js';
import { userInfoCommand } from './commands/user-info.js';

// Friends commands
import { friendsCommand } from './commands/friends.js';
import { addFriendCommand } from './commands/add-friend.js';
import { acceptFriendCommand } from './commands/accept-friend.js';

// Group commands
import { groupsCommand } from './commands/groups.js';
import { groupInfoCommand } from './commands/group-info.js';
import { createGroupCommand } from './commands/create-group.js';
import { addToGroupCommand } from './commands/add-to-group.js';
import { removeFromGroupCommand } from './commands/remove-from-group.js';
import { renameGroupCommand } from './commands/rename-group.js';
import { promoteCommand } from './commands/promote.js';
import { demoteCommand } from './commands/demote.js';
import { transferOwnerCommand } from './commands/transfer-owner.js';
import { deleteGroupCommand } from './commands/delete-group.js';

// Extended commands
import { blockCommand } from './commands/block.js';
import { unblockCommand } from './commands/unblock.js';
import { stickersCommand } from './commands/stickers.js';
import { sendStickerCommand } from './commands/send-sticker.js';
import { accountInfoCommand } from './commands/account-info.js';
import { setAliasCommand } from './commands/set-alias.js';
import { pinCommand } from './commands/pin.js';

// Messaging extended
import { sendVoiceCommand } from './commands/send-voice.js';
import { sendCardCommand } from './commands/send-card.js';

// Poll & Note commands
import { createPollCommand } from './commands/create-poll.js';
import { lockPollCommand } from './commands/lock-poll.js';
import { createNoteCommand } from './commands/create-note.js';
import { editNoteCommand } from './commands/edit-note.js';

const program = new Command();

program
    .name('zalo-cli')
    .description('Zalo CLI for Laravel integration - Full zca-js API')
    .version('2.3.0');

// Register Core commands
loginCommand(program);
accountsCommand(program);
disconnectCommand(program);

// Register Messaging commands
sendCommand(program);
sendFileCommand(program);
deleteMessageCommand(program);
reactCommand(program);

// Register User commands
findUserCommand(program);
userInfoCommand(program);

// Register Friends commands
friendsCommand(program);
addFriendCommand(program);
acceptFriendCommand(program);

// Register Group commands
groupsCommand(program);
groupInfoCommand(program);
createGroupCommand(program);
addToGroupCommand(program);
removeFromGroupCommand(program);
renameGroupCommand(program);
promoteCommand(program);
demoteCommand(program);
transferOwnerCommand(program);
deleteGroupCommand(program);

// Register Extended commands
blockCommand(program);
unblockCommand(program);
stickersCommand(program);
sendStickerCommand(program);
accountInfoCommand(program);
setAliasCommand(program);
pinCommand(program);

// Register Messaging extended  
sendVoiceCommand(program);
sendCardCommand(program);

// Register Poll & Note commands
createPollCommand(program);
lockPollCommand(program);
createNoteCommand(program);
editNoteCommand(program);

// Parse arguments
program.parse();
