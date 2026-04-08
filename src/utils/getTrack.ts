import tidalApi from './tidalApi';

import parseTrack from './parseTrack';

export default async function getTrack(trackId: number) {
    return tidalApi('privatev1', `/tracks/${trackId}`).then(({ json }) => parseTrack(json));
}