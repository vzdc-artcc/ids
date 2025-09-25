export const formatZuluDate = (date: Date, noDate?: boolean) => {
    const d = new Date(date);
    let month = '' + (d.getUTCMonth() + 1);
    let day = '' + d.getUTCDate();
    const year = d.getUTCFullYear().toString().substring(2);
    let hour = '' + d.getUTCHours();
    let minute = '' + d.getUTCMinutes();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hour.length < 2) hour = '0' + hour;
    if (minute.length < 2) minute = '0' + minute;

    if (noDate) {
        return [hour, minute].join('') + 'z';
    }
    return [month, day, year].join('/') + ' ' + [hour, minute].join('') + 'z';
};