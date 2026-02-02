/**
 * Accounts command - List saved accounts
 */

import { output, error, getSavedAccounts, loadCredentials, getZaloApi } from '../lib/zalo.js';

export function accountsCommand(program) {
    program
        .command('accounts')
        .description('List all saved accounts')
        .option('--check-status', 'Check online status of each account')
        .action(async (options) => {
            try {
                const accountIds = getSavedAccounts();
                const accounts = [];

                for (const ownId of accountIds) {
                    const account = { ownId, status: 'saved' };

                    if (options.checkStatus) {
                        try {
                            const api = await getZaloApi(ownId);
                            const info = await api.fetchAccountInfo();
                            account.displayName = info.profile.displayName;
                            account.phone = info.profile.phoneNumber;
                            account.avatar = info.profile.avatar;
                            account.status = 'connected';
                        } catch (e) {
                            account.status = 'disconnected';
                            account.error = e.message;
                        }
                    }

                    accounts.push(account);
                }

                output({ data: accounts, total: accounts.length });

            } catch (err) {
                error(err.message);
            }
        });
}
