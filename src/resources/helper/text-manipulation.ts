import { nanoid } from "nanoid";

export const convertToSlug = (text: any) => {
    const results = text.toString()                   // Cast to string (optional)
        .normalize('NFKD')           // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
        .toLowerCase()                // Convert the string to lowercase letters
        .trim()                       // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, '-')         // Replace spaces with -
        .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
        .replace(/\_/g, '-')           // Replace _ with -
        .replace(/\-\-+/g, '-')       // Replace multiple - with single -
        .replace(/\-$/g, '');         // Remove trailing -
    return results;
}

export const concatNames = (firstname: string | undefined, lastname: string | undefined, previousFirst: string, previousLast: string): string => {

    if (firstname && lastname) {
        const trimmedFirst = firstname.replace(/ /g, "");
        const trimmedLast = lastname.replace(/ /g, "");

        if (!trimmedFirst) {
            return previousFirst.concat(' ', trimmedLast);
        }
        if (!trimmedLast) {
            return trimmedFirst.concat(' ', previousLast);
        }

        return trimmedFirst.concat(' ', trimmedLast);
    }

    if (firstname && !lastname) {
        const trimmed = firstname.replace(/ /g, "");
        return trimmed.concat(' ', previousLast);
    }
    if (!firstname && lastname) {
        const trimmed = lastname.replace(/ /g, "");
        return trimmed.concat(' ', lastname);
    }
    return previousFirst.concat(' ', previousLast);
}

export const checkSlug = async (newSlug: string, previousSlug: string, repo: any): Promise<string> => {

    let trimmed = newSlug.replace(/ /g, '');

    if (trimmed == previousSlug || !trimmed) {
        return previousSlug;
    }

    // Check if new slug exists
    const slugExists = repo.findOne({ slug: trimmed });
    if (slugExists) {
        trimmed = trimmed.concat('-', nanoid(12)); // Create new slug w/ unique id
    }
    return trimmed;
}

export const decodeLastID = (last_id: string) => {

    let convertedID: string;

    if (!last_id) {
        convertedID = new Date().toISOString();
    }
    else {
        const decoded: string = Buffer.from(last_id, 'base64').toString('utf8');
        convertedID = decoded;
    }
    
    return convertedID;
}