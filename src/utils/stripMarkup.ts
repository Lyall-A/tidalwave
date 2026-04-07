export default function stripMarkup(str: string) {
    return str
        .replace(/\[wimpLink.*?\](.*?)\[\/wimpLink\]/g, (match, content) => content)
        .replace(/<br\/?>/g, '\n');
}