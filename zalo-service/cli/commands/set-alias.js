/**
 * set-alias command - Set friend nickname/alias
 * 
 * Usage: zalo-cli set-alias --account <ownId> --user <userId> --alias "New Name"
 * 
 * API: api.changeFriendAlias(userId, alias)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function setAliasCommand(program) {
    program
        .command('set-alias')
        .description('Set friend nickname/alias')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--user <userId>', 'Friend user ID')
        .requiredOption('--alias <name>', 'New nickname')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.changeFriendAlias(options.user, options.alias);

                output({
                    data: {
                        userId: options.user,
                        alias: options.alias,
                        status: 'updated',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
