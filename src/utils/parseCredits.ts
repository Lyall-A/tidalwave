import { logger, tidalCredits } from '../globals';
import { Credit } from '../types';

export default function parseCredits(credits: {
    type: string;
    contributors: {
        name: string;
        id: number;
    }[];
}[]) {
    return credits.map(rawCredit => {
        const credit = tidalCredits.find(i => i.type.toLowerCase() === rawCredit.type.toLowerCase());
        if (!credit) return logger.log(`Got unknown credit type "${rawCredit.type}", contributors: ${rawCredit.contributors.map(i => i.name).join(', ')}`, 'debug');
        
        return {
            type: credit.type,
            tagName: credit.tagName,
            contributors: rawCredit.contributors
        };
    }).filter(i => i) as Credit[];
}