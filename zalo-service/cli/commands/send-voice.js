/**
 * send-voice command - Send a voice message
 * 
 * Usage: zalo-cli send-voice --account <ownId> --to <threadId> --file <path> [--type user|group]
 * 
 * API: api.sendVoice(voicePath, threadId, type)
 */

import fs from 'fs';
import path from 'path';
import { output, error, getZaloApi } from '../lib/zalo.js';

export function sendVoiceCommand(program) {
    program
        .command('send-voice')
        .description('Send a voice message')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--to <threadId>', 'Recipient thread ID')
        .requiredOption('--file <path>', 'Voice file path (mp3, m4a, etc.)')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                // Validate file exists
                const filePath = path.resolve(options.file);
                if (!fs.existsSync(filePath)) {
                    error(`File not found: ${filePath}`);
                    return;
                }

                const api = await getZaloApi(options.account, options.credentials);
                const threadType = options.type === 'group' ? 1 : 0;

                const result = await api.sendVoice(filePath, options.to, threadType);

                output({
                    data: {
                        messageId: result?.msgId,
                        threadId: options.to,
                        type: options.type,
                        filePath: filePath,
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
