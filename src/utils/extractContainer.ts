import spawn from './spawn';

import { config } from '../globals';

export default async function extractAudioStream(inputPath: string, outputPath: string) {
    return spawn(config.ffmpegPath, [
        '-i', inputPath,
        '-map_metadata', '-1',
        '-c', 'copy',
        outputPath,
        '-y'
    ]).then((spawnedProcess: any) => {
        if (spawnedProcess.code > 0) throw new Error(`Exited with code ${spawnedProcess.code}! Output:\n${spawnedProcess.stderr.toString()}`);
    });
}