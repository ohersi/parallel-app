// Packages
import { NextFunction, Request, Response } from 'express';
import axios from "axios";
import FormData from "form-data";
// Imports
import '@/utils/env';

/*
    If response profanity matches array.length !== 0 then automatic flag
    If response link matches array has any category !== null then automatic flag
*/

export const moderate = async (req: Request, res: Response, next: NextFunction) => {

    const text = JSON.stringify(req.body).replace(/[{}"]+/g, '');

    let data = new FormData();
    data.append('text', `${text}`);
    data.append('lang', 'en');
    data.append('opt_countries', 'us,gb,fr');
    data.append('mode', 'standard');
    data.append('api_user', process.env.SITE_ENGINE_API_USER);
    data.append('api_secret', process.env.SITE_ENGINE_API_SECRET);

    const results = await axios({
        url: 'https://api.sightengine.com/1.0/text/check.json',
        method: 'post',
        data: data,
        headers: data.getHeaders()
    })
        .then(function (response) {
            // on success: handle response
            return response.data;
        })
        .catch(function (error) {
            // handle error
            if (error.response) {
                throw Error(error.response.data);
            }
            else {
                throw Error(error.message);
            }
        });

    if (results.profanity.matches.length) {
        return res.status(401).send(`Inappropriate text: ${JSON.stringify(results)}`);
    }
    for (const url of results.link.matches) {
        if (url.category) {
            return res.status(401).send(`Inappropriate url: ${JSON.stringify(results)}`);
        }
    }

    next();
}