import tidalApi from'./tidalApi';

import parseVideo from './parseVideo';

export default function getVideo(videoId: number) {
    return tidalApi('privatev1', `/videos/${videoId}`).then(({ json }) => parseVideo(json));
}