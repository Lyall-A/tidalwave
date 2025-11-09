function parseCredits(credits) {
    return Object.fromEntries(credits.map(credit => {
        const type = credit.type.toLowerCase();
        const contributors = credit.contributors;
        
        return [
            // TODO: add missing types and maybe change keys
            type === 'producer' ? 'producer' :
            type === 'executive producer' ? 'executiveProducer' :
            type === 'composer' ? 'composer' :
            type === 'engineer' ? 'engineer' :
            type === 'mastering engineer' ? 'masteringEngineer' :
            type === 'mixing engineer' ? 'mixingEngineer' :
            type === 'additional engineer' ? 'additionalEngineer' :
            type === 'assistant engineer' ? 'assistantEngineer' :
            type === 'recording engineer' ? 'recordingEngineer' :
            type === 'associated performer' ? 'associatedPerformer' :
            type === 'mixer' ? 'mixer' :
            type === 'lyricist' ? 'lyricist' :
            type === 'background vocal' ? 'backgroundVocal' :
            type === 'vocal' ? 'vocal' :
            type === 'guitar' ? 'guitar' :
            type === 'bass' ? 'bass' :
            type === 'piano' ? 'piano' :
            type === 'drums' ? 'drums' :
            type === 'horn' ? 'horn' :
            type === 'strings' ? 'strings' :
            type === 'whistles' ? 'whistle' :
            type === 'keyboards' ? 'keyboard' :
            type === 'banjo' ? 'banjo' :
            type === 'remixer' ? 'remixer' :
            type === 'primary artist' ? 'primaryArtist' :
            type === 'photography' ? 'photographer' :
            type === 'music publisher' ? 'publisher' :
            type === 'record label' ? 'label' :
            type,
            contributors
        ];
    }))
}

module.exports = parseCredits;