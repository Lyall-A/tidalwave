import child_process from 'child_process';
import path from 'path';

import { execDir, logger } from '../globals';

export default function spawn(command: string, args: string[]): Promise<{
    code: number;
    stdout: Uint8Array;
    stderr: Uint8Array;
}> {
    return new Promise((resolve, reject) => {
        logger.log(`Spawning '${command}', args: ${args.join(', ')}`, 'debug');

        const spawnedProcess = child_process.spawn(command, args, {
            env: {
                ...process.env,
                PATH: `${path.join(execDir, 'bin')}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`
            }
        });

        const stdoutChunks: any = [];
        const stderrChunks: any = [];

        spawnedProcess.stdout.on('data', chunk => stdoutChunks.push(chunk));
        spawnedProcess.stderr.on('data', chunk => stderrChunks.push(chunk));
        spawnedProcess.on('error', err => reject(err));
        spawnedProcess.on('exit', (code: number) => resolve({
            code,
            stdout: Buffer.concat(stdoutChunks),
            stderr: Buffer.concat(stderrChunks),
        }));
    });
}