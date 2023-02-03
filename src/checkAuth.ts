import {verify} from 'jsonwebtoken';
import { Request, Response } from 'express';

let jwtSecret = process.env.JWT_SECRET

export const checkJWT = function(req: Request, res: Response, next: Function){
    let { authorization } = req.headers

    if(!authorization){
        res.status(401).send("You are not authorized. Please provide an auth Bearer token. Make a request to /auth endpoint.")
        return;
    }
        

    console.log('Auth headers: ' + authorization)

    if (authorization.split(' ').length != 2){
        res.status(401).send("Please provide a correct JWT token")
        return;
    }
        
    
    try{
        // if verified success then call next() if error occured
        // send error status.
        verify(authorization.split(' ')[1], jwtSecret)
        next()
    }catch(err){
        res.status(401).send('Invalid JWT')
    }
}