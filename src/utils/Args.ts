
type optionsSchema = {
    name: string;
    aliases?: string[];
    shortName?: string;
    shortAliases?: string[];
    type?: string;
    noValue?: boolean;
    default?: any;
}

export default class Args {
    args: {
        name: string;
        value: any;
        options: optionsSchema;
    }[] = [];

    constructor(argv: string[] = process.argv, argOptions: optionsSchema[] = []) {
        argv.forEach((arg, argIndex) => {
            const shortArg = arg.match(/^-([^-][^\s]*)$/)?.[1];
            const longArg = arg.match(/^--([^-][^\s]*)$/)?.[1];
            const argName = shortArg || longArg;
            if (!argName) return;

            const options = argOptions.find(options => {
                if (options.name === longArg) return true;
                if (longArg && options.aliases && options.aliases.includes(longArg)) return true;
                if (options.shortName && options.shortName === shortArg) return true;
                if (shortArg && options.shortAliases && options.shortAliases.includes(shortArg)) return true;
            });
            if (!options) return;

            const value = argv[argIndex + 1];
            if (!value && !options.noValue) return;

            const parsedValue =
                options.noValue ? true :
                options.type === 'int' ? parseInt(value, 10) :
                options.type === 'float' ? parseFloat(value) :
                options.type === 'bool' ? ['yes', 'true', '1'].includes(value.toLowerCase()) :
                value;
            
            this.args.push({
                name: options.name,
                value: parsedValue,
                options
            });
        });
    }

    get(name: string) {
        return this.getAll(name)[0];
    }

    getAll(name: string) {
        return this.args.filter(arg => arg.name === name).map(arg => arg.value ?? arg.options.default);
    }
}