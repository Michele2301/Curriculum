import { handleDateFilterParams, verifyAuth, handleAmountFilterParams,checkMinMaxParams,checkDate,checkDateParams} from '../controllers/utils';
import jwt, {TokenExpiredError} from "jsonwebtoken";
jest.mock('jsonwebtoken');
describe("handleDateFilterParams", () => {
    test('Should return the correct date filter', () => {
        let a=handleDateFilterParams({
            query:{}
        })
        expect(a).toStrictEqual({});
    })
    test('Should return the correct date filter 1', () => {
        let a=handleDateFilterParams({
            query:{upTo:"2021-01-01"}
        })
        expect(a).toStrictEqual({date:{$lte:new Date("2021-01-01T23:59:59.999Z")}});
    })
    test('Should return the correct date filter 2', () => {
        let a=handleDateFilterParams({
            query:{from:"2021-01-01"}
        })
        expect(a).toStrictEqual({date:{$gte:new Date("2021-01-01")}});
    })
    test('Should return the correct date filter 3', () => {
        let a=handleDateFilterParams({
            query:{from:"2021-01-01",upTo:"2021-01-02"}
        })
        expect(a).toStrictEqual({date:{$gte:new Date("2021-01-01"),$lte:new Date("2021-01-02T23:59:59.999Z")}});
    })
    test('Should return error', () => {
        try{
            let a=handleDateFilterParams({
                query:{from:"2021-01-02",upTo:"2021-01-01"}
            })
        }catch (e) {
            expect(e.message).toBe("Invalid date parameters");
        }
    })
    test('Should return error1', () => {
        try{
            let a=handleDateFilterParams({
                query:{from:"2021-01-02",date:"2021-01-01"}
            })
        }catch (e) {
            expect(e.message).toBe("Invalid date parameters");
        }
    })
    test('Should return error2', () => {
        try{
            let a=handleDateFilterParams({
                query:{from:"2021-01-02",upTo:"01-01"}
            })
        }catch (e) {
            expect(e.message).toBe("Invalid date parameters");
        }
    })
})

describe("verifyAuth", () => {
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
    test('Should return true for valid simple authentication (authType=Simple)', () => {
        const info = { authType: 'Simple' };
        //Mock jwt.verify to return a valid decodedToken
        jest.spyOn(jwt,"verify").mockReturnValue({ username: "testname", email: "test@email", role: "Regular" })

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(true);
    });
    test('Should return false for missing parameter', () => {
        const info = { authType: 'Simple' };
        //Mock jwt.verify to return a valid decodedToken
        jest.spyOn(jwt, 'verify').mockReturnValue({ email: "test@email", role: "Regular" });

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(false);
        expect(result.cause).toBe("Token is missing information");
    });
    test('Mismatched users',()=>{
        const info = { authType: 'Simple' };
        //Mock jwt.verify to return a valid decodedToken
        const a=jest.spyOn(jwt, 'verify');
        a.mockReturnValueOnce({ username: "testname1", email: "test@email", role: "Regular" })
        a.mockReturnValue({ username: "testname", email: "test@email", role: "Regular" })

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(false);
        expect(result.cause).toBe("Mismatched users");
    })
    //User
    test('User authorized',()=>{
        const info = { authType: 'User' ,username:"testname"};
        //Mock jwt.verify to return a valid decodedToken
        const a=jest.spyOn(jwt, 'verify');
        a.mockReturnValue({ username: "testname", email: "test@email", role: "Regular" })

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(true);
    })
    test('User mismatched username',()=>{
        const info = { authType: 'User' ,username:"testname1"};
        //Mock jwt.verify to return a valid decodedToken
        const a=jest.spyOn(jwt, 'verify');
        a.mockReturnValue({ username: "testname", email: "test@email", role: "Regular" })

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(false);
        expect(result.cause).toBe("Mismatched users");
    })
    test('Admin authorized',()=>{
        const info = { authType: 'Admin'};
        //Mock jwt.verify to return a valid decodedToken
        const a=jest.spyOn(jwt, 'verify');
        a.mockReturnValue({ username: "testname", email: "test@email", role: "Admin" })

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(true);
    })
    test('Admin not authorized',()=>{
        const info = { authType: 'Admin'};
        //Mock jwt.verify to return a valid decodedToken
        const a=jest.spyOn(jwt, 'verify');
        a.mockReturnValue({ username: "testname", email: "test@email", role: "Regular" })

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(false);
        expect(result.cause).toBe("User is not an admin");
    })
    test('Group authorized',()=>{
        const info = { authType: 'Group',emails:["test@email"]};
        //Mock jwt.verify to return a valid decodedToken
        const a=jest.spyOn(jwt, 'verify');
        a.mockReturnValue({ username: "testname", email: "test@email", role: "Regular" })

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(true);
    })
    test('Group not authorized',()=>{
        const info = { authType: 'Group',emails:["test1@email"]};
        //Mock jwt.verify to return a valid decodedToken
        const a=jest.spyOn(jwt, 'verify');
        a.mockReturnValue({ username: "testname", email: "test@email", role: "Regular" })

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(false);
        expect(result.cause).toBe("Group doesn't contain that email");
    })
    test('Should return a message for outdated accessToken valid simple authentication (authType=Simple)', () => {
        const info = { authType: 'Simple' };
        //Mock jwt.verify to return a valid decodedToken
        const a=jest.spyOn(jwt,"verify")
        a.mockImplementationOnce(()=> {
            throw Object.assign(new Error('TokenExpiredError'), { name: 'TokenExpiredError' });
        });
        a.mockReturnValue({ username: "testname", email: "test@email", role: "Regular" })

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(true);
        expect(res.locals.refreshedTokenMessage).toBe("Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls");
    });
    test('Should return false, everything is Expired', () => {
        const info = { authType: 'Simple' };
        //Mock jwt.verify to return a valid decodedToken
        const a=jest.spyOn(jwt,"verify")
        a.mockImplementation(()=> {
            throw Object.assign(new Error('TokenExpiredError'), { name: 'TokenExpiredError' });
        });

        const result = verifyAuth(req, res, info);

        //Check if the appropriate results are returned
        expect(result.authorized).toBe(false);
        expect(result.cause).toBe("Perform login again");
    });
})

describe("handleAmountFilterParams", () => {
    test('returns empty filter if no amount filter is specified', () => {
        const req = { query: {} };
        expect(handleAmountFilterParams(req)).toEqual({});
    });

    test('returns filter with $gte and $lte properties if both min and max are valid numbers', () => {
        const req = { query: { min: '0', max: '10' } };
        expect(handleAmountFilterParams(req)).toEqual({ amount: { $gte: 0, $lte: 10 } });
    });

    test('returns filter with only $gte property if min is a valid number and max is not specified', () => {
        const req = { query: { min: '5' } };
        expect(handleAmountFilterParams(req)).toEqual({ amount: { $gte: 5 } });
    });

    test('returns filter with only $lte property if max is a valid number and min is not specified', () => {
        const req = { query: { max: '10' } };
        expect(handleAmountFilterParams(req)).toEqual({ amount: { $lte: 10 } });
    });

    test('throws an error if min and max parameters are invalid', () => {
        const req = { query: { min: 'invalid', max: 'invalid' } };
        expect(() => {
            handleAmountFilterParams(req);
        }).toThrow('Invalid min and max parameters');
    });
})

describe("checkMinMaxParams", () => {
    test('returns true if both min and max are valid numbers', () => {
        expect(checkMinMaxParams(0, 10)).toBe(true);
    });

    test('returns true if min is undefined and max is a valid number', () => {
        expect(checkMinMaxParams(undefined, 10)).toBe(true);
    });

    test('returns true if min is a valid number and max is undefined', () => {
        expect(checkMinMaxParams(0, undefined)).toBe(true);
    });

    test('returns false if min is not a number', () => {
        expect(checkMinMaxParams('invalid', 10)).toBe(false);
    });

    test('returns false if max is not a number', () => {
        expect(checkMinMaxParams(0, 'invalid')).toBe(false);
    });

    test('returns false if min is negative', () => {
        expect(checkMinMaxParams(-5, 10)).toBe(false);
    });

    test('returns false if max is negative', () => {
        expect(checkMinMaxParams(0, -10)).toBe(false);
    });

    test('returns false if min is greater than max', () => {
        expect(checkMinMaxParams(15, 10)).toBe(false);
    });
})
describe('checkDate', () => {
    test('returns true for a valid date', () => {
        expect(checkDate('2021-05-29')).toBe(true);
    });

    test('returns false for an invalid date', () => {
        expect(checkDate('2021-02-30')).toBe(false);
    });

    test('returns false for an invalid date format', () => {
        expect(checkDate('29-05-2021')).toBe(false);
    });

    test('returns false for an empty date', () => {
        expect(checkDate('')).toBe(false);
    });

    test('returns false for a non-string date', () => {
        expect(checkDate(20210529)).toBe(false);
    });
});

describe('checkDateParams', () => {
    test('returns true if all parameters are valid', () => {
        expect(checkDateParams( undefined,'2021-05-01', '2021-06-30')).toBe(true);
    });

    test('returns true if only one parameter is valid', () => {
        expect(checkDateParams('2021-05-29', undefined, undefined)).toBe(true);
    });

    test('returns false if date parameter is invalid', () => {
        expect(checkDateParams('2021-02-30', undefined, undefined)).toBe(false);
    });

    test('returns false if from parameter is invalid', () => {
        expect(checkDateParams(undefined, '2021-02-30', undefined)).toBe(false);
    });

    test('returns false if upTo parameter is invalid', () => {
        expect(checkDateParams(undefined, undefined, '2021-02-30')).toBe(false);
    });

    test('returns false if date is present along with from or upTo', () => {
        expect(checkDateParams('2021-05-29', '2021-05-01', undefined)).toBe(false);
        expect(checkDateParams('2021-05-29', undefined, '2021-06-30')).toBe(false);
    });

    test('returns false if from is greater than upTo', () => {
        expect(checkDateParams(undefined, '2021-06-30', '2021-05-01')).toBe(false);
    });
});
