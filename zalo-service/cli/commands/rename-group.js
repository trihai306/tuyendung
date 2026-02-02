/**
 * rename-group command - Rename a group
 * 
 * Usage: zalo-cli rename-group --account <ownId> --group <groupId> --name "New Name"
 * 
 * API: api.changeGroupName(groupId, name)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function renameGroupCommand(program) {
    program
        .command('rename-group')
        .description('Rename a group')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .requiredOption('--name <name>', 'New group name')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.changeGroupName(options.group, options.name);

                output({
                    data: {
                        groupId: options.group,
                        newName: options.name,
                        status: 'renamed',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
