/**
 * promote command - Promote user to group admin (deputy)
 * 
 * Usage: zalo-cli promote --account <ownId> --group <groupId> --user <userId>
 * 
 * API: api.addGroupDeputy(userId, groupId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function promoteCommand(program) {
    program
        .command('promote')
        .description('Promote user to group admin')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .requiredOption('--user <userId>', 'User ID to promote')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const result = await api.addGroupDeputy(options.user, options.group);

                output({
                    data: {
                        groupId: options.group,
                        userId: options.user,
                        role: 'admin',
                        status: 'promoted',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
