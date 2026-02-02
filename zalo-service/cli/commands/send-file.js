/**
 * send-file command - Send file attachment
 * 
 * Usage: zalo-cli send-file --account <ownId> --to <threadId> --file <path> [--type user|group]
 * 
 * API: api.sendMessage({ msg, attachments }, threadId, type)
 */

import fs from 'fs';
import path from 'path';
import { output, error, getZaloApi } from '../lib/zalo.js';

export function sendFileCommand(program) {
    program
        .command('send-file')
        .description('Send file attachment')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--to <threadId>', 'Recipient thread ID')
        .requiredOption('--file <path>', 'File path to send')
        .option('--message <text>', 'Optional message with file', '')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .action(async (options) => {
            try {
                // Validate file exists
                const filePath = path.resolve(options.file);
                if (!fs.existsSync(filePath)) {
                    error(`File not found: ${filePath}`);
                    return;
                }

                const api = await getZaloApi(options.account);
                const threadType = options.type === 'group' ? 1 : 0;

                const messageContent = {
                    msg: options.message,
                    attachments: [{ filePath }]
                };

                const result = await api.sendMessage(messageContent, options.to, threadType);

                output({
                    data: {
                        messageId: result?.message?.msgId,
                        attachments: result?.attachment?.map(a => ({ msgId: a.msgId })),
                        threadId: options.to,
                        type: options.type,
                        filePath: filePath,
                        sentAt: new Date().toISOString()
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
