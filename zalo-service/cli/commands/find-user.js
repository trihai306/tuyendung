/**
 * find-user command - Find user by phone number
 * 
 * Usage: zalo-cli find-user --account <ownId> --phone <phoneNumber>
 * 
 * API: api.findUser(phoneNumber)
 * Returns: uid, display_name, avatar, etc.
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function findUserCommand(program) {
    program
        .command('find-user')
        .description('Find user by phone number')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--phone <phoneNumber>', 'Phone number to search')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const user = await api.findUser(options.phone);

                // zca-js User interface fields may be snake_case or camelCase
                // Check both formats for compatibility
                output({
                    data: {
                        uid: user.uid || user.userId,
                        displayName: user.displayName || user.display_name,
                        zaloName: user.zaloName || user.zalo_name,
                        avatar: user.avatar,
                        cover: user.cover,
                        gender: user.gender,
                        dob: user.dob,
                        status: user.status,
                        globalId: user.globalId || user.global_id,
                        // Include raw user for debugging
                        _raw: user
                    }
                });


                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
