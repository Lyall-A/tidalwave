export enum ANSI_CODES {
    RESET = 0,
    BOLD = 1,
    UNDERLINE = 4,
    FG_BLACK = 30,
    FG_RED = 31,
    FG_GREEN = 32,
    FG_YELLOW = 33,
    FG_BLUE = 34,
    FG_MAGENTA = 35,
    FG_CYAN = 36,
    FG_WHITE = 37,
    FG_BRIGHT_BLACK = 90,
    FG_BRIGHT_RED = 91,
    FG_BRIGHT_GREEN = 92,
    FG_BRIGHT_YELLOW = 93,
    FG_BRIGHT_BLUE = 94,
    FG_BRIGHT_MAGENTA = 95,
    FG_BRIGHT_CYAN = 96,
    FG_BRIGHT_WHITE = 97,
    BG_BLACK = 40,
    BG_RED = 41,
    BG_GREEN = 42,
    BG_YELLOW = 43,
    BG_BLUE = 44,
    BG_MAGENTA = 45,
    BG_CYAN = 46,
    BG_WHITE = 47,
    BG_BRIGHT_BLACK = 100,
    BG_BRIGHT_RED = 101,
    BG_BRIGHT_GREEN = 102,
    BG_BRIGHT_YELLOW = 103,
    BG_BRIGHT_BLUE = 104,
    BG_BRIGHT_MAGENTA = 105,
    BG_BRIGHT_CYAN = 106,
    BG_BRIGHT_WHITE = 107
};
export default class Logger {
    debugLogs: boolean;
    levelPadding?: number;
    levels: {
        id: string;
        name: string;
        prefix?: string;
        suffix?: string;
        fgColor?: string | number;
        bgColor?: string | number;
    }[];

    lastLog = '';

    constructor(options: {
        debugLogs?: boolean;
        levelPadding?: number;
        levels?: {
            id: string;
            name: string;
            prefix?: string;
            suffix?: string;
            fgColor?: string | number;
            bgColor?: string | number;
        }[];
    } = { }) {
        this.debugLogs = options.debugLogs ?? false;
        this.levelPadding = options.levelPadding;
        this.levels = options.levels ?? [
            { name: 'INFO', id: 'info', prefix: '' },
            { name: 'WARN', id: 'warn', fgColor: 93 },
            { name: 'ERROR', id: 'error', fgColor: 31 },
            { name: 'DEBUG', id: 'debug', fgColor: 90 },
        ];
    }
    
    static applyColor(options: {
        fg?: string | number;
        bg?: string | number;
        bold?: boolean;
        underline?: boolean;
    } = { }, string: any) {
        const ansiCodes = [];
        if (options.fg) ansiCodes.push(ANSI_CODES[`FG_${options.fg}`.toUpperCase() as keyof typeof ANSI_CODES] ?? options.fg);
        if (options.bg) ansiCodes.push(ANSI_CODES[`BG_${options.bg}`.toUpperCase() as keyof typeof ANSI_CODES] ?? options.bg);
        if (options.bold) ansiCodes.push(ANSI_CODES.BOLD);
        if (options.underline) ansiCodes.push(ANSI_CODES.UNDERLINE);

        return `\x1b[${ansiCodes.filter(i => i).join(';')}m${string !== undefined ? `${string}\x1b[${ANSI_CODES.RESET}m` : ''}`;
    }

    static getDisplayedLength(string: string) {
        return string.replace(/\x1b\[[0-9;]*m/g, '').length;
    }

    emptyLine() {
        this.log('');
    }

    getLevel(levelId: any) {
        const level = this.levels.find(i => i.id === levelId);
        if (!level) return;

        return {
            ...level,
            prefix: level.prefix ?? `[${Logger.applyColor({ fg: level.fgColor, bg: level.bgColor }, level.name)}]${this.levelPadding ? ' '.repeat(this.levelPadding - level.name.length) : ''} `,
            suffix: level.suffix ?? ''
        }
    }

    log(msg: string, levelId?: string, replaceLine?: boolean, noStore?: boolean) {
        const level = this.getLevel(levelId);
        if (!this.debugLogs && level?.id === 'debug') return;

        if (replaceLine && !this.debugLogs) {
            const lastLogLines = this.lastLog.split('\n');
            const [windowWidth, windowHeight] = process.stdout.getWindowSize();
            const lastLogLineCount = lastLogLines.length + lastLogLines.reduce((sum, line) => sum + Math.floor((Logger.getDisplayedLength(line) - 1) / windowWidth), 0); // calculate line count, including \n's and text wrapping
            
            for (let lineIndex = 0; lineIndex < lastLogLineCount; lineIndex++) {
                process.stdout.moveCursor(0, -1);
                process.stdout.clearLine(-1);
            }
        }

        const log = `${level?.prefix || ''}${msg}${level?.suffix || ''}\n`;
        this.lastLog = !noStore ? log : '';

        process.stdout.write(log);
    }
}