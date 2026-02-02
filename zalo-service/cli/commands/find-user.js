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
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const user = await api.findUser(options.phone);

                output({
                    data: {
                        uid: user.uid,
                        displayName: user.display_name,
                        zaloName: user.zalo_name,
                        avatar: user.avatar,
                        cover: user.cover,
                        gender: user.gender,
                        dob: user.dob,
                        status: user.status,
                        globalId: user.globalId
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
