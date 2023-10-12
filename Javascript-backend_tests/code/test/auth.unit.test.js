import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import {login, logout, register, registerAdmin} from "../controllers/auth.js";
import {Query} from "mongoose";
const bcrypt = require("bcryptjs")
jest.mock("bcryptjs")
jest.mock('../models/User.js');
describe('register', () => {
    let req = {};
    let res;
    beforeEach(() => {
        jest.resetAllMocks();
        req = { }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
    })
    test('register value:200', async () => {
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "testemail@gmail.com",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail@gmail.com",
        })
        jest.spyOn(User, "findOne").mockResolvedValue(null);
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({data:{message:"User added successfully"}})
    })
    test('register value:400 invalid email', async () => {
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "testemail",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail",
        })
        jest.spyOn(User, "findOne").mockResolvedValue(null);
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Invalid email format"});
    })
    test('register value:400 user exists', async () => {
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "testemail@gmail.com",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail",
        })
        jest.spyOn(User, "findOne").mockResolvedValue({username: "testname"});
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "you are already registered"});
    })
    test('register value:400 missing params', async () => {
        req.body = {
            password: "testpassword",
            email: "testemail",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail",
        })
        jest.spyOn(User, "findOne").mockResolvedValue({username: "testname"});
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Missing required fields"});
    })
    test('register value:400 missing params', async () => {
        req.body = {
            username: " ",
            password: "testpassword",
            email: "testemail",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail",
        })
        jest.spyOn(User, "findOne").mockResolvedValue({username: "testname"});
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Missing required fields"});
    })
});

describe("registerAdmin", () => {
    let req = {};
    let res;
    beforeEach(() => {
        jest.resetAllMocks();
        req = { }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
    })
    test('register value:200', async () => {
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "testemail@gmail.com",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail@gmail.com",
        })
        jest.spyOn(User, "findOne").mockResolvedValue(null);
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({data:{message:"User added successfully"}})
    })
    test('register value:400 invalid email', async () => {
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "testemail",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail",
        })
        jest.spyOn(User, "findOne").mockResolvedValue({username: "testname"});
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Invalid email format"});
    })
    test('register value:400 user exists', async () => {
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "testemail@gmail.com",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail",
        })
        jest.spyOn(User, "findOne").mockResolvedValue({username: "testname"});
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "you are already registered"});
    })
    test('register value:400 missing params', async () => {
        req.body = {
            password: "testpassword",
            email: "testemail@gmail.com",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail",
        })
        jest.spyOn(User, "findOne").mockReturnThis().mockResolvedValue({username: "testname"});
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Missing required fields"});
    })
    test('register value:400 existing admin', async () => {
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "testemail@gmail.com",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail",
        })
        jest.spyOn(User, "findOne").mockReturnThis().mockResolvedValue({username: "testname"});
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "you are already registered"});
    })
    test('register value:400 missing params', async () => {
        req.body = {
            username: " ",
            password: "testpassword",
            email: "testemail",
        }
        jest.spyOn(User,"create").mockResolvedValue({
            username: "testname",
            password: "testpassword",
            email: "testemail",
        })
        jest.spyOn(User, "findOne").mockResolvedValue({username: "testname"});
        jest.spyOn(bcrypt, "hashSync").mockReturnValue("testpassword");
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Missing required fields"});
    })
})

describe('login', () => {
    let req = {};
    let res;
    beforeEach(() => {
        jest.resetAllMocks();
        req = { }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
    })
    test('login done', async () => {
        req.body = {
            password: "testpassword",
            email: "admin@gmail.com",
        }
        jest.spyOn(User, "findOne").mockImplementation( (query) => {
            return {
                exec: jest.fn().mockResolvedValue(
                    {
                        password: "testpassword",
                        email: "admin@gmail.com",
                        save: jest.fn().mockResolvedValue({username: "testname", password: "testpassword", email: "ciao@gmail.com"})
                    }
                )
            }
        })
        jest.spyOn(bcrypt, "compare").mockReturnValue(true);
        jest.spyOn(jwt,"sign").mockReturnValue("testtoken");
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({data: {accessToken: "testtoken",refreshToken: "testtoken"}})
    })
    test('login failed', async () => {
        req.body = {
            password: "testpassword",
            email: "admin@gmail.com",
        }
        jest.spyOn(User, "findOne").mockImplementation( (query) => {
            return {
                exec: jest.fn().mockResolvedValue(
                    undefined
                )
            }
        })
        jest.spyOn(bcrypt, "compare").mockReturnValue(true);
        jest.spyOn(jwt,"sign").mockReturnValue("testtoken");
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error:"please you need to register"})
    })
    test('login failed, password differs', async () => {
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "admin@gmail.com",
        }
        jest.spyOn(User, "findOne").mockImplementation( (query) => {
            return {
                exec: jest.fn().mockResolvedValue(
                    {
                        password: "testpassword",
                        email: "admin@gmail.com",
                        save: jest.fn().mockResolvedValue({username: "testname", password: "testpassword", email: "ciao@gmail.com"})
                    }
                )
            }
        })
        jest.spyOn(bcrypt, "compare").mockReturnValue(false);
        jest.spyOn(jwt,"sign").mockReturnValue("testtoken");
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error:"wrong credentials"})
    })
    test('login failed missing parameters', async () => {
        req.body = {
            password: "testpassword",
            email: " ",
        }
        jest.spyOn(User, "findOne").mockImplementation( (query) => {
            return {
                exec: jest.fn().mockResolvedValue(
                    {
                        password: "testpassword",
                        email: "admin@gmail.com",
                        save: jest.fn().mockResolvedValue({username: "testname", password: "testpassword", email: "ciao@gmail.com"})
                    }
                )
            }
        })
        jest.spyOn(bcrypt, "compare").mockReturnValue(true);
        jest.spyOn(jwt,"sign").mockReturnValue("testtoken");
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error:"Missing required fields"})
    })
});

describe('logout', () => {
    let req = {};
    let res;
    beforeEach(() => {
        jest.resetAllMocks();
        req = { }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
    })
    test('logout done', async () => {
        req.body = {
            password: "testpassword",
            email: "testemail@test.com"
        }
        req.cookies = {
            accessToken: "testtoken",
            refreshToken: "testtoken"
        }
        jest.spyOn(User, "findOne").mockResolvedValue({
            password: "testpassword",
            email: "testemail@test.com",
            save: jest.fn().mockResolvedValue(undefined)
        })
        await logout(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({data:{message:"User logged out"}})
    })
    test('logout failed', async () => {
        req.body = {
            password: "testpassword",
            email: ""
        }
        req.cookies = {
            accessToken: "",
            refreshToken: ""
        }
        jest.spyOn(User, "findOne").mockResolvedValue({
            password: "testpassword",
            email: "testemail@test.com",
            save: jest.fn().mockResolvedValue(undefined)
        })
        await logout(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "user not found"})
    })
    test('logout failed 2', async () => {
        req.body = {
            password: "testpassword",
            email: ""
        }
        req.cookies = {
            accessToken: "",
            refreshToken: "testtoken"
        }
        jest.spyOn(User, "findOne").mockResolvedValue(undefined)
        await logout(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "user not found"})
    })
});
