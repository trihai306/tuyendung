/**
 * pin command - Pin/unpin a conversation
 * 
 * Usage: zalo-cli pin --account <ownId> --thread <threadId> [--unpin]
 * 
 * API: api.pinConversations(conversations)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function pinCommand(program) {
    program
        .command('pin')
        .description('Pin or unpin a conversation')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--thread <threadId>', 'Thread ID to pin/unpin')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .option('--unpin', 'Unpin instead of pin')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const threadType = options.type === 'group' ? 1 : 0;

                const conversations = [{
                    id: options.thread,
                    type: threadType,
                    pinned: !options.unpin
                }];

                const result = await api.pinConversations(conversations);

                output({
                    data: {
                        threadId: options.thread,
                        type: options.type,
                        pinned: !options.unpin,
                        status: options.unpin ? 'unpinned' : 'pinned',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
