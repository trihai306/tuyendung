/**
 * send-card command - Send a contact card
 * 
 * Usage: zalo-cli send-card --account <ownId> --to <threadId> --user <userId> [--type user|group]
 * 
 * API: api.sendCard(userId, threadId, type)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function sendCardCommand(program) {
    program
        .command('send-card')
        .description('Send a contact card')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--to <threadId>', 'Recipient thread ID')
        .requiredOption('--user <userId>', 'User ID to share as contact')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const threadType = options.type === 'group' ? 1 : 0;

                const result = await api.sendCard(options.user, options.to, threadType);

                output({
                    data: {
                        messageId: result?.msgId,
                        threadId: options.to,
                        contactUserId: options.user,
                        type: options.type,
                        status: 'sent',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
