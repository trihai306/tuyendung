/**
 * Login command - QR code authentication
 */

import { Zalo } from 'zca-js';
import path from 'path';
import { output, error, saveCredentials, DATA_DIR } from '../lib/zalo.js';

export function loginCommand(program) {
    program
        .command('login')
        .description('Login with QR code')
        .option('--timeout <seconds>', 'QR scan timeout', '60')
        .action(async (options) => {
            try {
                const zalo = new Zalo({
                    selfListen: false,
                    checkUpdate: true,
                    logging: false
                });

                let hasOutput = false;

                // Login with QR
                const api = await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        if (!hasOutput) {
                            reject(new Error('QR code generation timeout'));
                        }
                    }, parseInt(options.timeout) * 1000);

                    zalo.loginQR({
                        qrPath: path.join(DATA_DIR, 'qr.png')
                    }, (qrData) => {
                        // Output QR code immediately when generated
                        if (!hasOutput && qrData?.data?.image) {
                            hasOutput = true;
                            output({
                                stage: 'qr_generated',
                                qrCode: `data:image/png;base64,${qrData.data.image}`,
                                message: 'Scan QR with Zalo app'
                            });
                        }
                    }).then(api => {
                        clearTimeout(timeout);
                        resolve(api);
                    }).catch(err => {
                        clearTimeout(timeout);
                        reject(err);
                    });
                });

                // Get account info
                const accountInfo = await api.fetchAccountInfo();
                const profile = accountInfo.profile;
                const ownId = api.getOwnId();

                // Save credentials
                const context = await api.getContext();
                saveCredentials(ownId, {
                    imei: context.imei,
                    cookie: context.cookie,
                    userAgent: context.userAgent
                });

                output({
                    stage: 'login_success',
                    data: {
                        ownId,
                        displayName: profile.displayName,
                        phone: profile.phoneNumber,
                        avatar: profile.avatar,
                        credentials: {
                            imei: context.imei,
                            cookie: context.cookie,
                            userAgent: context.userAgent
                        }
                    }
                });

                // Exit cleanly
                process.exit(0);

            } catch (err) {
                error(err.message);
            }
        });
}
