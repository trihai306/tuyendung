/**
 * delete-group command - Delete/disband a group
 * 
 * Usage: zalo-cli delete-group --account <ownId> --group <groupId>
 * 
 * API: api.disperseGroup(groupId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function deleteGroupCommand(program) {
    program
        .command('delete-group')
        .description('Delete/disband a group (owner only)')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID to delete')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.disperseGroup(options.group);

                output({
                    data: {
                        groupId: options.group,
                        status: 'deleted',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
