/**
 * send-report command - Report user or content
 * 
 * Usage: zalo-cli send-report --account <ownId> --thread <threadId> --reason <reason>
 * 
 * API: api.sendReport(threadId, reason)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function sendReportCommand(program) {
    program
        .command('send-report')
        .description('Report user or content')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--thread <threadId>', 'Thread ID to report')
        .option('--reason <reason>', 'Report reason', 'spam')
        .option('--type <type>', 'Thread type: user or group', 'user')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.sendReport(options.thread, options.reason);

                output({
                    data: {
                        threadId: options.thread,
                        reason: options.reason,
                        status: 'Report sent',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
