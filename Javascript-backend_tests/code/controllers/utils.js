 import jwt from 'jsonwebtoken'
import {Group, User} from "../models/User.js";
 import dayjs from "dayjs";

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */
export const handleDateFilterParams = (req) => {
    const {date, from, upTo} = req.query
    let dateFilter = { }

    if(!checkDateParams(date, from, upTo)){
        throw new Error("Invalid date parameters")
    }

    // date is the only parameter
    if (date) {
        return dateFilter = {date: {$gte: new Date(date+"T00:00:00.000Z"),$lte: new Date(date+"T23:59:59.999Z")}}
    }

    //from and upTo are both present
    if (from && upTo) {
        let from_date = new Date(from)
        let upTo_date = new Date(upTo)
        return dateFilter = {date: {$gte: new Date(from+"T00:00:00.000Z"), $lte: new Date(upTo+"T23:59:59.999Z")}}
    }

    // from is the only parameter
    if (from) {
        return dateFilter = {date: {$gte: new Date(from+"T00:00:00.000Z")}}
    }

    // upTo is the only parameter
    if (upTo) {
        return dateFilter = {date: {$lte: new Date(upTo+"T23:59:59.999Z")}}
    }

    // no date filtering parameters are present, return empty filter
    return dateFilter
}

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *          additional params in info: "username" for the username
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *          additional params in info: None
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *          additional params in info: "emails", an array of emails of the group members
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */
export const verifyAuth = (req, res, info) => {
    const cookie = req.cookies
    if (!cookie.accessToken || !cookie.refreshToken) {
        return { authorized: false, cause: "Unauthorized" };
    }
    try {
        const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
        const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);
        if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
            return { authorized: false, cause: "Token is missing information" }
        }
        if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
            return { authorized: false, cause: "Token is missing information" }
        }
        if (decodedAccessToken.username !== decodedRefreshToken.username || decodedAccessToken.email !== decodedRefreshToken.email || decodedAccessToken.role !== decodedRefreshToken.role) {
            return { authorized: false, cause: "Mismatched users" };
        }
        switch (info.authType) {
            case "User":
                if (decodedRefreshToken.username !== info.username) {
                    return { authorized: false, cause: "Mismatched users" };
                }
                break;
            case "Admin":
                if (decodedRefreshToken.role !== "Admin") {
                    return { authorized: false, cause: "User is not an admin" };
                }
                break;
            case "Group":
                const filteredEmails=info.emails.find(email=>email===decodedRefreshToken.email);
                if(!filteredEmails){
                    return { authorized: false, cause: "Group doesn't contain that email" };
                }
                break;
            case "Simple":
                break;
            default:
                return { authorized: false, cause: "Unknown auth type" };
        }
        return { authorized: true }
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            try {
                const refreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY)
                const newAccessToken = jwt.sign({
                    username: refreshToken.username,
                    email: refreshToken.email,
                    id: refreshToken.id,
                    role: refreshToken.role
                }, process.env.ACCESS_KEY, { expiresIn: '1h' })
                res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true })
                res.locals.refreshedTokenMessage= 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
                switch (info.authType) {
                    case "User":
                        if (refreshToken.username !== info.username) {
                            return { authorized: false, cause: "Mismatched users" };
                        }
                        break;
                    case "Admin":
                        if (refreshToken.role !== "Admin") {
                            return { authorized: false, cause: "Mismatched users" };
                        }
                        break;
                    case "Group":
                        if(!info.emails.includes(refreshToken.email)){
                            return { authorized: false, cause: "Group doesn't contain that email" };
                        }
                        break;
                    case "Simple":
                        break;
                    default:
                        return { authorized: false, cause: "Unknown auth type" };
                }
                return { authorized: true }
            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    return { authorized: false, cause: "Perform login again" }
                } else {
                    return { authorized: false, cause: err.name }
                }
            }
        } else {
            return { authorized: false, cause: err.name };
        }
    }
}

/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */
export const handleAmountFilterParams = (req) => {

    const minSTR = req.query.min
    const maxSTR = req.query.max
    //if query parameters are empty do not check

    if(Object.keys(req.query).length != 0) {
        let checkAmountFlag = checkMinMaxParams(minSTR, maxSTR)
        if(!checkAmountFlag){
            throw new Error(`Invalid min and max parameters`)
        }
    }

    const min = parseFloat(minSTR)
    const max = parseFloat(maxSTR)

    let amountFilter = {}

    if ((min && max)) {
        amountFilter = {amount:{$gte: min, $lte: max}}
        return amountFilter
    }
    if ((min == 0 && max)) {
        amountFilter = {amount:{$gte: min, $lte: max}}
        return amountFilter
    }
    if ((max == 0 && min)) {
        amountFilter = {amount:{$gte: min, $lte: max}}
        return amountFilter
    }
    if (min && !max) {
        amountFilter = {amount: {$gte: min}}
        return amountFilter
    }
    if (!min && max) {
        amountFilter = {amount: {$lte: max}}
        return amountFilter
    }

    return amountFilter 

    //returns empty filter if no amount filter is specified
}

export function checkDate(date){
    try{
        //checking date, if they are not equal return false
        const year = parseInt(date.substring(0,4));
        const month = parseInt(date.substring(5,7));
        const day = parseInt(date.substring(8,10));
        const date_type = dayjs(date)//month is 0-based
        const mon = date_type.month()+1;
        const d = date_type.date();
        const y = date_type.year();
        if(mon == month && d == day && y == year)
            return true;
        else
            return false;

    } catch {
        //for any other error return false
        return false;
    }
}

export function checkDateParams(date, from, upTo){
    if(date && !checkDate(date)) {
        //if date is present and is not valid
        return false;
    }

    if(from && !checkDate(from)) {
        //if from is present and is not valid
        return false;
    }

    if(upTo && !checkDate(upTo)) {
        //if upTo is present and is not valid
        return false;
    }

    if (date && (from || upTo)) {
        //if date is present and from or upTo are present
        return false;
    }

    if (from && upTo) {
        //if from and upTo are present and from is greater than upTo
        let date_from = new Date(from);
        let date_upTo = new Date(upTo);
        if(date_from > date_upTo)
            return false;
    }

    return true;

}

export function checkMinMaxParams(min, max){

    if((min == undefined) && !isNaN(max)){
        return true;
    }

    if((max == undefined) && !isNaN(min)){
        return true;
    }

    if(isNaN(min) && min != undefined){
        return false;
    }

    if(isNaN(max) && max != undefined){
        return false;
    }

    if(max < 0){
        return false;
    }

    if(min < 0){
        return false;
    }

    if((parseFloat(min) > parseFloat(max)) && (!isNaN(min) && !isNaN(max))){
        return false;
    }

    return true;
}