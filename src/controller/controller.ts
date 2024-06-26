import { Request, Response } from 'express';
import {
    getProductByID,
    getProductBySearchTerm,
    listProductsAll,
    addNewOrder,
} from '../../model/product';

import { createUser, getUserByEmail, getUserByID } from '../../model/user';
import { createSession, removeSession, getSession } from '../../model/session';
import validateInput from '../utils/validation';

const bcyrpt = require('bcrypt');

export function getAllProducts(req: Request, res: Response) {
    try {
        const searchQuery = req.query.search;
        if (searchQuery) {
            const stringQ = searchQuery.toString();
            const result = getProductBySearchTerm(stringQ);
            return res.status(200).json(result);
        }
        const result = listProductsAll();
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(500).json({ error: error.toString() });
    }
}

export function getProductID(req: Request, res: Response) {
    try {
        const product = req.params.id;
        const productId = parseInt(product);
        const result = getProductByID(productId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.toString() });
    }
}

export async function checkout(req: Request, res: Response) {
    try {
        const { userID, products } = req.body;
        const user_id = userID;
        const order = await addNewOrder({ user_id, products });
        res.status(200).json(order); // send a success response
    } catch (error) {
        console.error(error); // log the error
        res.status(500).send({
            response: 'An error occurred while processing your order',
        }); // send an error response
    }
}

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;
    const validInput = await validateInput('login', email, password);
    const user = getUserByEmail(email);
    if (!email || !password) {
        return res.status(400).json({ response: 'Login failed!' });
    }
    if (!validInput) {
        return res.status(400).json({
            response: 'Invalid input. Please try again',
        });
    }
    try {
        bcyrpt
            .compare(password, user.hashed_password)
            .then((match: boolean) => {
                if (!match) {
                    return res.status(400).json('Login failed!');
                } else {
                    const session_id = createSession(user.user_id);
                    res.cookie('sid', session_id, {
                        signed: true,
                        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
                        sameSite: 'lax',
                        httpOnly: true,
                    });
                }
                return res.status(200).json({ response: 'Logged in!' });
            });
    } catch (error) {
        res.status(400).json({ error: error });
    }
}

export async function signup(req: Request, res: Response) {
    const { email, password, username } = req.body;
    const validInput = await validateInput('signup', email, password, username);

    if (!email || !password || !username) {
        return res.status(400).json({ response: 'Bad input' });
    } else if (!validInput) {
        return res.status(400).json({
            response: 'Invalid input. Please try again',
        });
    } else {
        try {
            bcyrpt.hash(password, 12).then((hash: string) => {
                const user = createUser(username, email, hash);
                const sessionId = createSession(user.user_id);
                res.cookie('sid', sessionId, {
                    signed: true,
                    httpOnly: true,
                    maxAge: 5 * 60 * 1000,
                    sameSite: 'lax',
                });
                return res.status(200).json({ response: 'Cookie Created!' });
            });
        } catch (error) {
            res.status(400).send(error);
        }
    }
}

export function logout(req: Request, res: Response) {
    const sid = req.signedCookies.sid;
    if (!sid) {
        res.status(400).json({ response: 'No cookie!' });
    }
    try {
        removeSession(sid);
        res.clearCookie('sid');
        res.status(200).json({ response: 'Logged out successfully!' });
    } catch (error) {
        res.status(400).json({ error: error });
    }
}

export function user(req: Request, res: Response) {
    const userObj = req.params.id;
    const user_id = parseInt(userObj);
    if (!user_id) {
        res.status(400).json({ response: 'No session ID!' });
    }
    try {
        const data = getUserByID(user_id);
        res.status(200).json(data);
    } catch (error) {
        res.status(400).json({ error: error });
    }
}

export function session(req: Request, res: Response) {
    const sid = req.signedCookies.sid;
    if (!sid) {
        return res.status(400).json({ response: 'No cookie!' });
    }
    try {
        if (sid) {
            const data = getSession(sid);
            const userID = data['user_id'];
            return res.status(200).json({ user_id: userID });
        } else throw new Error('No cookie!');
    } catch (error) {
        res.status(400).json({ error: error });
    }
}
