/**
 * accept-friend command - Accept friend request
 * 
 * Usage: zalo-cli accept-friend --account <ownId> --user <userId>
 * 
 * API: api.acceptFriendRequest(userId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function acceptFriendCommand(program) {
    program
        .command('accept-friend')
        .description('Accept friend request')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--user <userId>', 'User ID to accept')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const result = await api.acceptFriendRequest(options.user);

                output({
                    data: {
                        userId: options.user,
                        status: 'accepted',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
