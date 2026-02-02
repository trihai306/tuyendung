/**
 * lock-poll command - Lock/close a poll
 * 
 * Usage: zalo-cli lock-poll --account <ownId> --poll <pollId>
 * 
 * API: api.lockPoll(pollId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function lockPollCommand(program) {
    program
        .command('lock-poll')
        .description('Lock/close a poll')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--poll <pollId>', 'Poll ID to lock')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const result = await api.lockPoll(options.poll);

                output({
                    data: {
                        pollId: options.poll,
                        status: 'locked',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
