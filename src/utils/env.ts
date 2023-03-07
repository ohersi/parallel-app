import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
else {
    console.log('In production, set enviorment variables in app of choice.');
}
