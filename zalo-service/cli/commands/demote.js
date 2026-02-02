/**
 * demote command - Remove admin rights from user
 * 
 * Usage: zalo-cli demote --account <ownId> --group <groupId> --user <userId>
 * 
 * API: api.removeGroupDeputy(userId, groupId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function demoteCommand(program) {
    program
        .command('demote')
        .description('Remove admin rights from user')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .requiredOption('--user <userId>', 'User ID to demote')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const result = await api.removeGroupDeputy(options.user, options.group);

                output({
                    data: {
                        groupId: options.group,
                        userId: options.user,
                        role: 'member',
                        status: 'demoted',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
