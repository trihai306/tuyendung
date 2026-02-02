/**
 * create-note command - Create a note in group
 * 
 * Usage: zalo-cli create-note --account <ownId> --group <groupId> --content "Note content"
 * 
 * API: api.createNote(options)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function createNoteCommand(program) {
    program
        .command('create-note')
        .description('Create a note in group')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .requiredOption('--content <text>', 'Note content')
        .option('--title <text>', 'Note title')
        .option('--pinned', 'Pin the note')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account);

                const result = await api.createNote({
                    groupId: options.group,
                    content: options.content,
                    title: options.title || '',
                    pinned: !!options.pinned
                });

                output({
                    data: {
                        noteId: result?.noteId,
                        groupId: options.group,
                        title: options.title || '',
                        content: options.content,
                        pinned: !!options.pinned,
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
