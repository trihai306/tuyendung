/**
 * Disconnect command - Logout and remove saved credentials
 */

import { output, error, deleteCredentials, loadCredentials } from '../lib/zalo.js';

export function disconnectCommand(program) {
    program
        .command('disconnect')
        .description('Disconnect (logout) an account')
        .requiredOption('--account <ownId>', 'Account ownId')
        .option('--keep-cookies', 'Keep saved cookies (allow re-login)')
        .action(async (options) => {
            try {
                const credentials = loadCredentials(options.account);

                if (!credentials) {
                    error(`Account ${options.account} not found`);
                    return;
                }

                // Delete cookies unless --keep-cookies
                if (!options.keepCookies) {
                    deleteCredentials(options.account);
                }

                output({
                    data: {
                        ownId: options.account,
                        status: 'disconnected',
                        cookiesRemoved: !options.keepCookies
                    }
                });

            } catch (err) {
                error(err.message);
            }
        });
}
