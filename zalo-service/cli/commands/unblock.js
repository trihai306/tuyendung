/**
 * unblock command - Unblock a user
 * 
 * Usage: zalo-cli unblock --account <ownId> --user <userId>
 * 
 * API: api.unblockUser(userId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function unblockCommand(program) {
    program
        .command('unblock')
        .description('Unblock a user')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--user <userId>', 'User ID to unblock')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const result = await api.unblockUser(options.user);

                output({
                    data: {
                        userId: options.user,
                        status: 'unblocked',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
