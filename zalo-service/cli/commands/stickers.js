/**
 * stickers command - Get available stickers
 * 
 * Usage: zalo-cli stickers --account <ownId>
 * 
 * API: api.getStickers()
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function stickersCommand(program) {
    program
        .command('stickers')
        .description('Get available sticker packs')
        .requiredOption('--account <ownId>', 'Account ownId')
        .option('--limit <number>', 'Maximum sticker packs to return', '20')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);
                const stickers = await api.getStickers();

                const limit = parseInt(options.limit);
                const stickerList = (stickers || []).slice(0, limit);

                output({
                    data: stickerList,
                    total: stickers?.length || 0,
                    returned: stickerList.length
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
