import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import { transactions, categories } from '../models/model';
import mongoose, { Model } from 'mongoose';
import dotenv from 'dotenv';
import {login, logout, registerAdmin} from "../controllers/auth.js";
import {getUsers} from "../controllers/users.js";

/**
 * Necessary setup in order to create a new database for testing purposes before starting the execution of test cases.
 * Each test suite has its own database in order to avoid different tests accessing the same database at the same time and expecting different data.
 */
dotenv.config();
beforeAll(async () => {
  const dbName = "testingDatabaseUsers";
  const url = `${process.env.MONGO_URI}/${dbName}`;

  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

});
/**
 * After all test cases have been executed the database is deleted.
 * This is done so that subsequent executions of the test suite start with an empty database.
 */
afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("getUsers", () => {
  /**
   * Database is cleared before each test case, in order to allow insertion of data tailored for each specific test case.
   */
  let req = {};
  let res = {};
  let accessToken = "";
  let refreshToken = "";
  beforeEach(async () => {
        await User.deleteMany({})
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
        jest.resetAllMocks();
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
        const response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
    })

  test("should return empty list if there are no users", async () => {
      //await getUsers(req, res);
      const response = await request(app).get("/api/users").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([{username: "admin", email: "admin@gmail.com", role:"Admin"}]);
  })

  test("should retrieve list of all users", async () => {
      await request(app).post("/api/register").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
      })
      await request(app).post("/api/register").send({
            username: "test2",
            password: "testpassword",
            email: "t2@example.com"
      })

      const response = await request(app).get("/api/users").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([{username: "admin", email: "admin@gmail.com", role:"Admin"},
          {username: "test1", email: "t1@example.com", role:"Regular"},
          {username: "test2", email: "t2@example.com", role:"Regular"}]);
  })

  test("not an admin - shouldn't be allowed to retrieve list of all users", async () => {
      jest.resetAllMocks();
      //await request(app).get("/api/logout").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
      await request(app).post("/api/register").send({
          username: "test1",
          password: "testpassword",
          email: "t1@example.com"
      })
      await request(app).post("/api/register").send({
          username: "test2",
          password: "testpassword",
          email: "t2@example.com"
      })

      req = {
          body: {
              username: "test1",
              password: "testpassword",
              email: "t1@example.com",
          }
      }
      res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
          cookie: jest.fn(),
          locals: {},
      }
      let response = await request(app).post("/api/login").send(req.body)
      accessToken = response.body.data.accessToken
      refreshToken =  response.body.data.refreshToken

      response = await request(app).get("/api/users").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
      expect(response.status).toBe(401);
      expect(response.body).toEqual({error: "User is not an admin"});
  })
})

describe("getUser", () => {
    let req = {};
    let res = {};
    let accessToken = "";
    let refreshToken = "";
    beforeEach(async () => {
        await User.deleteMany({})
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
        jest.resetAllMocks();
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
        const response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
    })

    test("admin - retrieve a user", async () => {
        await request(app).post("/api/register").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
        })

        const response = await request(app).get("/api/users/test1").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({username: "test1", email: "t1@example.com", role:"Regular"});
    })

    test("not an admin - shouldn't be allowed to retrieve a user", async () => {
        await request(app).post("/api/register").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
        })
        await request(app).post("/api/register").send({
            username: "test2",
            password: "testpassword",
            email: "t2@example.com"
        })

        req = {
            body: {
                username: "test1",
                password: "testpassword",
                email: "t1@example.com",
            }
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            locals: {},
        }
        let response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).get("/api/users/test2").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: "User is not an admin"});
    })

    test("not an admin but calls the function to retrieve their own info", async () => {
        await request(app).post("/api/register").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
        })
        let response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).get("/api/users/test1").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({username: "test1", email: "t1@example.com", role:"Regular"});
    })

    test("admin but the requested user doesn't exist", async () => {
        let response = await request(app).get("/api/users/mastrociliegia").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "User not found"});
    })
})

describe("createGroup", () => {
    let req = {};
    let res = {};
    let accessToken = "";
    let refreshToken = "";
    beforeEach(async () => {
        await User.deleteMany({})
        await Group.deleteMany({})
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
        jest.resetAllMocks();
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
        const response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
    })

    test("missing group name", async () => {
        await request(app).post("/api/register").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
        })
        await request(app).post("/api/register").send({
            username: "test2",
            password: "testpassword",
            email: "t2@example.com"
        })

        let response = await request(app).post("/api/login").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
        })
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({
                name: "",
                memberEmails: ["t1@example.com", "t2@example.com"]
            })
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Missing name or members"});
    })

    test("missing members", async () => {
        await request(app).post("/api/register").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
        })
        await request(app).post("/api/register").send({
            username: "test2",
            password: "testpassword",
            email: "t2@example.com"
        })

        let response = await request(app).post("/api/login").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
        })
        accessToken = response.body.data.accessToken
        refreshToken = response.body.data.refreshToken

        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({
                name: "group1",
                memberEmails: []
            })
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Missing name or members"});
    })

    test("user already in a group", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})

        // create a group named "groupX" with members t1 and t2
        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken = response.body.data.refreshToken
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "groupX", memberEmails: ["t1@example.com", "t2@example.com"]})

        // try to create a group named "groupY" with members t1 and t3
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "groupY", memberEmails: ["t1@example.com", "t3@example.com"]})

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "User already in a group"});
    })

    test("existing group name", async () => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})
        await request(app).post("/api/register").send({username: "test4", password: "testpassword", email: "t4@example.com"})

        // create a group named "groupX" with members t1 and t2
        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken = response.body.data.refreshToken
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "groupX", memberEmails: ["t1@example.com", "t2@example.com"]})

        // try to create another group named "groupX" with members t3 and t4
        response = await request(app).post("/api/login").send({username: "test3", password: "testpassword", email: "t3@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken = response.body.data.refreshToken
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "groupX", memberEmails: ["t3@example.com", "t4@example.com"]})

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Group with the same name already exists"});
    })

    // can't work
    /* test("members to add not in the system or already in a group", async () => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})

        // create a group named "groupX" with members t1 and t2
        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken = response.body.data.refreshToken
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "groupX", memberEmails: ["t1@example.com", "t2@example.com"]})

        // create a group named "groupY" with members t1, t2, and t3
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "groupY", memberEmails: ["t1@example.com", "t2@example.com", "t3@example.com"]})

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "All the members are not in the system or already in a group"});
    })*/

    test("successful creation of a new group", async () => {
        await request(app).post("/api/register").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
        })
        await request(app).post("/api/register").send({
            username: "test2",
            password: "testpassword",
            email: "t2@example.com"
        })

        let response = await request(app).post("/api/login").send({
            username: "test1",
            password: "testpassword",
            email: "t1@example.com"
        })
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({
                name: "gt1",
                memberEmails: ["t1@example.com", "t2@example.com"]
            })
        expect(response.status).toBe(200);
        expect(response.body.data.group).toEqual({name: "gt1", members: [{email: "t1@example.com"}, {email: "t2@example.com"}]});

    })

})

describe("getGroups", () => {
    let req = {};
    let res = {};
    let accessToken = "";
    let refreshToken = "";
    beforeEach(async () => {
        await User.deleteMany({})
        await Group.deleteMany({})
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
        jest.resetAllMocks();
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
        const response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
    })

    test("not an admin", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).get("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: "User is not an admin"});
    })

    test("retrieve all groups", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})
        await request(app).post("/api/register").send({username: "test4", password: "testpassword", email: "t4@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).post("/api/login").send({username: "test3", password: "testpassword", email: "t3@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group2", memberEmails: ["t3@example.com", "t4@example.com"]})

        response = await request(app).post("/api/login").send({username: "admin", password: "testpassword", email: "admin@gmail.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
        response = await request(app).get("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([{name: "group1", members: [{email: "t1@example.com"}, {email: "t2@example.com"}]},
            {name: "group2", members: [{email: "t3@example.com"}, {email: "t4@example.com"}]}]);
    })
})

describe("getGroup", () => {
    let req = {};
    let res = {};
    let accessToken = "";
    let refreshToken = "";
    beforeEach(async () => {
        await User.deleteMany({})
        await Group.deleteMany({})
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
        jest.resetAllMocks();
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
        const response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
    })

    test("group doesn't exist", async() => {
        let response = await request(app).get("/api/groups/1").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Group doesn't exist"});
    })

    test("group member retrieves own group info", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).get("/api/groups/group1").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({name: "group1", members: [{email: "t1@example.com"}, {email: "t2@example.com"}]});
    })

    test("admin retrieves a group info", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).post("/api/login").send({username: "admin", password: "testpassword", email: "admin@gmail.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).get("/api/groups/group1").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({name: "group1", members: [{email: "t1@example.com"}, {email: "t2@example.com"}]});
    })

})

describe("addToGroup", () => {
    let req = {};
    let res = {};
    let accessToken = "";
    let refreshToken = "";
    beforeEach(async () => {
        await User.deleteMany({})
        await Group.deleteMany({})
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
        jest.resetAllMocks();
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
        const response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
    })

    test("group doesn't exist", async() => {
        let response = await request(app).patch("/api/groups/1/insert").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({memberEmails: ["t1@example.com"]})
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Group not found"});
    })

    test("not a member of the group trying to add to that group", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})
        await request(app).post("/api/register").send({username: "test4", password: "testpassword", email: "t4@example.com"})

        // test1 creates a group with test2 as a member
        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        //test3 try to add test4 as a member
        response = await request(app).post("/api/login").send({username: "test3", password: "testpassword", email: "t3@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
        response = await request(app).patch("/api/groups/group1/insert").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({memberEmails: ["t4@example.com"]})
        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: "User is not an admin"});
    })

    test("missing emails", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).patch("/api/groups/group1/add").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Missing parameters"});
    })

    test("invalid email format", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).patch("/api/groups/group1/add").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({emails: ["t3example.com"]})
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Invalid member email"});
    })

    test("users to add don't exist or already in a group", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).patch("/api/groups/group1/add").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({emails: ["t2@example.com", "noexists@example.com"]})
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "All the members are not in the system or already in a group"});
    })

})

describe("removeFromGroup", () => {
    let req = {};
    let res = {};
    let accessToken = "";
    let refreshToken = "";
    beforeEach(async () => {
        await User.deleteMany({})
        await Group.deleteMany({})
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
        jest.resetAllMocks();
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
        const response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
    })

    test("group doesn't exist", async() => {
        let response = await request(app).patch("/api/groups/1/pull").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({memberEmails: ["t1@example.com"]})
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Group not found"});
    })

    test("user not in group trying to remove an user", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).post("/api/login").send({username: "test3", password: "testpassword", email: "t3@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).patch("/api/groups/group1/pull").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({memberEmails: ["t1@example.com"]})

        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: "User is not an admin"});
    })

    test("users to remove not exist or not in group", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).patch("/api/groups/group1/remove").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({emails: ["t3@example.com", "t3000@example.com"]})

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "All the members are not in the system or not in the group"});
    })

    test("remove users from group", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "group1", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).patch("/api/groups/group1/remove").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({emails: ["t2@example.com"]})
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual( {group: {name: "group1", members: [{email: "t1@example.com"}]}, notInGroup: [], membersNotFound: []});
    })
})

describe("deleteUser", () => {
    let req = {};
    let res = {};
    let accessToken = "";
    let refreshToken = "";
    beforeEach(async () => {
        await User.deleteMany({})
        await Group.deleteMany({})
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
        jest.resetAllMocks();
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
        const response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
    })

    test("user is not an admin", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).delete("/api/users").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({email: ["t2@example.com"]})
        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: "User is not an admin"});
    })

    test("missing email", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})

        let response = await request(app).delete("/api/users").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Missing email"});
    })

    test("user doesn't exist", async() => {
        let response = await request(app).delete("/api/users").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({email: ["taco@truck.vb"]})
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "User not found"});
    })

    test("can't delete an admin", async() => {
        await request(app).post("/api/admin").send({username: "afterhours",  password: "mydhours", email: "after@hours.com"})

        let response = await request(app).delete("/api/users").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({email: ["after@hours.com"]})

        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Admins cannot be deleted"});
    })

    test("user deleted", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        await new transactions({username: "test1", type: "income", amount: 100}).save()
        await new transactions({username: "test1", type: "food", amount: 50}).save()

        response = await request(app).post("/api/login").send({username: "admin", password: "testpassword", email: "admin@gmail.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).delete("/api/users").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({email: ["t1@example.com"]})
        await transactions.deleteMany({})
        expect(response.status).toBe(200);
        expect(response.body.data).toEqual({deletedTransactions: 2, deletedFromGroup: false});
    })
})

describe("deleteGroup", () => {
    let req = {};
    let res = {};
    let accessToken = "";
    let refreshToken = "";
    beforeEach(async () => {
        await User.deleteMany({})
        await Group.deleteMany({})
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
        jest.resetAllMocks();
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
        const response = await request(app).post("/api/login").send(req.body)
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken
    })

    test("missing group name", async() => {
        let response = await request(app).delete("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Missing group name"});
    })

    test("group doesn't exist", async() => {
        let response = await request(app).delete("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "donda"})
        expect(response.status).toBe(400);
        expect(response.body).toEqual({error: "Group not found"});
    })

    test("not an admin trying to delete a group", async() => {
        await request(app).post("/api/register").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        await request(app).post("/api/register").send({username: "test2", password: "testpassword", email: "t2@example.com"})
        await request(app).post("/api/register").send({username: "test3", password: "testpassword", email: "t3@example.com"})

        let response = await request(app).post("/api/login").send({username: "test1", password: "testpassword", email: "t1@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        await request(app).post("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "whoua", memberEmails: ["t1@example.com", "t2@example.com"]})

        response = await request(app).post("/api/login").send({username: "test3", password: "testpassword", email: "t3@example.com"})
        accessToken = response.body.data.accessToken
        refreshToken =  response.body.data.refreshToken

        response = await request(app).delete("/api/groups").set("Cookie", [`accessToken=${accessToken}`, `refreshToken=${refreshToken}`])
            .send({name: "whoua"})

        expect(response.status).toBe(401);
        expect(response.body).toEqual({error: "User is not an admin"});
    })
})
