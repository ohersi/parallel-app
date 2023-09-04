import jwt from "jsonwebtoken";

export const createToken = (email: string) => {

    if (!process.env.ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET env variable is missing");

    const accessToken = jwt.sign(
        { "email": email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1hr' }
    )
    return accessToken;
};

export const verifyToken = async (token: string) => {

    if (!process.env.ACCESS_TOKEN_SECRET)
        throw new Error("ACCESS_TOKEN_SECRET env variable is missing");

    try {
        const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return verify;
    }
    catch (error: any) {
        if (error.name === 'TokenExpiredError') return false;
        else throw new Error(error);
    }
}