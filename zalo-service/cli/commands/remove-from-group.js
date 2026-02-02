/**
 * remove-from-group command - Remove user from group
 * 
 * Usage: zalo-cli remove-from-group --account <ownId> --group <groupId> --user <userId>
 * 
 * API: api.removeUserFromGroup(memberId, groupId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function removeFromGroupCommand(program) {
    program
        .command('remove-from-group')
        .description('Remove user from group')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .requiredOption('--user <userId>', 'User ID to remove (or comma-separated list)')
        .action(async (options) => {
            try {
                const userIds = options.user.split(',').map(id => id.trim());
                const api = await getZaloApi(options.account);

                const results = [];
                for (const userId of userIds) {
                    try {
                        const result = await api.removeUserFromGroup(userId, options.group);
                        results.push({ userId, status: 'removed', result });
                    } catch (e) {
                        results.push({ userId, status: 'failed', error: e.message });
                    }
                }

                output({
                    data: {
                        groupId: options.group,
                        results,
                        removedCount: results.filter(r => r.status === 'removed').length,
                        failedCount: results.filter(r => r.status === 'failed').length
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
