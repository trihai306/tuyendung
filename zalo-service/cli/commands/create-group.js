/**
 * create-group command - Create a new group
 * 
 * Usage: zalo-cli create-group --account <ownId> --name "Group Name" --members uid1,uid2,uid3
 * 
 * API: api.createGroup(options)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function createGroupCommand(program) {
    program
        .command('create-group')
        .description('Create a new group')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--name <name>', 'Group name')
        .requiredOption('--members <uids>', 'Comma-separated member user IDs (min 2)')
        .option('--avatar <path>', 'Group avatar image path')
        .action(async (options) => {
            try {
                const memberIds = options.members.split(',').map(id => id.trim());

                if (memberIds.length < 2) {
                    error('Group requires at least 2 members');
                    return;
                }

                const api = await getZaloApi(options.account);
                const result = await api.createGroup({
                    name: options.name,
                    members: memberIds,
                    avatarPath: options.avatar || undefined
                });

                output({
                    data: {
                        groupId: result?.groupId,
                        name: options.name,
                        memberCount: memberIds.length + 1, // +1 for creator
                        members: memberIds,
                        status: 'created',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
