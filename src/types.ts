// TODO: find optional stuff in all types
// TODO: move fake enums in global.ts to here

export type Track = {
    id: number;
    title: string;
    fullTitle: string;
    version?: string;
    duration: number;
    upload: boolean;
    copyright: string;
    explicit: boolean;
    mixId: string;
    isrc: string;
    quality: string; // TODO: enum
    modes: string[]; // TODO: enum
    qualityTypes: string[]; // TODO: enum
    trackNumber: number;
    volumeNumber: number;
    replayGain: number;
    peak: number;
    bpm: number;
    key: string; // TODO: enum?
    keyScale: string; // TODO: enum
    url: string;
    artists: Artist[];
    album: Album;
};

export type Album = {
    id: number;
    title: string;
    version?: string;
    description: string;
    type: string; // TODO: enum
    duration: number;
    upload: boolean;
    trackCount: number;
    volumeCount: number;
    releaseDate: string;
    copyright: string;
    explicit: boolean;
    upc: string;
    covers?: any; // TODO: type
    videoCovers?: any; // TODO: type
    quality: string; // TODO: enum
    modes: string[]; // TODO: enum
    qualityTypes: string[]; // TODO: enum
    credits?: Credit[];
    trackCredits?: { track: Track; credits: Credit[]; }[];
    review?: {
        originalText: string;
        text: string;
        source: string;
    };
    url: string;
    artists: Artist[];
    tracks: Track[];
};

export type Artist = {
    id: number;
    name: number;
    biography?: {
        originalText: string;
        text: string;
        source: string;
    };
    pictures?: any; // TODO: type
    types: string[]; // TODO: enum
    roles: { id: number; category: string; }[]; // TODO: enum on category
    albums: Album[];
};

export type Video = {
    id: number;
    title: string;
    type: string; // TODO: enum
    duration: number;
    releaseDate: string;
    explicit: boolean;
    quality: string; // TODO: enum
    images?: any;
    trackNumber: number;
    volumeNumber: number;
    artists: Artist[];
};

export type Playlist = {
    uuid: string;
    title: string;
    description: string;
    duration: number;
    images?: any; // TODO
    customImage: string;
    sharing: SharingLevel;
    created: string;
    lastUpdated: string;
    items: (
        { type: 'track', item: Track } |
        { type: 'video', item: Video }
    )[];
}

export type Mix = {
    id: string;
    title: string;
    subTitle: string;
    shortSubTitle: string;
    description: string;
    images: any; // TODO
    detailImages: any; // TODO
    tracks: Track[];
};

export type Credit = {
    type: string;
    tagName: string;
    contributors: {
        name: string;
        id: number;
    }[];
};

export enum SharingLevel {
    PUBLIC = 'PUBLIC',
    PRIVATE = 'PRIVATE'
};