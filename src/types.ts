// TODO: find optional stuff in all types

export type Track = {
    id: number;
    title: string;
    fullTitle: string;
    version: string | null;
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
    version: string | null;
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
    covers: any | null; // TODO: type
    videoCovers: any | null; // TODO: type
    quality: string; // TODO: enum
    modes: string[]; // TODO: enum
    qualityTypes: string[]; // TODO: enum
    credits: any | null; // TODO: type returned by parseCredits
    trackCredits: { track: Track; credits: string; }[] | null;
    review: {
        originalText: string;
        text: string;
        source: string;
    } | null;
    url: string;
    artists: Artist[];
    tracks: Track[];
};

export type Artist = {
    id: number;
    name: number;
    biography: {
        originalText: string;
        text: string;
        source: string;
    } | null;
    pictures: any | null; // TODO: type
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
    images: any | null;
    trackNumber: number;
    volumeNumber: number;
    artists: Artist[];
};

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