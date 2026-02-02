/**
 * edit-note command - Edit a note
 * 
 * Usage: zalo-cli edit-note --account <ownId> --note <noteId> --content "New content"
 * 
 * API: api.editNote(options)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function editNoteCommand(program) {
    program
        .command('edit-note')
        .description('Edit an existing note')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--note <noteId>', 'Note ID to edit')
        .option('--content <text>', 'New note content')
        .option('--title <text>', 'New note title')
        .action(async (options) => {
            try {
                if (!options.content && !options.title) {
                    error('Either --content or --title is required');
                    return;
                }

                const api = await getZaloApi(options.account);

                const updateData = { noteId: options.note };
                if (options.content) updateData.content = options.content;
                if (options.title) updateData.title = options.title;

                const result = await api.editNote(updateData);

                output({
                    data: {
                        noteId: options.note,
                        title: options.title,
                        content: options.content,
                        status: 'updated',
                        result
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
