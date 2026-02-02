/**
 * add-friend command - Send friend request
 * 
 * Usage: zalo-cli add-friend --account <ownId> --user <userId> --message "Hello!"
 * 
 * API: api.sendFriendRequest(msg, userId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function addFriendCommand(program) {
    program
        .command('add-friend')
        .description('Send friend request')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--user <userId>', 'User ID to add')
        .option('--message <text>', 'Friend request message', 'Xin chào! Mình muốn kết bạn.')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.sendFriendRequest(options.message, options.user);

                output({
                    data: {
                        userId: options.user,
                        message: options.message,
                        status: 'sent',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
