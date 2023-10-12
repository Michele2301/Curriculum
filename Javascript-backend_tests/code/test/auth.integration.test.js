import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
const bcrypt = require("bcryptjs")
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import {login, logout, register, registerAdmin} from "../controllers/auth.js";

dotenv.config();

beforeAll(async () => {
  const dbName = "testingDatabaseAuth";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe('register', () => {
    let req = {};
    let res;
    beforeEach(async () => {
        await User.deleteMany({});
        jest.resetAllMocks();
        req = {}
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
        await register(req,res);
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "testemail@gmail.com",
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "you are already registered"});
    })
    test('register value:400 missing params', async () => {
        req.body = {
            password: "testpassword",
            email: "testemail",
        }
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
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Missing required fields"});
    })
});

describe("registerAdmin", () => {
    beforeEach(async () => {
        await User.deleteMany({});
    })
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
        await register(req,res);
        req.body = {
            username: "testname",
            password: "testpassword",
            email: "testemail@gmail.com",
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
        await register(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "you are already registered"});
    })
    test('register value:400 missing params', async () => {
        req.body = {
            password: "testpassword",
            email: "testemail",
        }
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Missing required fields"});
    })
    test('register value:400 missing params', async () => {
        req.body = {
            username: " ",
            password: "testpassword",
            email: "testemail",
        }
        await registerAdmin(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Missing required fields"});
    })
})

describe('login', () => {
    beforeAll(async () => {
        req = {body: {
                username: "admin",
                password: "testpassword",
                email: "admin@gmail.com",
            }}
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
        await registerAdmin(
            req,res
        )
    })
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
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.cookie).toBeCalled();
    })
    test('login failed', async () => {
        req.body = {
            password: "testpassword",
            email: "admin1@gmail.com",
        }
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error:"please you need to register"})
    })
    test('login failed, password differs', async () => {
        req.body = {
            password: "testpassword1",
            email: "admin@gmail.com",
        }

        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error:"wrong credentials"})
    })
    test('login failed missing parameters', async () => {
        req.body = {
            password: "testpassword",
            email: " ",
        }
        await login(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error:"Missing required fields"})
    })
});

describe('logout', () => {
    beforeAll(async () => {
        req = {body: {
                username: "admin",
                password: "testpassword",
                email: "admin@gmail.com",
            }}
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
        await registerAdmin(
            req,res
        )
    })
    let req = {};
    let res;
    beforeEach(async () => {
        jest.resetAllMocks();
        req = {}
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
        req = {
            body: {
                username: "admin",
                password: "testpassword",
                email: "admin@gmail.com",
            }
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
        await login(req, res);
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
        await User.create({
            username: "testname",
            password: "testpassword",
            email: "testemail@test.com",
            refreshToken: "testtoken",
        })
        await logout(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenNthCalledWith(2,{data:{message: "User logged out"}})
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
        await logout(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "user not found"})
    })
    test('logout failed', async () => {
        req.body = {
            password: "testpassword",
            email: ""
        }
        req.cookies = {
            accessToken: "",
            refreshToken: "testtoken"
        }
        await logout(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "user not found"})
    })
})
