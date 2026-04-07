export default function formatString(string: string, obj: { }) {
    return string
        .replace(/{{(.*?)}}/g, (match, group) => group.split('.').reduce((acc: any, key: string) => acc && acc[key], obj) || '');
}