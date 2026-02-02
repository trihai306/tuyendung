/**
 * block command - Block a user
 * 
 * Usage: zalo-cli block --account <ownId> --user <userId>
 * 
 * API: api.blockUser(userId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function blockCommand(program) {
    program
        .command('block')
        .description('Block a user')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--user <userId>', 'User ID to block')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.blockUser(options.user);

                output({
                    data: {
                        userId: options.user,
                        status: 'blocked',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
