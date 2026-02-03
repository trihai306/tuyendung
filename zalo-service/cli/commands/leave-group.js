/**
 * leave-group command - Leave a group
 * 
 * Usage: zalo-cli leave-group --account <ownId> --group <groupId> [--silent]
 * 
 * API: api.leaveGroup(groupId, silent)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function leaveGroupCommand(program) {
    program
        .command('leave-group')
        .description('Leave a group')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID to leave')
        .option('--silent', 'Leave silently without notification', false)
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.leaveGroup(options.group, options.silent);

                output({
                    data: {
                        groupId: options.group,
                        success: true,
                        silent: options.silent
                    },
                    message: 'Left group successfully'
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
