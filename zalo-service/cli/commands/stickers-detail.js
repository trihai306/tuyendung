/**
 * stickers-detail command - Get sticker pack details
 * 
 * Usage: zalo-cli stickers-detail --account <ownId> --type <stickerType>
 * 
 * API: api.getStickersDetail(stickerType)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function stickersDetailCommand(program) {
    program
        .command('stickers-detail')
        .description('Get sticker pack details')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--type <stickerType>', 'Sticker type/pack ID')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const result = await api.getStickersDetail(options.type);

                output({
                    data: result
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
