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
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const groups = await api.getAllGroups();

                // Get group IDs
                const groupIds = Object.keys(groups.gridVerMap || {});
                const groupDetails = [];
                const limit = parseInt(options.limit);

                for (const groupId of groupIds.slice(0, limit)) {
                    try {
                        const info = await api.getGroupInfo(groupId);
                        // getGroupInfo returns object keyed by groupId in gridInfoMap
                        const groupData = info.gridInfoMap?.[groupId] || info;

                        if (groupData) {
                            groupDetails.push({
                                id: groupId,
                                name: groupData.name || 'Unknown Group',
                                memberCount: groupData.memVerList?.length || groupData.totalMember || 0,
                                avatar: groupData.avt || groupData.avatar
                            });
                        }
                    } catch (e) {
                        // Skip failed groups, add with unknown name
                        groupDetails.push({
                            id: groupId,
                            name: 'Unknown Group',
                            memberCount: 0,
                            avatar: null
                        });
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
