/**
 * delete-message command - Delete a message
 * 
 * Usage: zalo-cli delete-message --account <ownId> --message <msgId> --thread <threadId> [--for-all]
 * 
 * API: api.deleteMessage(msgId, cliMsgId, threadId, type)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function deleteMessageCommand(program) {
    program
        .command('delete-message')
        .description('Delete a message')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--message <msgId>', 'Message ID to delete')
        .requiredOption('--thread <threadId>', 'Thread ID containing the message')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .option('--for-all', 'Delete for everyone (undo/recall)')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const threadType = options.type === 'group' ? 1 : 0;

                let result;
                if (options.forAll) {
                    // Recall message for everyone
                    result = await api.undo(options.message, null, options.thread, threadType);
                } else {
                    // Delete for self only
                    result = await api.deleteMessage(options.message, null, options.thread, threadType);
                }

                output({
                    data: {
                        messageId: options.message,
                        threadId: options.thread,
                        deletedForAll: !!options.forAll,
                        status: 'deleted',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
