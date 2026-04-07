import tidalApi from './tidalApi';

import parseMix from './parseMix';

export default async function getMix(mixId: number) {
    return tidalApi('privatev1', '/pages/mix', { query: { mixId } }).then(({ json }) => parseMix(json.rows[0].modules[0].mix, {
        items: json.rows[1].modules[0].pagedList.items
    }));
}