/**
 * create-poll command - Create a poll in group
 * 
 * Usage: zalo-cli create-poll --account <ownId> --group <groupId> --question "What?" --options "A,B,C"
 * 
 * API: api.createPoll(options)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function createPollCommand(program) {
    program
        .command('create-poll')
        .description('Create a poll in group')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .requiredOption('--question <text>', 'Poll question')
        .requiredOption('--options <list>', 'Comma-separated poll options')
        .option('--multi', 'Allow multiple selections')
        .option('--anonymous', 'Anonymous voting')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const pollOptions = options.options.split(',').map(o => o.trim());

                if (pollOptions.length < 2) {
                    error('Poll requires at least 2 options');
                    return;
                }

                const api = await getZaloApi(options.account, options.credentials);

                const result = await api.createPoll({
                    question: options.question,
                    options: pollOptions,
                    groupId: options.group,
                    allowMultipleChoices: !!options.multi,
                    isAnonymous: !!options.anonymous
                });

                output({
                    data: {
                        pollId: result?.pollId,
                        groupId: options.group,
                        question: options.question,
                        options: pollOptions,
                        multipleChoice: !!options.multi,
                        anonymous: !!options.anonymous,
                        status: 'created',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
