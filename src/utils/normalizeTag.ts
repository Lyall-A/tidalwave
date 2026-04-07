export default function normalizeTag(value: string | string[], separator?: string) {
    if (value instanceof Array) {
        if (separator) return value.join(separator);
        return value[0];
    } else {
        return value;
    };
}