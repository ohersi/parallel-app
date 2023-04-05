import bcrypt from 'bcrypt';

export const hash = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
};

export const decrypt = async (givenPassword: string, storedPassword: string): Promise<boolean> => {
    // compare password, if match return true else return false
    const matched = await bcrypt.compare(givenPassword, storedPassword);
    if (matched) {
        return true;
    }
    return false;
}