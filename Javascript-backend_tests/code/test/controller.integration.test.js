import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import { User, Group } from '../models/User.js';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import {createCategory, createTransaction, getCategories, getAllTransactions, deleteTransactions, deleteTransaction,
    getTransactionsByUser, getTransactionsByGroup, getTransactionsByUserByCategory, getTransactionsByGroupByCategory} from "../controllers/controller.js";
import jwt from "jsonwebtoken";
import e, {raw, response} from 'express';
import bcrypt from 'bcryptjs';

dotenv.config();
beforeAll(async () => {
  const dbName = "testingDatabaseController";
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

describe("createCategory", () => {
    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""

    beforeEach(async () => {
        await User.deleteMany({})
        await categories.deleteMany({})
        await request(app).post("/api/register").send({
            username: "user1",
            password: "userPass1",
            email: "user1@example.com"
        })
        let responseUser = await request(app).post("/api/login").send({
            username: "user1",
            password: "userPass1",
            email: "user1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminPass1",
            email: "admin1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminPass1",
            email: "admin1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

    })

    test("should create create new category: 200", async () => {
        const response = await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "food", color: "red" })

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({type: "food", color: "red"});
    });

    test("should not create create new category(noAdmin): 401", async () => {
        const response = await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ type: "food", color: "red" })

        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: "User is not an admin"});
    });
})

describe("updateCategory", () => {

    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""

    beforeEach(async () => {
        await User.deleteMany({})
        await categories.deleteMany({})
        await request(app).post("/api/register").send({
            username: "user1",
            password: "userPass1",
            email: "user1@example.com"
        })
        let responseUser = await request(app).post("/api/login").send({
            username: "user1",
            password: "userPass1",
            email: "user1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminPass1",
            email: "admin1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminPass1",
            email: "admin1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "food", color: "blue" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "rent", color: "black" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "health", color: "red" })

    })

    test("should update category with new one: 200", async () => {

        let response = await request(app).patch("/api/categories/rent")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({type: "tax", color: "yellow"})

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({message: "Category edited successfully",count:0})
    });
    test("should not update category with new one(noAdmin): 401", async () => {

        let response = await request(app).patch("/api/categories/rent")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({type: "tax", color: "yellow"})

        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: "User is not an admin"});
    });
    test("should not update category with new one: 400(catNotFound)", async () => {

        let response = await request(app).patch("/api/categories/fuel")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({type: "tax", color: "yellow"})

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Category not found"})
    });
    test("should not update category with new one: 400(newCatExist)", async () => {

        let response = await request(app).patch("/api/categories/rent")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({type: "rent", color: "yellow"})

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "New category already exists"})
    });
})

describe("deleteCategory", () => {

    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""

    beforeEach(async () => {
        await User.deleteMany({})
        await categories.deleteMany({})
        await request(app).post("/api/register").send({
            username: "user1",
            password: "userPass1",
            email: "user1@example.com"
        })
        let responseUser = await request(app).post("/api/login").send({
            username: "user1",
            password: "userPass1",
            email: "user1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminPass1",
            email: "admin1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminPass1",
            email: "admin1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

    })

    test("should delete given categories: 200", async () => {

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "food", color: "blue" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "rent", color: "black" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "health", color: "red" })

        let response = await request(app).delete("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({types: ["rent", "health"]})

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({message: "Categories deleted", count: 0});
    });
    test("should not delete given categories(noAuth): 401", async () => {

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "food", color: "blue" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "rent", color: "black" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "health", color: "red" })

        let response = await request(app).delete("/api/categories")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({types: ["rent", "health"]})

        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: "User is not an admin"});
    });
    test("should not delete given categories(delAllCat): 400", async () => {

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "rent", color: "black" })

        let response = await request(app).delete("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({types: ["rent", "health"]})

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error:"Cannot delete all categories"});
    });
    test("should not delete given categories(catNotFound): 400", async () => {

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "food", color: "blue" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "rent", color: "black" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "health", color: "red" })

        let response = await request(app).delete("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({types: ["tax"]})

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Category not found"});
    });
})

describe("getCategories", () => {

    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""

    beforeEach(async () => {
        await User.deleteMany({})
        await categories.deleteMany({})
        await request(app).post("/api/register").send({
            username: "user1",
            password: "userPass1",
            email: "user1@example.com"
        })
        let responseUser = await request(app).post("/api/login").send({
            username: "user1",
            password: "userPass1",
            email: "user1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminPass1",
            email: "admin1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminPass1",
            email: "admin1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

    })

    test("should return empty list: 200", async () => {
        let response = await request(app).get("/api/categories")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
    });
    test("should return all category list: 200", async () => {

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "food", color: "blue" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "rent", color: "black" })

        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "health", color: "red" })

        let response = await request(app).get("/api/categories")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([{ type: "food", color: "blue" }, { type: "rent", color: "black" }, { type: "health", color: "red" }]);
    });
})

//OK only user
describe("createTransaction", () => {
    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""

    beforeEach(async () => {
        await transactions.deleteMany({})
        await User.deleteMany({})
        await categories.deleteMany({})

        //create user 1
        await request(app).post("/api/register").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        //create user 2
        await request(app).post("/api/register").send({
            username: "test2",
            password: "test2password",
            email: "t2@example.com"
        })
        
        //login user
        let responseUser = await request(app).post("/api/login").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        //create admin
        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })
        
        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

        //create category
        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "Type1", color: "red" })

    })

    test("should create a new transaction:200", async () => {

        let transaction = { username: "test1", type: "Type1", amount: 100 }

        const response = await request(app)
            .post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)
            
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data).toBeDefined()
        expect(response.body.data.type).toEqual(transaction.type)
        expect(response.body.data.amount).toEqual(transaction.amount)
        

    })

    test("should return error for missing username:400", async () => {

        let transaction = { type: "Type1", amount: 100 }

        const response = await request(app)
            .post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Missing parameters")
    })

    test("should return error for missing type:400", async () => {

        let transaction = { username: "test1", amount: 100 }

        const response = await request(app)
            .post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Missing parameters")
    })

    test("should return error for missing amount:400", async () => {

        let transaction = { username: "test1", type: "Type1" }

        const response = await request(app)
            .post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Missing parameters")
    })

    test("should return error for empty username:400", async () => {

        let transaction = { username: "", type: "Type1", amount: 100 }

        const response = await request(app)
            .post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Empty parameters")
    })

    test("should return error for empty type:400", async () => {

        let transaction = { username: "test1", type: "", amount: 100 }

        const response = await request(app)
            .post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Empty parameters")
    })

    test("should return error for invalid amount:400", async () => {

        let transaction = { username: "test1", type: "Type1", amount: "invalid" }

        const response = await request(app)
            .post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Amount must be a number")
    })

    test("should return error if username parameter is different than the username in the request:401", async () => {

        let transaction = { username: "test1", type: "Type1", amount: 100 }

        const response = await request(app)
            .post("/api/users/test2/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Mismatched users")
    })

    test("should return error if username parameter is not found in database:400", async () => {

        let transaction = { username: "test1", type: "Type1", amount: 100 }
        await User.deleteMany({ username: "test1" })
        const response = await request(app)
            .post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)

        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Username parameter not found")
    })

    test("should return error if the category is not found in database:400", async () => {

        let transaction = { username: "test1", type: "Type2", amount: 100 }

        const response = await request(app)
            .post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send(transaction)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Username or category not found")
    })

    test("should return error if not authorized:401", async () => {
            
            let transaction = { username: "test1", type: "Type1", amount: 100 }
    
            const response = await request(app)
                .post("/api/users/test1/transactions")
                .send(transaction)
                
            expect(response.status).toBe(401)
            expect(response.body).toBeDefined()
            expect(response.body.error).toEqual("Unauthorized")
    })

})

//OK only admin
describe("getAllTransactions", () => { 
    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""

    beforeEach(async () => {
        await transactions.deleteMany({})
        await User.deleteMany({})
        await categories.deleteMany({})

        //create user 1
        await request(app).post("/api/register").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        //create user 2
        await request(app).post("/api/register").send({
            username: "test2",
            password: "test2password",
            email: "t2@example.com"
        })
        
        //login user 1
        const responseUser = await request(app).post("/api/login").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        //create admin
        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

        //create category
        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "Type1", color: "red" })

        //create transaction 1
        let response = await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test1", type: "Type1", amount: 100 })

        //create transaction 2
        await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test1", type: "Type1", amount: 200 })


    })

    test("should return all transactions:200", async () => {
            
        const response = await request(app).get("/api/transactions")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data.length).toEqual(2)
    
    })

    test("should return error if not authorized:401", async () => {
                
        const response = await request(app).get("/api/transactions")
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Unauthorized")
    })
})

//OK admin - user
describe("getTransactionsByUser", () => { 
    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""
    let tr1 = {}
    let tr2 = {}
    let tr3 = {}
    let tr4 = {}
    let tr5 = {}

    beforeEach(async () => {
        await transactions.deleteMany({})
        await User.deleteMany({})
        await categories.deleteMany({})

        //create user 1
        await request(app).post("/api/register").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        //create user 2
        await request(app).post("/api/register").send({
            username: "test2",
            password: "test2password",
            email: "t2@example.com"
        })
        
        //login user 1
        const responseUser = await request(app).post("/api/login").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        //create admin
        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

        //create category
        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "Type1", color: "red" })

        //create transaction 1
        tr1 = await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test1", type: "Type1", amount: 100 })

        //create transaction 2
        tr2 = await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test1", type: "Type1", amount: 300 })
        
        //create transaction 3 by user 2
        tr3 = await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test2", type: "Type1", amount: 300 })

        tr4 = transactions.create({ username: "test1", type: "Type1", amount: 300, date: new Date("2021-01-01") })

        tr5 = transactions.create({ username: "test1", type: "Type1", amount: 600, date: new Date("2021-01-01") })
    })

    test("(admin) should return all transactions made by user:200", async () => {
                
        const response = await request(app).get("/api/transactions/users/test1")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data.length).toEqual(4)
        
    })

    test("(admin) should return error if username parameter does not exist:400", async () => {
                    
        const response = await request(app).get("/api/transactions/users/test3")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Username parameter not found")
        
    });

    test("(admin) should return error if not authorized:401", async () => {
                        
        const response = await request(app).get("/api/transactions/users/test1")
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Unauthorized")
    });

    test("(user) should return all transactions made by user with query parameters (min max):200", async () => {
        const response = await request(app).get("/api/users/test1/transactions")
            .query({min:99, max:199})
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data.length).toEqual(1)
        expect(response.body.data[0]._id).toEqual(tr1._id)
        
    });

    test("(user) should return all transactions made by user with query parameters (min):200", async () => {
        const response = await request(app).get("/api/users/test1/transactions")
            .query({min:99})
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data[0]._id).toEqual(tr2._id)
        
    });

    test("(user) should return all transactions made by user with query parameters (max):200", async () => {
        const response = await request(app).get("/api/users/test1/transactions")
            .query({max:100})
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data[0]._id).toEqual(tr1._id)
        
    });

    test("(user) should return all transactions made by user with query parameters (date):200", async () => {
        const response = await request(app).get("/api/users/test1/transactions")
            .query({date:'2021-01-01'})
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data[0]._id).toEqual(tr4._id)
        
    });
    
    test("(user) should return all transactions made by user with query parameters (upTo):200", async () => {
        const response = await request(app).get("/api/users/test1/transactions")
            .query({upTo:'2021-02-01'})
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data[0]._id).toEqual(tr4._id)
        
    });

    test("(user) should return all transactions made by user with query parameters (from upTo):200", async () => {
        const response = await request(app).get("/api/users/test1/transactions")
            .query({from:'2020-01-01', upTo:'2021-01-01'})
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data[0]._id).toEqual(tr4._id)
        
    });

    test("(user) should return all transactions made by user with query parameters (from upTo min max):200", async () => {
        const response = await request(app).get("/api/users/test1/transactions")
            .query({from:'2020-01-01', upTo:'2021-01-01', min:600, max:999})
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data[0]._id).toEqual(tr5._id)
        
    });

    test("(user) should return error if not authorized:401", async () => {
                                    
        const response = await request(app).get("/api/users/test1/transactions")
            .query({min: 100, max:199})
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Unauthorized")
    });

    test("(user) should return error if username parameter does not exist:400", async () => {
                                            
        const response = await request(app).get("/api/users/test3/transactions")
            .query({min: 100, max:199})
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Username parameter not found")
        
    })

})

//OK admin - user, admin problem in authorization (401)
describe("getTransactionsByUserByCategory", () => { 
    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenUser3 = ""
    let refreshTokenUser3 =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""
    beforeEach(async () => {
        await transactions.deleteMany({})
        await User.deleteMany({})
        await categories.deleteMany({})

        //create user 1
        await request(app).post("/api/register").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        //create user 2
        await request(app).post("/api/register").send({
            username: "test2",
            password: "test2password",
            email: "t2@example.com"
        })
        
        //login user 1
        const responseUser = await request(app).post("/api/login").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        //create admin
        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

        //create category
        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "Type1", color: "red" })

        //create transaction 1
        await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test1", type: "Type1", amount: 100 })

        //create transaction 2
        await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test1", type: "Type2", amount: 101 })

        //create transaction 3
        await request(app).post("/api/users/test2/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test2", type: "Type1", amount: 200 })

        //create user 3
        await request(app).post("/api/register").send({
            username: "test3",
            password: "test3password",
            email: "t3@example.com"
        })

        //login user 3
        const responseUser3 = await request(app).post("/api/login").send({
            username: "test3",
            password: "test3password",
            email: "t3@example.com"
        })

        accessTokenUser3 = responseUser3.body.data.accessToken
        refreshTokenUser3 =  responseUser3.body.data.refreshToken

        //delete user 3
        const test = await request(app).delete("/api/users").set("Cookie", [`accessToken=${accessTokenAdmin}`, `refreshToken=${refreshTokenAdmin}`])
        .send({email: ["t3@example.com"]})

        console.log(test.body)

    })
   
    test("(user) should return all transactions made by user by category:200", async () => {
                    
        const response = await request(app).get("/api/users/test1/transactions/category/Type1")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data.length).toEqual(1)
        
    });

    test("(user) should return error if not authorized:401", async () => {
                        
        const response = await request(app).get("/api/users/test1/transactions/category/Type1")
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Unauthorized")
    });

    test("(user) should return error if username parameter does not exist:400", async () => {
                            
        const response = await request(app).get("/api/users/test3/transactions/category/Type1")
            .set('Cookie', `accessToken=${accessTokenUser3};refreshToken=${refreshTokenUser3}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Username parameter not found")
        
    });

    test("(user) should return error if category parameter does not exist:400", async () => {
                                
        const response = await request(app).get("/api/users/test1/transactions/category/Type3")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Category not found")
        
    });

    test("(admin) should return error if not authorized:401", async () => {
                                    
        const response = await request(app).get("/api/transactions/users/test1/category/Type1")
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Unauthorized")
    });


})

//OK admin - user 
describe("getTransactionsByGroup", () => { 
    let accessTokenUser1 = ""
    let refreshTokenUser1 =  ""
    let accessTokenUser2 = ""
    let refreshTokenUser2 =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""

    beforeEach(async () => {
        await transactions.deleteMany({})
        await User.deleteMany({})
        await categories.deleteMany({})
        await Group.deleteMany({})

        //create admin
        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })
                
        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

        //create category
        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "Type1", color: "red" })
        
        //create user 1
        await request(app).post("/api/register").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        //create user 2
        await request(app).post("/api/register").send({
            username: "test2",
            password: "test2password",
            email: "t2@example.com"
        })
        
        //login user 1
        const responseUser = await request(app).post("/api/login").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        accessTokenUser1 = responseUser.body.data.accessToken
        refreshTokenUser1 =  responseUser.body.data.refreshToken

        //create group 1
        let response = await request(app).post("/api/groups")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
            .send({ name: "Group1", memberEmails: ["t1@example.com", "t2@example.com"] })


        //create transaction 1
        await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
            .send({ username: "test1", type: "Type1", amount: 100 })

        //create transaction 2
        await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
            .send({ username: "test1", type: "Type2", amount: 101 })

        //login user 2
        const responseUser2 = await request(app).post("/api/login").send({
            username: "test2",
            password: "test2password",
            email: "t2@example.com"
        })

        accessTokenUser2 = responseUser2.body.data.accessToken
        refreshTokenUser2 =  responseUser2.body.data.refreshToken

        //create transaction 3
        await request(app).post("/api/users/test2/transactions")
            .set('Cookie', `accessToken=${accessTokenUser2};refreshToken=${refreshTokenUser2}`)
            .send({ username: "test2", type: "Type1", amount: 200 })

    })


    test("(user) should return all transactions made by user by group:200", async () => {
                    
        const response = await request(app).get("/api/groups/Group1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)

        console.log(response.body.data)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data.length).toEqual(2)
        
    });

    test("(user) should return error if not authorized:401", async () => {
                            
        const response = await request(app).get("/api/groups/Group1/transactions")
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Unauthorized")
    });


    test("(user) should return error if group parameter does not exist:400", async () => {
                                
        const response = await request(app).get("/api/groups/Group2/transactions")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Group not found")
        
    });

    test("(admin) should return all transactions made by user by group:200", async () => {
                        
        const response = await request(app).get("/api/transactions/groups/Group1")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data.length).toEqual(2)
        
    });

    test("(admin) should return error if group parameter does not exist:400", async () => {
                                
        const response = await request(app).get("/api/transactions/groups/Group2")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Group not found")
        
    });

    test("(admin) should return error if not authorized:401", async () => {
                                        
        const response = await request(app).get("/api/transactions/groups/Group1")
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Unauthorized")
    });
})

//OK admin - user
describe("getTransactionsByGroupByCategory", () => { 
    let accessTokenUser1 = ""
    let refreshTokenUser1 =  ""
    let accessTokenUser2 = ""
    let refreshTokenUser2 =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""

    beforeEach(async () => {
        await transactions.deleteMany({})
        await User.deleteMany({})
        await categories.deleteMany({})
        await Group.deleteMany({})

        //create admin
        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })
                
        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

        //create category
        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "Type1", color: "red" })
        
        //create user 1
        await request(app).post("/api/register").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        //create user 2
        await request(app).post("/api/register").send({
            username: "test2",
            password: "test2password",
            email: "t2@example.com"
        })
        
        //login user 1
        const responseUser = await request(app).post("/api/login").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        accessTokenUser1 = responseUser.body.data.accessToken
        refreshTokenUser1 =  responseUser.body.data.refreshToken

        //create group 1
        let response = await request(app).post("/api/groups")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
            .send({ name: "Group1", memberEmails: ["t1@example.com", "t2@example.com"] })


        //create transaction 1
        await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
            .send({ username: "test1", type: "Type1", amount: 100 })

        //create transaction 2
        await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
            .send({ username: "test1", type: "Type2", amount: 101 })

        //login user 2
        const responseUser2 = await request(app).post("/api/login").send({
            username: "test2",
            password: "test2password",
            email: "t2@example.com"
        })

        accessTokenUser2 = responseUser2.body.data.accessToken
        refreshTokenUser2 =  responseUser2.body.data.refreshToken

        //create transaction 3
        await request(app).post("/api/users/test2/transactions")
            .set('Cookie', `accessToken=${accessTokenUser2};refreshToken=${refreshTokenUser2}`)
            .send({ username: "test2", type: "Type1", amount: 200 })

    })

    test("(user) should return all transactions made by user by group by category:200", async () => {
                        
        const response = await request(app).get("/api/groups/Group1/transactions/category/Type1")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data.length).toEqual(2)

    });

    test("(user) should return error if group parameter does not exist:400", async () => {
                                
        const response = await request(app).get("/api/groups/Group2/transactions/category/Type1")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Group not found")
        
    });

    test("(user) should return error if category parameter does not exist:400", async () => {
                                
        const response = await request(app).get("/api/groups/Group1/transactions/category/Type3")
            .set('Cookie', `accessToken=${accessTokenUser1};refreshToken=${refreshTokenUser1}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Category not found")
        
    });

    test("(user) should return error if not authorized:401", async () => {
                                            
        const response = await request(app).get("/api/groups/Group1/transactions/category/Type1")
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Unauthorized")
    });

    //admin
    test("(admin) should return all transactions made by user by group by category:200", async () => {
                        
        const response = await request(app).get("/api/transactions/groups/Group1/category/Type1")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
        
        expect(response.status).toBe(200)
        expect(response.body).toBeDefined()
        expect(response.body.data.length).toEqual(2)
        
    });

    test("(admin) should return error if group parameter does not exist:400", async () => {
                                
        const response = await request(app).get("/api/transactions/groups/Group2/category/Type1")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Group not found")
        
    })

    test("(admin) should return error if category parameter does not exist:400", async () => {
                                
        const response = await request(app).get("/api/transactions/groups/Group1/category/Type2")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            
        expect(response.status).toBe(400)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Category not found")
        
    })

    test("(admin) should return error if not authorized:401", async () => {
                                            
        const response = await request(app).get("/api/transactions/groups/Group1/category/Type1")
            
        expect(response.status).toBe(401)
        expect(response.body).toBeDefined()
        expect(response.body.error).toEqual("Unauthorized")
    });
})

//OK only user
describe("deleteTransaction", () => {
    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""
    let transactionId = ""
    beforeEach(async () => {
        await transactions.deleteMany({})
        await User.deleteMany({})
        await categories.deleteMany({})

        //create user 1
        await request(app).post("/api/register").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        //login user 1
        const responseUser = await request(app).post("/api/login").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        //create admin
        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

        //create category
        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "Type1", color: "red" })

        //create transaction 1
        let response = await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test1", type: "Type1", amount: 100 })

        transactionId = response.body.data._id

    })

    test("should return 401 if not logged in", async () => {
        const response = await request(app).delete("/api/users/test1/transactions")
            .send({_id: transactionId})
        expect(response.status).toBe(401)
    });

    test("should return 400 if no transaction id", async () => {
        const response = await request(app).delete("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({})
        expect(response.status).toBe(400)
        expect(response.body.error).toEqual("Missing _id in request body")
    });

    test("should return 400 if transaction not found", async () => {
        const response = await request(app).delete("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({_id: "123456789012"})
        expect(response.status).toBe(400)
        expect(response.body.error).toEqual("Transaction not found")
    });

    test("should delete transaction:200", async () => {
        const response = await request(app).delete("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({_id: transactionId})
        expect(response.status).toBe(200)

        expect(response.body).toBeDefined()
        expect(response.body.data.message).toEqual("Transaction deleted")

    });
})

//OK only admin
describe("deleteTransactions",  () => {
    let accessTokenUser = ""
    let refreshTokenUser =  ""
    let accessTokenAdmin = ""
    let refreshTokenAdmin =  ""
    let transactionId1 = ""
    let transactionId2 = ""

    beforeEach(async () => {
        await transactions.deleteMany({})
        await User.deleteMany({})
        await categories.deleteMany({})

        //create user 1
        await request(app).post("/api/register").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        //login user 1
        const responseUser = await request(app).post("/api/login").send({
            username: "test1",
            password: "test1password",
            email: "t1@example.com"
        })

        accessTokenUser = responseUser.body.data.accessToken
        refreshTokenUser =  responseUser.body.data.refreshToken

        //create admin
        await request(app).post("/api/admin").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        //login admin
        let responseAdmin = await request(app).post("/api/login").send({
            username: "admin1",
            password: "adminpassword",
            email: "a1@example.com"
        })

        accessTokenAdmin = responseAdmin.body.data.accessToken
        refreshTokenAdmin =  responseAdmin.body.data.refreshToken

        //create category
        await request(app).post("/api/categories")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({ type: "Type1", color: "red" })

        //create transaction 1
        let response1 = await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test1", type: "Type1", amount: 100 })

        //create transaction 1
        let response2 = await request(app).post("/api/users/test1/transactions")
            .set('Cookie', `accessToken=${accessTokenUser};refreshToken=${refreshTokenUser}`)
            .send({ username: "test1", type: "Type1", amount: 100 })

        transactionId1 = response1.body.data._id
        transactionId2 = response2.body.data._id

    })

    test("should return 401 if not logged in", async () => {
        const response = await request(app).delete("/api/transactions")
            .send({_id: transactionId1})
        expect(response.status).toBe(401)
    });

    test("should return 400 if no transaction ids", async () => {
        const response = await request(app).delete("/api/transactions")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({})
        expect(response.status).toBe(400)
        expect(response.body.error).toEqual("Missing transactions in request body")
    });

    test("should return 400 if One or more transactions not found not found", async () => {
        const response = await request(app).delete("/api/transactions")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({_ids: ["123456789012", transactionId1, transactionId2]})
        expect(response.status).toBe(400)
        expect(response.body.error).toEqual("One or more transactions not found")
    });

    test("should delete transactions:200", async () => {
        const response = await request(app).delete("/api/transactions")
            .set('Cookie', `accessToken=${accessTokenAdmin};refreshToken=${refreshTokenAdmin}`)
            .send({_ids: [transactionId1, transactionId2]})
        expect(response.status).toBe(200)

        expect(response.body).toBeDefined()
        expect(response.body.data.message).toEqual("Transactions deleted")
    })

})