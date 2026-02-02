/**
 * add-to-group command - Add user to group
 * 
 * Usage: zalo-cli add-to-group --account <ownId> --group <groupId> --user <userId>
 * 
 * API: api.addUserToGroup(memberId, groupId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function addToGroupCommand(program) {
    program
        .command('add-to-group')
        .description('Add user to group')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .requiredOption('--user <userId>', 'User ID to add (or comma-separated list)')
        .action(async (options) => {
            try {
                const userIds = options.user.split(',').map(id => id.trim());
                const api = await getZaloApi(options.account);

                const results = [];
                for (const userId of userIds) {
                    try {
                        const result = await api.addUserToGroup(userId, options.group);
                        results.push({ userId, status: 'added', result });
                    } catch (e) {
                        results.push({ userId, status: 'failed', error: e.message });
                    }
                }

                output({
                    data: {
                        groupId: options.group,
                        results,
                        addedCount: results.filter(r => r.status === 'added').length,
                        failedCount: results.filter(r => r.status === 'failed').length
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
