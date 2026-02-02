/**
 * Groups command - Get groups for an account
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function groupsCommand(program) {
    program
        .command('groups')
        .description('Get all groups for an account')
        .requiredOption('--account <ownId>', 'Account ownId')
        .option('--limit <number>', 'Maximum groups to fetch', '50')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const groups = await api.getAllGroups();

                // Get group IDs
                const groupIds = Object.keys(groups.gridVerMap || {});
                const groupDetails = [];
                const limit = parseInt(options.limit);

                for (const groupId of groupIds.slice(0, limit)) {
                    try {
                        const info = await api.getGroupInfo(groupId);
                        if (info) {
                            groupDetails.push({
                                id: groupId,
                                name: info.name,
                                memberCount: info.totalMember,
                                avatar: info.avt
                            });
                        }
                    } catch (e) {
                        // Skip failed groups
                    }
                }

                output({
                    data: groupDetails,
                    total: groupIds.length,
                    fetched: groupDetails.length
                });

                process.exit(0);

            } catch (err) {
                error(err.message);
            }
        });
}
