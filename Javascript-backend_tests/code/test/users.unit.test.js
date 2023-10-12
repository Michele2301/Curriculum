import request from 'supertest';
import { app } from '../app';
import { User, Group } from '../models/User.js';
import * as utils from "../controllers/utils.js";
import {verify} from "jsonwebtoken";
import {transactions} from "../models/model.js";
jest.mock("../controllers/utils.js");
/**
 * In order to correctly mock the calls to external modules it is necessary to mock them using the following line.
 * Without this operation, it is not possible to replace the actual implementation of the external functions with the one
 * needed for the test cases.
 * `jest.mock()` must be called for every external module that is called in the functions under test.
 */
jest.mock("../models/User.js")

/**
 * Defines code to be executed before each test case is launched
 * In this case the mock implementation of `User.find()` is cleared, allowing the definition of a new mock implementation.
 * Not doing this `mockClear()` means that test cases may use a mock implementation intended for other test cases.
 */
beforeEach(() => {
  User.find.mockClear()
  //additional `mockClear()` must be placed here

});

describe("getUsers", () => {
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

  // OK
  test("should return empty list if there are no users", async () => {
    //any time the `User.find()` method is called jest will replace its actual implementation with the one defined below
    const retrievedUsers = []
    jest.spyOn(utils, "verifyAuth").mockReturnValue( { authorized: true, cause: "Authorized" })
    jest.spyOn(User, "find").mockImplementation(() => [])
    const response = await request(app).get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({data: []})
  })

  // OK
  test("should retrieve list of all users", async () => {
    const retrievedUsers = [{ username: 'test1', email: 'test1@example.com', role: 'Default' }, { username: 'test2', email: 'test2@example.com', password: 'Default' }]

    jest.spyOn(User, "find").mockImplementation(() => retrievedUsers)
    jest.spyOn(utils, "verifyAuth").mockReturnValue( { authorized: true, cause: "Authorized" })
    const response = await request(app).get("/api/users")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({data: retrievedUsers})
  })
})

describe("getUser", () => {
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

  // OK
  test("no such a user - should return an error", async() => {
    const retrievedUser = []

    jest.spyOn(User, "findOne").mockImplementation(() => {
      return {
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce( { authorized: false, cause: "Unknown auth type" })
        .mockReturnValueOnce({authorized: true, cause: "Authorized"})

    const response = await request(app).get("/api/users/test1");

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "User not found"})
  })

  test("user calls getuser to retrieve own information", async() => {
    const retrievedUser = { username: 'test1', email: 'test1@example.com', role: 'Default' }

    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(retrievedUser)
      }
    })

    const response = await request(app).get("/api/users/test1");

    expect(response.status).toBe(200)
    expect(response.body).toEqual({data: retrievedUser})
  })

  // OK
  test("user calls getuser to retrieve another user's information - shouldn't be allowed", async() => {
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce( { authorized: false, cause: "Mismatched users" })
        .mockReturnValueOnce({authorized: false, cause: "User is not an admin"})

    const response = await request(app).get("/api/users/test1");

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "User is not an admin"})
  })

  test("admin calls getuser to retrieve another user's information", async() => {
    const retrievedUser = { username: 'test1', email: 'test1@example.com', role: 'Default' }
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce( { authorized: false, cause: "Mismatched users" })
        .mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(retrievedUser)
      }
    })

    const response = await request(app).get("/api/users/test1");

    expect(response.status).toBe(200)
    expect(response.body).toEqual({data: retrievedUser})
  })

})

describe("createGroup", () => {
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

  test("no name provided", async() => {
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true})
    const response = await request(app).post("/api/groups");
    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "Missing name or members"})
  })

  test("group is an empty string", async() => {
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true})
    const body = {name: "", memberEmails: ["t0@example.com", "t1@example.com"]}
    const response = await request(app).post("/api/groups").send(body)
    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "Missing name or members"})
  })

  test("not authorized user", async() => {
    const body = {name: "Group1", memberEmails: ["t0@example.com", "t1@example.com"]}
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "Unauthorized"})

    const response = await request(app).post("/api/groups").send(body);

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "Unauthorized"})
  })

  test("creator of the group not an existing user", async() => {
    const body = {name: "Group1", memberEmails: ["t0@example.com", "t1@example.com"]}
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementation((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    const response = await request(app).post("/api/groups").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "User not found"})
  })

  test("creator of the group already in a group", async() => {
    const body = {name: "Group1", memberEmails: ["t0@example.com", "t1@example.com"]}
    const retrievedUser = { username: "username1", email: "t1@example.com", password: "hashedPassword1" }
    const usersInGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}

    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementation((query) => {
      return{
        exec: jest.fn().mockResolvedValue(retrievedUser)
      }
    })
    jest.spyOn(Group, "findOne").mockImplementation((query) => {
      return{
        exec: jest.fn().mockResolvedValue(usersInGroup)
      }
    })

    const response = await request(app).post("/api/groups").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "User already in a group"})
  })

  test("another group with the same name already exists", async() => {
    const body = {name: "Group1", memberEmails: ["t0@example.com", "t1@example.com"]}
    const retrievedUser = {username: "username1", email: "t1@example.com", password: "hashedPassword1"}
    const existingGroup = {name: "Group1", members: [{email: "t2@example.com", user: "username2"}, {email: "t3@example.com", user: "username3"}]}

    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(retrievedUser)
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    }).mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(existingGroup)
      }
    })

    const response = await request(app).post("/api/groups").send(body)

    expect(response.body).toEqual({error: "Group with the same name already exists"})
    expect(response.status).toBe(400);
  })

  test("member email format not valid", async() => {
    const body = {name: "Group1", memberEmails: ["t0@example.com", "a@"]}
    const retrievedUser = {username: "username1", email: "t1@example.com", password: "hashedPassword1"}
    //const existingGroup = {name: "Group1", members: [{email: "t2@example.com", user: "username2"}, {email: "t3@example.com", user: "username3"}]}

    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(retrievedUser)
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    }).mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    const response = await request(app).post("/api/groups").send(body)

    expect(response.body).toEqual({error: "Invalid member email"})
    expect(response.status).toBe(400);
  })

  test("all users are not in the system or in another group", async() => {
    const body = {name: "TestGroup", memberEmails: ["t3@example.com", "t4@example.com"]}
    const retrievedUser = {username: "username1", email: "t1@example.com", password: "hashedPassword1"}
    const usersInGroup = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t4@example.com", user: "username4"}]}

    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(retrievedUser)
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    }).mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    // simulate t3 not existing, t4 and t1 already in a group
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue({username: "username4", email: "t4@example.com", password: "hashedPassword4"})
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(usersInGroup)
      }
    })
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue({username: "username1", email: "t1@example.com", password: "hashedPassword1"})
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return{
            exec: jest.fn().mockResolvedValue(undefined)
        }
    })

    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(usersInGroup)
      }
    })

    const response = await request(app).post("/api/groups").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error:"All the members are not in the system or already in a group"})
  })

  test("create a new group", async() => {
    const body = {name: "Group1", memberEmails: ["t1@example.com", "t2@example.com"]}
    const retrievedUser = {username: "username1", email: "t1@example.com", password: "hashedPassword1"}

    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(retrievedUser)
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    }).mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    //t1 and t2 are existing users and not in a group
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue({username: "username1", email: "t1@example.com", password: "hashedPassword1"})
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue({username: "username2", email: "t2@example.com", password: "hashedPassword2"})
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    //jest.spyOn(Group, "new").mockReturnValueOnce({name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]})
    jest.spyOn(Group, "create").mockImplementationOnce((query) => {
      return {...body,save:jest.fn()};
    })

    const response = await request(app).post("/api/groups").send(body)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({data:{group:{name:"Group1",members:[{email:"t1@example.com"},{email:"t2@example.com"}]},alreadyInGroup:[],membersNotFound:[]}})
  })

})

describe("getGroups", () => {
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

  test("user not an admin", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "Unauthorized"})

    const response = await request(app).get("/api/groups")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "Unauthorized"})
  })

  test("user is an admin", async () => {
    const groups = [{name: "Group1", members: [{email: "t2@example.com", user: "username2"}, {email: "t3@example.com", user: "username3"}]},
      {name: "Group2", members: [{email: "t4@example.com", user: "username4"}, {email: "t5@example.com", user: "username5"}]}]
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(Group, "find").mockImplementation((query) => {
      return {
        exec: jest.fn().mockResolvedValue(groups)
      }
    })
    const result = [{name: "Group1", members: [{email: "t2@example.com"}, {email: "t3@example.com"}]},
        {name: "Group2", members: [{email: "t4@example.com"}, {email: "t5@example.com"}]}]

    const response = await request(app).get("/api/groups")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({data: result})
  })
})

describe("getGroup", () => {
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

  test("group doesn't exist", async () => {
      jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
          return {
              exec: jest.fn().mockResolvedValue(undefined)
          }
      })

      const response = await request(app).get("/api/groups/Group1")

      expect(response.status).toBe(400)
      expect(response.body).toEqual({error: "Group doesn't exist"})
  })

  test("user is not an admin", async () => {
    const group = {name: "Group1", members: [{email: "t1@example.com"}, {email: "t2@example.com"}]}
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return {
            exec: jest.fn().mockResolvedValue(group)
        }
    })

    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "Unauthorized"})
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "Unauthorized"})

    const response = await request(app).get("/api/groups/Group1")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "User is not an admin"})
  })

  test("user doesn't exist", async () => {
    const group = {name: "Group1", members: [{email: "t1@example.com"}, {email: "t2@example.com"}]}
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return {
            exec: jest.fn().mockResolvedValue(group)
        }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    const response = await request(app).get("/api/groups/Group1")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "User not found"})
  })

  test("user in the group", async() => {
    const user = {username: "username1", email: "t1@example.com", password: "hashedPassword1"}
    const group = {name: "Group1", members: [{email: "t1@example.com"}, {email: "t2@example.com"}]}
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return {
            exec: jest.fn().mockResolvedValue(group)
        }
    })
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
        return {
            exec: jest.fn().mockResolvedValue(user)
        }
    })

    const response = await request(app).get("/api/groups/Group1")

    expect(response.status).toBe(200)
    expect(response.body).toEqual({data: group})
  })

  test("user not in the group, not an admin", async() => {
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return {
            exec: jest.fn().mockResolvedValue(group)
        }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "Unauthorized"}).mockReturnValueOnce({authorized: false, cause: "User is not an admin"})

    const response = await request(app).get("/api/groups/Group1")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "User is not an admin"})
  })

  test("user not in the group, an admin", async() => {
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0"}
    const group = {name: "Group1", members: [{email: "t1@example.com"}, {email: "t2@example.com"}]}
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return {
            exec: jest.fn().mockResolvedValue(group)
        }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "Unauthorized"}).mockReturnValueOnce({authorized: false, cause: "User is not an admin"})

    const response = await request(app).get("/api/groups/Group1")

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "User is not an admin"})
  })
})

describe("addToGroup", () => {
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

  test("memberEmails not provided", async() => {
    jest.spyOn(Group, "findOne").mockImplementation(()=> {
      return {
        exec: jest.fn().mockResolvedValue({members:[]})
      }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true})
    const response = await request(app).patch("/api/groups/Group1/insert")

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "Missing parameters"})
  })


  test("group doesn't exist", async () => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true})
    jest.spyOn(Group, "findOne").mockImplementationOnce(()=> {
      return {
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    const body = {emails: ["t0@example.com", "t1@example.com"]}
    const user = {username: "username1", email: "t1@example.com", password: "hashedPassword1"}

    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return { exec: jest.fn().mockResolvedValue(user)}
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return { exec: jest.fn().mockResolvedValue(undefined) }
    })

    const response = await request(app).patch("/api/groups/Group1/insert").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "Group not found"})
  })

  test("not authorized", async() => {
    const body = {emails: ["t3@example.com", "t4@example.com"]}
    const user = {username: "username1", email: "t1@example.com", password: "hashedPassword1"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}

    jest.spyOn(User, "findOne").mockImplementationOnce( (query) => {
      return{
        exec: jest.fn().mockResolvedValue(user)
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue(group)
      }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "Unauthorized"})

    const response = await request(app).patch("/api/groups/Group1/insert").send(body)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "Unauthorized"})
  })

  test("user not in group and not an admin", async() => {
    const body = {emails: ["t3@example.com", "t4@example.com"]}
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}


    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue(group)
      }
    })
    jest.spyOn(User, "findOne").mockImplementationOnce( (query) => {
      return{
        exec: jest.fn().mockResolvedValue(user)
      }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "User is not an admin"})

    const response = await request(app).patch("/api/groups/Group1/insert").send(body)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "User is not an admin"})
  })

  test("user not in group and an admin (covers also user in group), but members not in the system or in another group", async() => {
    const body = {emails: ["t3@example.com", "t4@example.com"]}
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue(group)
      }
    })

    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})

    //simulate t3 not existing and t4 in another group
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    }).mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue({username: "username4", email: "t4@example.com", password: "hashedPassword4"})
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue({name: "Group2", members: [{email: "t4@example.com", user: "username4"}, {email: "t5@example.com", user: "username5"}]})
      }
    })

    const response = await request(app).patch("/api/groups/Group1/insert").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "All the members are not in the system or already in a group"})
  })

  test("user not in group and an admin (covers also user in group), some members added", async() => {
    const body = {emails: ["t41@example.com", "t42@example.com"]}
    const user41 = {username: "username41", email: "t41@example.com", password: "hashedPassword41"}
    const user42 = {username: "username42", email: "t42@example.com", password: "hashedPassword42"}
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}
    const updatedGroup = {name: "Group1", members: [{email: "t1@example.com"}, {email: "t2@example.com"}, {email: "t41@example.com"}, {email: "t42@example.com"}]}


    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue(group)
      }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})

    //simulate t41 and t42 existing and not in another group
    jest.spyOn(User, "findOne").mockImplementationOnce( (query) => {
      return{
        exec: jest.fn().mockResolvedValue(user41)
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })
    jest.spyOn(User, "findOne").mockImplementationOnce( (query) => {
      return{
        exec: jest.fn().mockResolvedValue(user42)
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    jest.spyOn(Group, "updateOne").mockReturnValueOnce({})
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue(updatedGroup)
      }
    })

    const response = await request(app).patch("/api/groups/Group1/insert").send(body)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({data: {group: {name: "Group1", members: updatedGroup.members}, alreadyInGroup: [], membersNotFound: []}})
  })
})

describe("removeFromGroup", () => {
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

  test("group doesn't exist", async () => {
      const body = {emails: ["t3@example.com", "t4@example.com"]}

      jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
          return {
              exec: jest.fn().mockResolvedValue(undefined)
          }
      })

      const response = await request(app).patch("/api/groups/Group1/pull").send(body)

      expect(response.status).toBe(400)
      expect(response.body).toEqual({error: "Group not found"})
  })

  test("not authorized", async() => {
      const body = {emails: ["t3@example.com", "t4@example.com"]}
      const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}

      jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
          return {
              exec: jest.fn().mockResolvedValue(group)
          }
      })
      jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "Unauthorized"})

      const response = await request(app).patch("/api/groups/Group1/pull").send(body)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({error: "Unauthorized"})
    })

  test("user not in group and not an admin", async() => {
    const body = {emails: ["t3@example.com", "t4@example.com"]}
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}

    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return {
            exec: jest.fn().mockResolvedValue(group)
        }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "User is not an admin"})

    const response = await request(app).patch("/api/groups/Group1/pull").send(body)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "User is not an admin"})
  })

  test("user not in group and an admin (covers also user in group), but members not in the system or in another group", async() => {
    const body = {emails: ["t3@example.com", "t4@example.com"]}
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}

    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return {
            exec: jest.fn().mockResolvedValue(group)
        }
    })

    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})

    //simulate t3 not existing and t4 in another group
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue(undefined)
      }
    }).mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue({username: "username4", email: "t4@example.com", password: "hashedPassword4"})
      }
    })

    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return {
        exec: jest.fn().mockResolvedValue({name: "Group2", members: [{email: "t4@example.com", user: "username4"}, {email: "t5@example.com", user: "username5"}]})
      }
    })

    const response = await request(app).patch("/api/groups/Group1/pull").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "All the members are not in the system or not in the group"})
  })

  test("user not in group and an admin (covers also user in group), only one member in the group, shouldn't remove", async() => {
    const body = {emails: ["t1@example.com"]}
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}]}

    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return {
            exec: jest.fn().mockResolvedValue(group)
        }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})

    // t1 the only member of the group
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockReturnValueOnce({username: "username1", email: "t1@example.com", password: "hashedPassword1"})
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockReturnValueOnce(group)
      }
    })

    const response = await request(app).patch("/api/groups/Group1/pull").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error:"You cannot remove all the members from a group"})
  })

})

describe("deleteUser", () => {
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

  test("missing email", async() => {
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    const response = await request(app).delete("/api/users")

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "Missing email"})
  })

  test("user is not an admin", async() => {
    const body = {email: "t5@example.com"}
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: false, cause: "User is not an admin"})

    const response = await request(app).delete("/api/users").send(body)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({error: "User is not an admin"})
  })

  test("email to remove doesn't belong to any user", async() => {
    const body = {email: "t5@example.com"}
    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    const response = await request(app).delete("/api/users").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "User not found"})
  })

  test("email to remove belongs to an admin", async() => {
    const body = {email: "t0@example.com"}
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0", role: "Admin"}

    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(user)
      }
    })

    const response = await request(app).delete("/api/users").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "Admins cannot be deleted"})
  })

  test("email to remove belongs to a user in a group (the only member)", async() => {
    const body = {email: "t0@example.com"}
    const user = {username: "username0", email: "t0@example.com", password: "hashedPassword0", role: "Regular"}
    const group = {name: "Group1", members: [{email: "t0@example.com", user: "username0"}]}

    jest.spyOn(utils, "verifyAuth").mockReturnValue({authorized: true, cause: "Authorized"})
    jest.spyOn(User, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(user)
      }
    })
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(group)
      }
    })

    jest.spyOn(transactions, "deleteMany").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue({deletedCount: 3})
      }
    })

    const response = await request(app).delete("/api/users").send(body)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({data: {deletedTransactions: 3, deletedFromGroup: true}})
  })

})

describe("deleteGroup", () => {
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

  test("missing group name", async() => {
    const response = await request(app).delete("/api/groups")

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "Missing group name"})
  })

  test("group doesn't exist", async() => {
    const body = {name: "Group1"}
    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
      return{
        exec: jest.fn().mockResolvedValue(undefined)
      }
    })

    const response = await request(app).delete("/api/groups").send(body)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({error: "Group not found"})
  })

  test("user not in group and not an admin", async() => {
    const body = {name: "Group1"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}

    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return{
            exec: jest.fn().mockResolvedValue(group)
        }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "User not in the group"})
        .mockReturnValueOnce({authorized: false, cause: "User is not an admin"})

    const response = await request(app).delete("/api/groups").send(body)

    expect(response.status).toBe(401)
  })

  test("user not in group but admin (covers also user in the group), group removed", async() => {
    const body = {name: "Group1"}
    const group = {name: "Group1", members: [{email: "t1@example.com", user: "username1"}, {email: "t2@example.com", user: "username2"}]}

    jest.spyOn(Group, "findOne").mockImplementationOnce((query) => {
        return{
            exec: jest.fn().mockResolvedValue(group)
        }
    })
    jest.spyOn(utils, "verifyAuth").mockReturnValueOnce({authorized: false, cause: "User not in the group"})
        .mockReturnValueOnce({authorized: true, cause: "Authorized"})
    jest.spyOn(Group, "deleteOne").mockReturnValueOnce({})

    const response = await request(app).delete("/api/groups").send(body)

    expect(response.status).toBe(401)
  })
})