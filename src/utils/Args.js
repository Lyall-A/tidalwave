class Args {
    args = [];

    constructor(argv = process.argv, argOptions = []) {
        argv.forEach((arg, argIndex) => {
            const shortArg = arg.match(/^-([^-][^\s]*)$/)?.[1];
            const longArg = arg.match(/^--([^-][^\s]*)$/)?.[1];
            const argName = shortArg || longArg;
            if (!argName) return;

            const options = argOptions.find(options => {
                if (options.shortName && options.shortName === shortArg) return true;
                if (options.shortAliases && options.shortAliases.includes(shortArg)) return true;
                if (options.name && options.name === longArg) return true;
                if (options.aliases && options.aliases.includes(longArg)) return true;
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

    get(name) {
        return this.getAll(name)[0];
    }

    getAll(name) {
        return this.args.filter(arg => arg.name === name).map(arg => arg.value ?? arg.default);
    }
}

module.exports = Args;