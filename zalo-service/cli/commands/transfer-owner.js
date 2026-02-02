/**
 * transfer-owner command - Transfer group ownership
 * 
 * Usage: zalo-cli transfer-owner --account <ownId> --group <groupId> --user <userId>
 * 
 * API: api.changeGroupOwner(groupId, newOwnerId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function transferOwnerCommand(program) {
    program
        .command('transfer-owner')
        .description('Transfer group ownership')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .requiredOption('--user <userId>', 'New owner user ID')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.changeGroupOwner(options.group, options.user);

                output({
                    data: {
                        groupId: options.group,
                        newOwnerId: options.user,
                        status: 'transferred',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
