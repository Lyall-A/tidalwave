import path from 'path';

import formatString from './formatString';

export default function formatPath(unformattedPath: string, obj: { }) {
    const { root } = path.parse(unformattedPath);
    return `${root}${path.normalize(unformattedPath)
        .replace(root, '')
        .split(path.sep)
        .map(i => formatString(i, obj).replace(/\/|\\|\?|\*|\:|\||\"|\<|\>/g, ''))
        .join(path.sep)}`;
};