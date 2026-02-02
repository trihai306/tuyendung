/**
 * group-info command - Get detailed group information
 * 
 * Usage: zalo-cli group-info --account <ownId> --group <groupId>
 * 
 * API: api.getGroupInfo(groupId)
 */

import { output, error, getZaloApi } from '../lib/zalo.js';

export function groupInfoCommand(program) {
    program
        .command('group-info')
        .description('Get detailed group information')
        .requiredOption('--account <ownId>', 'Account ownId')
        .requiredOption('--group <groupId>', 'Group ID')
        .option('--credentials <json>', 'Credentials JSON from database')
        .action(async (options) => {
            try {
                const api = await getZaloApi(options.account, options.credentials);
                const info = await api.getGroupInfo(options.group);

                // getGroupInfo returns object keyed by groupId
                const groupData = info.gridInfoMap?.[options.group] || info;

                output({
                    data: {
                        groupId: options.group,
                        name: groupData.name,
                        description: groupData.desc || '',
                        avatar: groupData.avt,
                        memberCount: groupData.memVerList?.length || groupData.totalMember || 0,
                        creatorId: groupData.creatorId,
                        admins: groupData.adminIds || [],
                        members: (groupData.memVerList || []).map(m => ({
                            id: m.id,
                            displayName: m.dName,
                            avatar: m.avatar
                        })),
                        createdAt: groupData.createTime,
                        settings: {
                            lockSendMsg: groupData.setting?.lockSendMsg,
                            lockAddMember: groupData.setting?.lockAddMember,
                            lockViewMembers: groupData.setting?.lockViewMembers
                        }
                    }
                });

                process.exit(0);
            } catch (err) {
                error(err.message);
            }
        });
}
