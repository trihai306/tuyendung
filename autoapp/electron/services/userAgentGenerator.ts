/**
 * User-Agent Generator
 * Generates realistic, up-to-date User-Agent strings with matching platform metadata.
 * Each profile gets a consistent UA based on its fingerprint seed.
 */

interface UAProfile {
    userAgent: string;
    platform: string;
    appVersion: string;
    oscpu: string;
    vendor: string;
}

// Chrome 120-131 on various platforms (updated pool)
const UA_TEMPLATES: Array<{
    os: 'windows' | 'macos' | 'linux';
    platform: string;
    oscpu: string;
    vendor: string;
    template: string;
}> = [
    // Windows 10/11
    {
        os: 'windows',
        platform: 'Win32',
        oscpu: 'Windows NT 10.0; Win64; x64',
        vendor: 'Google Inc.',
        template: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36',
    },
    {
        os: 'windows',
        platform: 'Win32',
        oscpu: 'Windows NT 10.0; Win64; x64',
        vendor: 'Google Inc.',
        template: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36',
    },
    // macOS
    {
        os: 'macos',
        platform: 'MacIntel',
        oscpu: 'Intel Mac OS X 10_15_7',
        vendor: 'Google Inc.',
        template: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36',
    },
    {
        os: 'macos',
        platform: 'MacIntel',
        oscpu: 'Intel Mac OS X 14_0',
        vendor: 'Google Inc.',
        template: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36',
    },
    // Linux
    {
        os: 'linux',
        platform: 'Linux x86_64',
        oscpu: 'Linux x86_64',
        vendor: 'Google Inc.',
        template: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36',
    },
];

const CHROME_VERSIONS = [
    '120.0.6099.109',
    '121.0.6167.85',
    '122.0.6261.94',
    '123.0.6312.86',
    '124.0.6367.91',
    '125.0.6422.76',
    '126.0.6478.114',
    '127.0.6533.72',
    '128.0.6613.84',
    '129.0.6668.70',
    '130.0.6723.58',
    '131.0.6778.86',
];

/**
 * Simple seeded pseudo-random number generator (Mulberry32).
 * Used to deterministically select UA components based on profile seed.
 */
function seededRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state |= 0;
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Generate a numeric hash from a string (for seeding the PRNG).
 */
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash);
}

/**
 * Generate a consistent UAProfile for a given fingerprint seed.
 */
export function generateUA(fingerprintSeed: string, preferredOS?: 'windows' | 'macos' | 'linux'): UAProfile {
    const rng = seededRandom(hashString(fingerprintSeed));

    // Filter by OS preference if provided
    const pool = preferredOS
        ? UA_TEMPLATES.filter(t => t.os === preferredOS)
        : UA_TEMPLATES;

    const templateIdx = Math.floor(rng() * pool.length);
    const template = pool[templateIdx];

    const versionIdx = Math.floor(rng() * CHROME_VERSIONS.length);
    const version = CHROME_VERSIONS[versionIdx];

    const userAgent = template.template.replace('{version}', version);
    const appVersion = userAgent.replace('Mozilla/', '');

    return {
        userAgent,
        platform: template.platform,
        appVersion,
        oscpu: template.oscpu,
        vendor: template.vendor,
    };
}

/**
 * Get a random Chrome version string.
 */
export function getRandomChromeVersion(): string {
    return CHROME_VERSIONS[Math.floor(Math.random() * CHROME_VERSIONS.length)];
}
