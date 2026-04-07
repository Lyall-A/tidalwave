import spawn from './spawn';

import { config } from '../globals';

export default function embedMetadata(file: string, tags: string[]) {
    return spawn(config.kid3CliPath, [
        ...tags.map(([tag, value, isFile]) => {
            if (isFile) {
                return ['-c', `set "${escapeQuotes(tag)}":"${escapeQuotes(value)}" ""`];
            } else {
                return ['-c', `set "${escapeQuotes(tag)}" "${escapeQuotes(value)}"`];
            }
        }).flat(),
        file
    ]);
};

function escapeQuotes(input: string) {
    return input.toString().replace(/"/g, i => `\\${i}`);
}