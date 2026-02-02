/**
 * send-sticker command - Send a sticker
 * 
 * Usage: zalo-cli send-sticker --account <ownId> --to <threadId> --sticker <stickerId> [--type user|group]
 * 
 * API: api.sendSticker(stickerId, threadId, type)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function sendStickerCommand(program) {
    program
        .command('send-sticker')
        .description('Send a sticker')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--to <threadId>', 'Recipient thread ID')
        .requiredOption('--sticker <stickerId>', 'Sticker ID')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const threadType = options.type === 'group' ? 1 : 0;

                const result = await api.sendSticker(
                    options.sticker,
                    options.to,
                    threadType
                );

                output({
                    data: {
                        messageId: result?.msgId,
                        threadId: options.to,
                        stickerId: options.sticker,
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
