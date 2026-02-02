/**
 * react command - Add reaction to message
 * 
 * Usage: zalo-cli react --account <ownId> --message <msgId> --emoji <emoji> --thread <threadId> [--type user|group]
 * 
 * API: api.addReaction(icon, msgId, cliMsgId, threadId, type)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

// Common reactions mapping
const REACTIONS = {
    'like': '👍',
    'love': '❤️',
    'haha': '😆',
    'wow': '😮',
    'sad': '😢',
    'angry': '😠',
    'heart': '❤️',
    'thumbsup': '👍',
    'thumbsdown': '👎'
};

export function reactCommand(program) {
    program
        .command('react')
        .description('Add reaction to message')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--message <msgId>', 'Message ID to react')
        .requiredOption('--thread <threadId>', 'Thread ID containing the message')
        .option('--emoji <emoji>', 'Emoji to react with', 'like')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const threadType = options.type === 'group' ? 1 : 0;

                // Map common names to emojis
                const emoji = REACTIONS[options.emoji.toLowerCase()] || options.emoji;

                const result = await api.addReaction(
                    emoji,
                    options.message,
                    null, // cliMsgId - optional
                    options.thread,
                    threadType
                );

                output({
                    data: {
                        messageId: options.message,
                        threadId: options.thread,
                        emoji: emoji,
                        status: 'added',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
