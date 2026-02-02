/**
 * account-info command - Get logged-in account information
 * 
 * Usage: zalo-cli account-info --account <ownId>
 * 
 * API: api.fetchAccountInfo()
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function accountInfoCommand(program) {
    program
        .command('account-info')
        .description('Get logged-in account information')
        .requiredOption('--account <ownId>', 'Account ownId')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const info = await api.fetchAccountInfo();

                output({
                    data: {
                        uid: api.getOwnId(),
                        displayName: info.profile?.displayName,
                        zaloName: info.profile?.zaloName,
                        avatar: info.profile?.avatar,
                        cover: info.profile?.cover,
                        phoneNumber: info.profile?.phoneNumber,
                        gender: info.profile?.gender,
                        dob: info.profile?.dob,
                        status: info.profile?.status
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
