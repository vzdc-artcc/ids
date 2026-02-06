export const getColor = (facility: number) => {
    switch (facility) {
        case 6:
            return 'darkred';
        case 5:
            return 'cyan';
        case 4:
            return 'pink';
        case 3:
            return 'lightgreen';
        case 2:
            return 'brown';
        default:
            return 'gray';
    }
}