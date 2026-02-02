/**
 * Send command - Send message to user or group
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function sendCommand(program) {
    program
        .command('send')
        .description('Send a message')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--to <threadId>', 'Recipient thread ID')
        .requiredOption('--message <text>', 'Message content')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);

                // ThreadType: 0 = User, 1 = Group
                const threadType = options.type === 'group' ? 1 : 0;

                const result = await api.sendMessage(
                    options.message,
                    options.to,
                    threadType
                );

                output({
                    data: {
                        messageId: result?.msgId,
                        threadId: options.to,
                        type: options.type,
                        content: options.message,
                        sentAt: new Date().toISOString()
                    }
                });

                process.exit(0);

            } catch (err) {
                error(err.message);
            }
        });
}
