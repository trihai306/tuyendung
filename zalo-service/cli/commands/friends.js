/**
 * friends command - List all friends
 * 
 * Usage: zalo-cli friends --account <ownId>
 * 
 * API: api.getAllFriends()
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function friendsCommand(program) {
    program
        .command('friends')
        .description('List all friends')
        .requiredOption('--account <ownId>', 'Account ownId')
        .option('--limit <number>', 'Maximum friends to return', '100')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const friends = await api.getAllFriends();

                const limit = parseInt(options.limit);
                const friendList = (friends || []).slice(0, limit).map(f => ({
                    id: f.userId || f.uid,
                    displayName: f.displayName || f.display_name,
                    zaloName: f.zaloName || f.zalo_name,
                    avatar: f.avatar,
                    phone: f.phoneNumber || null,
                    isFriend: true
                }));

                output({
                    data: friendList,
                    total: friends?.length || 0,
                    returned: friendList.length
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
