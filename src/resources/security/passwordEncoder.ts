import bcrypt from 'bcrypt';

export const passwordEncoder = async (password: string): Promise<string> => {
    const hashedPassword = await bcrypt.hash(password, 12);
    return hashedPassword;
};