/**
 * undo command - Undo/recall a sent message
 * 
 * Usage: zalo-cli undo --account <ownId> --thread <threadId> --msgId <msgId>
 * 
 * API: api.undo(message)
 * Note: Requires the original message object or msgId + threadId
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function undoCommand(program) {
    program
        .command('undo')
        .description('Undo/recall a sent message')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--thread <threadId>', 'Thread ID')
        .requiredOption('--msgId <msgId>', 'Message ID to undo')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);

                // Create message object for undo API
                const message = {
                    msgId: options.msgId,
                    threadId: options.thread,
                    type: options.type === 'group' ? 1 : 0
                };

                const result = await api.undo(message);

                output({
                    data: {
                        msgId: options.msgId,
                        threadId: options.thread,
                        status: 'Message recalled',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
