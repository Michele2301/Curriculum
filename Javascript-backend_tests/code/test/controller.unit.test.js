import request from 'supertest';
import { app } from '../app';
import { categories, transactions } from '../models/model';
import {verifyAuth} from "../controllers/utils.js";
import * as utils from "../controllers/utils.js";
import {
    createCategory,
    createTransaction,
    getCategories,
    updateCategory,
    getAllTransactions,
    deleteTransactions,
    deleteTransaction,
    getTransactionsByUser,
    getTransactionsByGroup,
    getTransactionsByUserByCategory,
    getTransactionsByGroupByCategory,
    deleteCategory
} from "../controllers/controller.js";
import { User, Group } from '../models/User.js';
import {expectedError} from "@babel/core/lib/errors/rewrite-stack-trace.js";

jest.mock('../controllers/utils.js');
jest.mock('../models/model');
jest.mock('../models/User.js');

beforeEach(() => {
  jest.resetAllMocks();
  categories.find.mockClear();
  categories.prototype.save.mockClear();
  transactions.find.mockClear();
  transactions.deleteOne.mockClear();
  transactions.aggregate.mockClear();
  transactions.prototype.save.mockClear();
  User.findOne.mockClear();
});

describe("createCategory", () => {
    let req = {};
    let res;
    beforeEach(() => {
        jest.resetAllMocks();
        req = { cookies: { accessToken: "accessToken", refreshToken: "refreshToken" } }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
    })
    test('createCategory value:200', async () => {
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true});
        jest.spyOn(categories,"findOne").mockResolvedValue(null);
        jest.spyOn(categories.prototype, "save").mockResolvedValue({
            type: "testname",
            color: "black",
        });
        req.body = {
            type: "testname",
            color: "black",
        }
        await createCategory(req, res);

        //Check if the appropriate results are returned
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({data: {type: "testname", color: "black"}});
    });
    test('createCategory value:401', async () => {
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: false, cause: "User is not an admin"});
        jest.spyOn(categories.prototype, "save").mockResolvedValue({
            type: "testname",
            color: "black",
        });
        req.body = {
            type: "testname",
            color: "black",
        }
        await createCategory(req, res);

        //Check if the appropriate results are returned
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({error: "User is not an admin"});
    });
})

describe("updateCategory", () => {
    let req = {};
    let res;
    beforeEach(() => {
        jest.resetAllMocks();
        req = {
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            params: {type: "old_type"},
            body: {type: "new_type", color: "new_color"}
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
    })
    test('updateCategory case: 200(Success)', async () => {

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true});
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(req.params);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(null);
        jest.spyOn(transactions, "updateMany").mockResolvedValue({modifiedCount: 1});
        jest.spyOn(categories, "findOneAndUpdate").mockResolvedValue("Category edited successfully");

        await updateCategory(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({data: {message: "Category edited successfully", count: 1}});

    });
    test('updateCategory case: 401 (unAuth)', async () => {

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: false, cause: "User is not an admin"});
        await updateCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({error: "User is not an admin"});

    });
    test('updateCategory case: 400(catNotFound)', async () => {

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true});
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(null);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(null);
        jest.spyOn(transactions, "updateMany").mockResolvedValue({count: 1});
        jest.spyOn(categories, "findOneAndUpdate").mockResolvedValue("Category edited successfully");

        await updateCategory(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Category not found"});

    });
    test('updateCategory case: 400(newCatExists)', async () => {

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true});
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(req.params);
        jest.spyOn(categories, "findOne").mockResolvedValueOnce(req.params);
        jest.spyOn(transactions, "updateMany").mockResolvedValue({count: 1});
        jest.spyOn(categories, "findOneAndUpdate").mockResolvedValue("Category edited successfully");

        await updateCategory(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "New category already exists"});

    });
})

describe("deleteCategory", () => {
    let req = {};
    let res;
    beforeEach(() => {
        jest.resetAllMocks();
        req = {
            cookies: {accessToken: "accessToken", refreshToken: "refreshToken"},
            body: {types: ["health", "rent", "food"]}
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
    })
    test('deleteCategory case: 200 (success)', async () => {
        const count = 3;
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true});
        jest.spyOn(categories, "find").mockImplementationOnce(() => {
            return {
                exec: jest.fn().mockResolvedValueOnce({length: 2})
            }
        });
        jest.spyOn(categories, "findOne").mockResolvedValue("food");
        jest.spyOn(categories, "findOne").mockReturnValue({
            exec: jest.fn().mockResolvedValue('rent')
        });
        jest.spyOn(transactions, "countDocuments").mockResolvedValue(count);


        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({data: {message: "Categories deleted", count: count}});
    })
    test('deleteCategory case: 401 (unAuth)', async () => {
        //const count = 3;
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: false, cause: "User is not an admin"});
        /*jest.spyOn(categories, "find").mockImplementationOnce(() => {
            return {
                exec: jest.fn().mockResolvedValueOnce({length: 2})
            }
        });
        jest.spyOn(categories, "findOne").mockResolvedValue("food");
        jest.spyOn(categories, "findOne").mockReturnValue({
            exec: jest.fn().mockResolvedValue('rent')
        });
        jest.spyOn(transactions, "countDocuments").mockResolvedValue(count);
        */

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({error: "User is not an admin"});
    })
    test('deleteCategory case: 400 (allCatDel)', async () => {
        //const count = 3;
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true});
        jest.spyOn(categories, "find").mockImplementationOnce(() => {
            return {
                exec: jest.fn().mockResolvedValueOnce({length: 1})
            }
        });
        /*jest.spyOn(categories, "findOne").mockResolvedValue("food");
        jest.spyOn(categories, "findOne").mockReturnValue({
            exec: jest.fn().mockResolvedValue('rent')
        });
        jest.spyOn(transactions, "countDocuments").mockResolvedValue(count);
        */

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error:"Cannot delete all categories"});
    })
    test('deleteCategory case: 400 (catNotFound)', async () => {
        //const count = 3;
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true});
        jest.spyOn(categories, "find").mockImplementationOnce(() => {
            return {
                exec: jest.fn().mockResolvedValueOnce({length: 2})
            }
        });
        jest.spyOn(categories, "findOne").mockResolvedValue(null);
        /*jest.spyOn(categories, "findOne").mockReturnValue({
            exec: jest.fn().mockResolvedValue('rent')
        });
        jest.spyOn(transactions, "countDocuments").mockResolvedValue(count);
        */

        await deleteCategory(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({error: "Category not found"});
    })
})
describe("getCategories", () => {
    let req = {};
    let res;
    beforeEach(() => {
        jest.resetAllMocks();
        req = { cookies: { accessToken: "accessToken", refreshToken: "refreshToken" } }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
    })

    test("getCategories(empty) -> case: 200", async () => {
        const cats = [];
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true});
        jest.spyOn(categories, "find").mockImplementationOnce(() => {
            return {
                exec: jest.fn().mockResolvedValue(cats)
            }
        })
        await getCategories(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({data: cats});
    });
    test("getCategories(array) -> case: 200", async () => {
        const cats = [{type: "food", color: "red"}, {type: "health", color: "green"}];
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true});
        jest.spyOn(categories, "find").mockImplementationOnce(() => {
            return {
                exec: jest.fn().mockResolvedValue(cats)
            }
        })
        await getCategories(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({data: cats});
    });
})

describe("createTransaction", () => { 
    beforeEach(() => {
        jest.resetAllMocks();
    })

    test('Returns a 400 error if the request body does not contain the username', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                amount: 100,
                type: "Food",
            },
            url:"/api/users/Mario/transactions",
            params: {
                username: "Mario"
            }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }
  
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        await createTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Missing parameters"});

    });

    test('Returns a 400 error if the request body does not contain the amount', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                username: "Mario",
                type: "Food",
            },
            url:"/api/users/Mario/transactions",
            params: {
                username: "Mario"
            }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }
  
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        await createTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Missing parameters"});
    });

    test('Returns a 400 error if the request body does not contain the category', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                amount: 100,
                username: "Mario",
            },
            url:"/api/users/Mario/transactions",
            params: {
                username: "Mario"
            }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }
  
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        await createTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Missing parameters"});

    });

    test('Returns a 400 error if at least one of the parameters in the request body is an empty string', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                username: "",
                amount: 100,
                type: "Food",
            },
            url:"/api/users/Mario/transactions",
            params: {
                username: "Mario"
            }
        }
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }
  
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        await createTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Empty parameters"});
    });

    test('Returns a 400 error if the type of category passed in the request body does not represent a category in the database', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                username: "Mario",
                amount: 100,
                type: "Food",
            },
            params: {
                username: "Mario",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        const returnedUser = { username: "Mario", email: "mario.red@mail.com", password:"securePass", refreshToken: "refreshToken", role: "Regular" };

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        jest.spyOn(User, "findOne").mockReturnValue(returnedUser);
        jest.spyOn(categories, "findOne").mockReturnValue(null);

        await createTransaction(mockReq, mockRes);
        
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Username or category not found"});
    })

    test('Returns a 400 error if the username passed in the request body is not equal to the one passed as a route parameter', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                username: "Mario",
                amount: 100,
                type: "Food",
            },
            params: {
                username: "Luigi",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        jest.spyOn(User, "findOne").mockReturnValue({username: "Luigi"});
        await createTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Mismatch between parameters and request"});
    })

    test('Returns a 400 error if the username passed in the request body does not represent a user in the database', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                username: "Mario",
                amount: 100,
                type: "Food",
            },
            params: {
                username: "Mario",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        jest.spyOn(User, "findOne").mockReturnValueOnce({username: "Mario"}).mockReturnValueOnce([]);

        await createTransaction(mockReq, mockRes);
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(2);
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Username or category not found"});
    })

    test('Returns a 400 error if the username passed as a route parameter does not represent a user in the database', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                username: "Mario",
                amount: 100,
                type: "Food",
            },
            params: {
                username: "Mario",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        jest.spyOn(User, "findOne").mockReturnValueOnce(null);

        await createTransaction(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(categories.findOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Username parameter not found"});
    })

    test('Returns a 400 error if the amount passed in the request body cannot be parsed as a floating value (negative numbers are accepted)', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                username: "Mario",
                amount: "lot of money",
                type: "Food",
            },
            params: {
                username: "Mario",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});

        await createTransaction(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).not.toHaveBeenCalled();
        expect(categories.findOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Amount must be a number"});
    }) 
    
    test('Returns a 401 error if called by an authenticated user who is not the same user as the one in the route parameter (authType = User)', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                username: "Mario",
                amount: 100,
                type: "Food",
            },
            params: {
                username: "Mario",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: false, cause: "Mismatched users"});

        await createTransaction(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).not.toHaveBeenCalled();
        expect(categories.findOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Mismatched users"});        
    })

    test('Return a 200 status code and the transaction object if the transaction is created successfully', async () => {
        const mockReq = { 
            cookies: { accessToken: "accessToken", refreshToken: "refreshToken" },
            body: {
                username: "Mario",
                amount: 100,
                type: "Food",
            },
            params: {
                username: "Mario",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refreshed token",
            }                
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        jest.spyOn(User, "findOne").mockReturnValueOnce({username: "Mario"}).mockReturnValueOnce({username: "Mario"});
        jest.spyOn(categories, "findOne").mockReturnValue({type: "Food"});
        jest.spyOn(transactions.prototype, "save").mockResolvedValueOnce({username: "Mario", amount: 100, type: "Food"});

        await createTransaction(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalledTimes(2);
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({data: {username: "Mario", amount: 100, type: "Food"}, refreshedTokenMessage: "Refreshed token"});        
    })
})

describe("getAllTransactions", () => { 
    test('Returns a 200 status code for successful getAllTransactions execution ', async () => {
        const mockReq = {}
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refreshed token",
            }
        }
        const transactions_db = [
            { username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", categories_info: {color: "red" }}, 
            { username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", categories_info: {color: "green" }},
            { username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", categories_info: {color: "red" }}
        ]

        const transactions_res = {
            data: [
                { username: "Mario", amount: 100, type: "food", date: "2023-05-19T00:00:00", color: "red" }, 
                { username: "Mario", amount: 70, type: "health", date: "2023-05-19T10:00:00", color: "green" },
                { username: "Luigi", amount: 20, type: "food", date: "2023-05-19T10:00:00", color: "red" }
            ],
            refreshedTokenMessage: "Refreshed token"
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        jest.spyOn(transactions, "aggregate").mockResolvedValueOnce(transactions_db);

        await getAllTransactions(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(transactions_res);
    });

    test('Returns a 401 error if called by an authenticated user who is not an admin (authType = Admin)', () => {
        const mockReq = {}
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refreshed token",
            }
        }
        
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: false, cause: "User is not an admin"});

        getAllTransactions(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.aggregate).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "User is not an admin"});
    })
})

describe("getTransactionsByUser",  () => { 
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Returns a 400 error if the username passed as a route parameter does not represent a user in the database', async () => {
        const mockReq = {
            body: {},
            params: {
                username: "Mario"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refreshed token",
            }
        }

        jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
            return{
              exec: jest.fn().mockResolvedValue(null)
            }
        })

        await getTransactionsByUser(mockReq, mockRes);

        expect(User.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Username parameter not found"});

    });

    test('Returns a 401 error if called by an authenticated user who is not the same user as the one in the route (authType = User)', async () => {
        const mockReq = {
            body: {},
            params: {
                username: "Mario"
            },
            url: "localhost:3000/api/users/Mario/transactions"
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        const retrievedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }

        jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
            return{
              exec: jest.fn().mockResolvedValue(retrievedUser)
            }
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "Mismatched users" });
        
        await getTransactionsByUser(mockReq, mockRes);
        
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.find).not.toHaveBeenCalled();
        expect(transactions.aggregate).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Mismatched users"});
    });

    test('Returns a 401 error  if called by an authenticated user who is not an admin (authType = Admin)', async () => {
        const mockReq = {
            body: {},
            params: {
                username: "Mario"
            },
            url: "localhost:3000/api/transactions/users/Mario"
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        const retrievedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }

        jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
            return{
              exec: jest.fn().mockResolvedValue(retrievedUser)
            }
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "User is not an admin" });
        
        await getTransactionsByUser(mockReq, mockRes);
        
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.find).not.toHaveBeenCalled();
        expect(transactions.aggregate).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "User is not an admin"});
    });

    test('Returns a 200 status code and filtered transactions of the user', async () => {
        const mockReq = {
            body: {},
            params: {
                username: "Mario"
            },
            url: "localhost:3000/api/users/Mario/transactions",
            query: {
                date: "2021-04-01"
            }
        }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        const retrievedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }
        //username type amount date
        const transactions_res = [
            {username: "test1", type: "Income", amount: 100, date: "2021-04-01"},
            {username: "test1", type: "Expense", amount: 50, date: "2021-04-01"}
        ]

        const expectedRes = {
            data: transactions_res,
            refreshedTokenMessage: "Refresh token"
        }
            
        jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
            return{
              exec: jest.fn().mockResolvedValue(retrievedUser)
            }
        })
        jest.spyOn(utils, "handleAmountFilterParams").mockReturnValue({amount: {$gte: 100}});
        jest.spyOn(utils, "handleDateFilterParams").mockReturnValue({date: {$gte: "2021-04-01T00:00:00.000Z"}});
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true });
        jest.spyOn(transactions, "aggregate").mockImplementationOnce((query) => {
            return{
                then: jest.fn().mockResolvedValue(transactions_res)
            }
        })

        await getTransactionsByUser(mockReq, mockRes);

        expect(User.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.find).not.toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(expectedRes);
    });

})

describe("getTransactionsByUserByCategory", () => { 
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Returns a 400 error if the username passed as a route parameter does not represent a user in the database (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/users/Mario/transactions/category/food",
            params: {
                username: "Mario",
                category: "food"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, authType: "User" });
        jest.spyOn(User, "findOne").mockReturnValue(null);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).not.toHaveBeenCalled();
        expect(transactions.aggregate).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Username parameter not found"});

    });

    test('Returns a 400 error if the username passed as a route parameter does not represent a user in the database (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/api/transactions/users/Mario/category/food",
            params: {
                username: "Mario",
                category: "food"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, authType: "Admin" });
        jest.spyOn(User, "findOne").mockReturnValue(null);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).not.toHaveBeenCalled();
        expect(transactions.aggregate).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Username parameter not found"});

    });

    test('Returns a 400 error if the category passed as a route parameter does not represent a category in the database (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/users/Mario/transactions/category/food",
            params: {
                username: "Mario",
                category: "food"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, authType: "User" });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario", email: "red@gmail.com", password:"prova", refreshToken: "refresh", role:"Regular" });
        jest.spyOn(categories, "findOne").mockReturnValue(null);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Category not found"});

    });

    test('Returns a 400 error if the category passed as a route parameter does not represent a category in the database (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/api/transactions/users/Mario/category/food",
            params: {
                username: "Mario",
                category: "food"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, authType: "Admin" });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario", email: "red@gmail.com", password:"prova", refreshToken: "refresh", role:"Regular" });
        jest.spyOn(categories, "findOne").mockReturnValue(null);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Category not found"});

    });

    test('Returns a 401 error if not authorized (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/users/Mario/transactions/category/food",
            params: {
                username: "Mario",
                category: "food"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario", email: "mario@rossi.com", password:"prova"});
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "Mismatched users" });

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Mismatched users"});

    });

    test('Returns a 401 error if not authorized (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/transactions/users/Mario/category/food",
            params: {
                username: "Mario",
                category: "food"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario", email: "mario@rossi.com", password:"prova"});
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "User is not an admin" });

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "User is not an admin"});

    });

    test('Returns a 200 status for successful fetch (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/users/Mario/transactions/category/food",
            params: {
                username: "Mario",
                category: "food"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }
        
        //{ _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }
        const retrievedTransactions = [
            {
                _id: "1",
                username: "Mario",
                amount: 10,
                type: "food",
                categories_info: {color: "red"},
                date: "2021-01-01"
            },
            {
                _id: "2",
                username: "Mario",
                amount: 20,
                type: "food",
                categories_info: {color: "red"},
                date: "2021-01-02"
            }
        ]

        const expectedData = [
            {
                _id: "1",
                username: "Mario",
                amount: 10,
                type: "food",
                color: "red",
                date: "2021-01-01"
            },
            {
                _id: "2",
                username: "Mario",
                amount: 20,
                type: "food",
                color: "red",
                date: "2021-01-02"
            }
        ]

        
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, authType: "User" });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario", email: "red@gmail.com", password:"prova", refreshToken: "refresh", role:"Regular" });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "food", color: "red" });
        jest.spyOn(transactions, "aggregate").mockReturnValue(retrievedTransactions);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({data:expectedData, refreshedTokenMessage: "Refresh token"});

    });

    test('Returns a 200 status for successful fetch (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/api/transactions/users/Mario/category/food",
            params: {
                username: "Mario",
                category: "food"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }
        
        //{ _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }
        const retrievedTransactions = [
            {
                _id: "1",
                username: "Mario",
                amount: 10,
                type: "food",
                categories_info: {color: "red"},
                date: "2021-01-01"
            },
            {
                _id: "2",
                username: "Mario",
                amount: 20,
                type: "food",
                categories_info: {color: "red"},
                date: "2021-01-02"
            }
        ]

        const expectedData = [
            {
                _id: "1",
                username: "Mario",
                amount: 10,
                type: "food",
                color: "red",
                date: "2021-01-01"
            },
            {
                _id: "2",
                username: "Mario",
                amount: 20,
                type: "food",
                color: "red",
                date: "2021-01-02"
            }
        ]

        
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, authType: "Admin" });
        jest.spyOn(User, "findOne").mockReturnValue({ username: "Mario", email: "red@gmail.com", password:"prova", refreshToken: "refresh", role:"Regular" });
        jest.spyOn(categories, "findOne").mockReturnValue({ type: "food", color: "red" });
        jest.spyOn(transactions, "aggregate").mockReturnValue(retrievedTransactions);

        await getTransactionsByUserByCategory(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(User.findOne).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({data:expectedData, refreshedTokenMessage: "Refresh token"});

    });
})

describe("getTransactionsByGroup", () => { 

    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('Returns a 400 error if the group is not found (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/groups/Group1/transactions",
            params: {
                username: "Group1"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(null)
            }
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, authType: "User" })


        await getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Group not found"});

    });


    test('Returns a 400 error if the group is not found (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/api/transactions/groups/Group1",
            params: {
                username: "Group1"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(null)
            }
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, authType: "Admin" })

        await getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Group not found"});

    });


    test('Returns a 401 error if not authorized (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/groups/Group1/transactions",
            params: {
                username: "Group1"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}

        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            } 
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false , cause: "Mismatched users"});

        await getTransactionsByGroup(mockReq, mockRes);

        expect(User.findOne).toHaveBeenCalled();
        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Mismatched users"});

    });

    test('Returns a 401 error if not authorized (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/api/transactions/groups/Group1",
            params: {
                username: "Group1"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}

        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            } 
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false , cause: "User is not an admin"});

        await getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "User is not an admin"});

    });

    test('Returns a 200 status for success (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/groups/Group1/transactions",
            params: {
                username: "Group1"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        const retrievedUser = { username: 'username1', email: 'test@email.com', password: 'hashedPassword'}
        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
        const retrievedTransactions = [
            { username: "username1", amount: 100, type: "food", date:"2021-04-01", users_info: {email:"t1@example.com"},categories_info: { color:"red"}},
            { username: "username1", amount: 100, type: "food", date:"2021-04-01", users_info: {email:"t1@example.com"},categories_info: { color:"red"}},
            { username: "username2", amount: 100, type: "food", date:"2021-04-01", users_info: {email:"t2@example.com"},categories_info: { color:"red"}},

        ]

        const retrievedTransactionsPrettier = [
            { username: "username1", amount: 100, type: "food", date:"2021-04-01", color:"red"},
            { username: "username1", amount: 100, type: "food", date:"2021-04-01", color:"red"},
            { username: "username2", amount: 100, type: "food", date:"2021-04-01", color:"red"},

        ]

        const expectedData = {
            data: retrievedTransactionsPrettier,
            refreshedTokenMessage: "Refresh token"
        }


        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            } 
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true});
        jest.spyOn(transactions, "aggregate").mockImplementationOnce(() => retrievedTransactions)

        await getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(expectedData);

    });

    test('Returns a 200 status for success (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/api/transactions/groups/Group1",
            params: {
                username: "Group1"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token",
            }
        }

        const retrievedUser = { username: 'username1', email: 'test@email.com', password: 'hashedPassword'}
        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
        const retrievedTransactions = [
            { username: "username1", amount: 100, type: "food", date:"2021-04-01", users_info: {email:"t1@example.com"},categories_info: { color:"red"}},
            { username: "username1", amount: 100, type: "food", date:"2021-04-01", users_info: {email:"t1@example.com"},categories_info: { color:"red"}},
            { username: "username2", amount: 100, type: "food", date:"2021-04-01", users_info: {email:"t2@example.com"},categories_info: { color:"red"}},

        ]

        const retrievedTransactionsPrettier = [
            { username: "username1", amount: 100, type: "food", date:"2021-04-01", color:"red"},
            { username: "username1", amount: 100, type: "food", date:"2021-04-01", color:"red"},
            { username: "username2", amount: 100, type: "food", date:"2021-04-01", color:"red"},

        ]

        const expectedData = {
            data: retrievedTransactionsPrettier,
            refreshedTokenMessage: "Refresh token"
        }


        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            } 
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, AuthType: "Admin"});
        jest.spyOn(transactions, "aggregate").mockImplementationOnce(() => retrievedTransactions)

        await getTransactionsByGroup(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(expectedData);

    });
})

describe("getTransactionsByGroupByCategory", () => { 

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Returns a 400 error if the group is not found', async () => {
        const mockReq = {
            body: {},
            params: {
                name: "Group1",
                category: "food"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token message",
            }
        }

        const retrievedUser = { username: 'username1', email: 'test@email.com', password: 'hashedPassword'}

        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(null)
            }
        });

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Group not found"});

    });

    test('Returns a 401 error if the user is not authenicated (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/groups/Group1/transactions/category/food",
            params: {
                name: "Group1",
                category: "food"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token message",
            }
        }

        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
 
        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            }
        });
        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: false, cause: "Mismatched users"});

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(User.findOne).toHaveBeenCalled();
        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Mismatched users"});

    });

    test('Returns a 401 error if the user is not authenicated (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/api/transactions/groups/Group1/category/food",
            params: {
                name: "Group1",
                category: "food"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token message",
            }
        }

        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            }
        });

        jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({ authorized: false, cause: "User is not an admin"});

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "User is not an admin"});

    });

    test('Returns a 400 error if the category doesn\'t exist (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/groups/Group1/transactions/category/food",
            params: {
                name: "Group1",
                category: "food"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token message",
            }
        }

        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            }
        });

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, AuthType: "User"});
        jest.spyOn(categories, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(null)
            }
        });

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Category not found"});

    });

    test('Returns a 400 error if the category doesn\'t exist (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/api/transactions/groups/Group1/category/food",
            params: {
                name: "Group1",
                category: "food"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token message",
            }
        }

        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            }
        });

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, AuthType: "Admin"});
        jest.spyOn(categories, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(null)
            }
        });

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Category not found"});

    });

    test('Returns a 200 status code for successful fetch (user)', async () => {
        const mockReq = {
            body: {},
            url: "/api/groups/Group1/transactions/category/food",
            params: {
                name: "Group1",
                category: "food"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token message",
            }
        }

        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
        const retrievedCategory = { type: "food", color: "red"}
        const retrievedTransactions = [
            {
                username: "username1",
                amount: 10,
                type: "food",
                users_info: {email: "t1@example.com"},
                categories_info: {color: "red"},
                date: "2021-01-01"
            },
            {
                username: "username2",
                amount: 20,
                type: "food",
                users_info: {email: "t2@example.com"},
                categories_info: {color: "red"},
                date: "2021-01-02"
            }
        ]

        const expectedData = [
            {
                username: "username1",
                amount: 10,
                type: "food",
                color: "red",
                date: "2021-01-01"
            },
            {
                username: "username2",
                amount: 20,
                type: "food",
                color: "red",
                date: "2021-01-02"
            }
        ]
        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            }
        });

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, AuthType: "User"});
        jest.spyOn(categories, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedCategory)
            }
        });
        jest.spyOn(transactions, "aggregate").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedTransactions)
            }
        });

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({data: expectedData, refreshedTokenMessage: "Refresh token message"});

    });

    test('Returns a 200 status code for successful fetch (admin)', async () => {
        const mockReq = {
            body: {},
            url: "/api/transactions/groups/Group1/category/food",
            params: {
                name: "Group1",
                category: "food"
            },
            cookies: {
                refreshToken: "refreshToken"
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refresh token message",
            }
        }

        const retrievedGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
        const retrievedCategory = { type: "food", color: "red"}
        const retrievedTransactions = [
            {
                username: "username1",
                amount: 10,
                type: "food",
                users_info: {email: "t1@example.com"},
                categories_info: {color: "red"},
                date: "2021-01-01"
            },
            {
                username: "username2",
                amount: 20,
                type: "food",
                users_info: {email: "t2@example.com"},
                categories_info: {color: "red"},
                date: "2021-01-02"
            }
        ]

        const expectedData = [
            {
                username: "username1",
                amount: 10,
                type: "food",
                color: "red",
                date: "2021-01-01"
            },
            {
                username: "username2",
                amount: 20,
                type: "food",
                color: "red",
                date: "2021-01-02"
            }
        ]
        jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedGroup)
            }
        });

        jest.spyOn(utils, "verifyAuth").mockReturnValue({ authorized: true, AuthType: "Admin"});
        jest.spyOn(categories, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedCategory)
            }
        });
        jest.spyOn(transactions, "aggregate").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedTransactions)
            }
        });

        await getTransactionsByGroupByCategory(mockReq, mockRes);

        expect(Group.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(categories.findOne).toHaveBeenCalled();
        expect(transactions.aggregate).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({data: expectedData, refreshedTokenMessage: "Refresh token message"});

    });
})

describe("deleteTransaction", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Returns a 400 error if the request body does not contain all the necessary attributes', async () => {
        const mockReq = {
            body: {
            },
            params: {
                username: "test1",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        const retrievedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }
        jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedUser)
            }
        });
        jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"});

        await deleteTransaction(mockReq, mockRes);

        expect(User.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.deleteOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Missing _id in request body"});
    });


    test('Returns a 400 error if the username passed as a route parameter does not represent a user in the database', async () => {
        const mockReq = {
            body: {
                _id: "123456789012345678901234",
            },
            params: {
                username: "test1",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        const retrievedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }
        jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(null)
            }
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"});
        jest.spyOn(transactions, "find").mockResolvedValueOnce([]);


        await deleteTransaction(mockReq, mockRes);

        expect(User.findOne).toHaveBeenCalled();
        expect(utils.verifyAuth).not.toHaveBeenCalled();
        expect(transactions.deleteOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "User not found"});
    });

    test('Returns a 400 error if the _id in the request body does not represent a transaction in the database', async () => {
        const mockReq = {
            body: {
                _id: "123456789012345678901234",
            },
            params: {
                username: "test1",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        const retrievedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }
        jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedUser)
            }
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"});
        jest.spyOn(transactions, "find").mockResolvedValueOnce([]);


        await deleteTransaction(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.find).toHaveBeenCalled();
        expect(transactions.deleteOne).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Transaction not found"});
    });

    test('Returns a 200 status code and Transaction deleted message if the transaction is successfully deleted', async () => {
        const mockReq = {
            body: {
                _id: "123456789012345678901234",
            },
            params: {
                username: "test1",
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refreshed token",
            }
        }

        const retrievedUser = { username: 'test1', email: 'test1@example.com', password: 'hashedPassword1' }
        jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
            return{
                exec: jest.fn().mockResolvedValue(retrievedUser)
            }
        })
        jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"});
        jest.spyOn(transactions, "find").mockResolvedValueOnce([{_id: "123456789012345678901234", username: "test1"}]);
        jest.spyOn(transactions, "deleteOne").mockResolvedValueOnce({_id: "123456789012345678901234"});

        await deleteTransaction(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.find).toHaveBeenCalled();
        expect(transactions.deleteOne).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ data: {message:"Transaction deleted"},refreshedTokenMessage:"Refreshed token" });
    });
})

describe("deleteTransactions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Returns a 400 error if the request body does not contain all the necessary attributes', () => {
        const mockReq = {
            body: {

            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});

        deleteTransactions(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.deleteMany).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "Missing transactions in request body"});
    });

    test('Returns a 400 error if at least one of the ids in the array is an empty string', () => {
        const mockReq = {
            body: {
                _ids: ["id1", ""],
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});

        deleteTransactions(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.find).not.toHaveBeenCalled();
        expect(transactions.deleteMany).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "One or more ids are empty strings"});
    });

    test('Returns a 400 error if at least one of the ids in the array does not represent a transaction in the database', async () => {
        const mockReq = {
            body: {
                _ids: ["id1", "id2"],
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        jest.spyOn(transactions, "find").mockResolvedValueOnce(["id1"]);

        await deleteTransactions(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.find).toHaveBeenCalled();
        expect(transactions.deleteMany).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({error: "One or more transactions not found"});
    });

    test('Returns a 401 error  if called by an authenticated user who is not an admin (authType = Admin)', async () => {
        const mockReq = {
            body: {
                transactions: ["id1", "id2"],
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }

        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: false, cause: "User is not an admin"});

        await deleteTransactions(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.find).not.toHaveBeenCalled();
        expect(transactions.deleteMany).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({error: "User is not an admin"});
    });

    test('Returns a 200 status for a successful deletetion', async () => {
        const mockReq = {
            body: {
                _ids: ["id1", "id2"],
            }
        }
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            locals: {
                refreshedTokenMessage: "Refreshed token",
            }
        }

        const transactions_db = [ "id1", "id2" ];
        const deletationRes = { deletedCount: 2, acknowledged: true}
        jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"});
        jest.spyOn(transactions, "find").mockResolvedValueOnce(transactions_db);
        jest.spyOn(transactions, "deleteMany").mockResolvedValueOnce(deletationRes);

        await deleteTransactions(mockReq, mockRes);

        expect(utils.verifyAuth).toHaveBeenCalled();
        expect(transactions.find).toHaveBeenCalled();
        expect(transactions.deleteMany).toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith({ data: {message:"Transactions deleted"},refreshedTokenMessage:"Refreshed token" });

    })
})