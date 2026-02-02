/**
 * user-info command - Get user profile information
 * 
 * Usage: zalo-cli user-info --account <ownId> --user <userId>
 * 
 * API: api.getUserInfo(userId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function userInfoCommand(program) {
    program
        .command('user-info')
        .description('Get user profile information')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--user <userId>', 'User ID to get info')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const info = await api.getUserInfo(options.user);

                // getUserInfo can accept array, returns object keyed by uid
                const userData = info[options.user] || info;

                output({
                    data: userData
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
