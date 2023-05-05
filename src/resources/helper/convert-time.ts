export const convertTime = (time: string) => {

    let results: number;

    if (time.toLowerCase().includes('hr')) {
        const hours = time.replace(/hr/gi, "");
        results = parseInt(hours) * 3600;
    }
    else if (time.toLowerCase().includes('min')) {
        const minutes = time.replace(/min/gi, "");
        results = parseInt(minutes) * 60;
    }
    else if (time.toLowerCase().includes('s')) {
        const seconds = time.replace(/s/gi, "");
        results = parseInt(seconds);
    }
    else {
        results = 9000;
    }

    return results;
}