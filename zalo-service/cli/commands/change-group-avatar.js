/**
 * change-group-avatar command - Change group avatar
 * 
 * Usage: zalo-cli change-group-avatar --account <ownId> --group <groupId> --file <avatarPath>
 * 
 * API: api.changeGroupAvatar(groupId, avatarPath)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function changeGroupAvatarCommand(program) {
    program
        .command('change-group-avatar')
        .description('Change group avatar')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .requiredOption('--file <avatarPath>', 'Path to avatar image')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.changeGroupAvatar(options.group, options.file);

                output({
                    data: {
                        groupId: options.group,
                        status: 'Avatar changed',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
