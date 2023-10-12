import {Group, User} from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";

/**
 * Return all the users
 - Request Body Content: None
 - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
 - Optional behavior:
 - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, {authType: "Admin"})
        if (!adminAuth.authorized) return res.status(401).json({error: adminAuth.cause});
        const users = await User.find({},{_id:0,username:1,email:1,role:1});
        res.status(200).json({data:users,refreshedTokenMessage:res.locals.refreshedTokenMessage});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

/**
 * Return information of a specific user
 - Request Body Content: None
 - Response `data` Content: An object having attributes `username`, `email` and `role`.
 - Optional behavior:
 - error 401 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
    const username = req.params.username;
    try {
        //checks if the requested user is the same as the one in the cookie
        const userAuth = verifyAuth(req, res, {authType: "User", username: username})
        if (userAuth.authorized) {
            //User auth successful
            let user=(await User.findOne({username:username},{_id:0,username:1,email:1,role:1}).exec());
            if(!user) return res.status(400).json({error:"User not found"});
            //user=user.map((a)=>({"username":a.username,"email":a.email,"role":a.role})).at(0);
            return res.status(200).json({data:user,refreshedTokenMessage:res.locals.refreshedTokenMessage});
        } else {
            const adminAuth = verifyAuth(req, res, {authType: "Admin"})
            if (adminAuth.authorized) {
                //Admin auth successful
                let user=(await User.findOne({username:username},{_id:0,username:1,email:1,role:1}).exec());
                if(!user) return res.status(400).json({error:"User not found"});
                //user=user.map((a)=>({"username":a.username,"email":a.email,"role":a.role})).at(0);
                return res.status(200).json({data:user,refreshedTokenMessage:res.locals.refreshedTokenMessage});
            } else {
                res.status(401).json({error: adminAuth.cause})
            }
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}
/**
 * Create a new group
 - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
 - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
 of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
 (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
 +does not appear in the system)
 - Optional behavior:
 - error 401 is returned if there is already an existing group with the same name
 - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
    try {
        const auth=verifyAuth(req,res,{authType:"Simple"});
        if(!auth.authorized) return res.status(401).json({error:auth.cause});
        const name = req.body.name;
        const members = req.body.memberEmails;
        if(!name || members.length===0) return res.status(400).json({error:"Missing name or members"});
        //retrieve user and check if it is already in a group
        const user= await User.findOne({refreshToken: req.cookies.refreshToken}).exec();
        if(!user) return res.status(400).json({error:"User not found"});
        const group=await Group.findOne({members: {$elemMatch: {email:user.email}}}).exec();
        if(group) return res.status(400).json({error:"User already in a group"});
        //CHECKS if the name of the group is already in use
        const existingGroup=await Group.findOne({name:name}).exec();
        if(existingGroup) return res.status(400).json({error:"Group with the same name already exists"});
        //adds the user to the members array if it is not already there
        if(!members.find((a)=>a===user.email)) members.push(user.email);

        const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/;
        for (const member of members){
            if(!emailRegex.test(member)) return res.status(400).json({error:"Invalid member email"});
        }

        const arrayOfMembers=[];
        const arrayOfAlreadyInGroup=[];
        const arrayOfMembersNotFound=[];
        let email;
        //CHECKS if all the members are in the system and not already in a group
        for (email of members){
            const user=await User.findOne({email:email}).exec();
            if(!user){
                arrayOfMembersNotFound.push(email);
                continue;
            }
            const group=await Group.findOne({members: {$elemMatch: {email:user.email}}}).exec();
            if(group){
                arrayOfAlreadyInGroup.push(email);
                continue;
            }
            arrayOfMembers.push({email: email});
        }
        //if all the body members are not in the system or already in a group, return error (1 because the user that calls the functions is excluded)
        if(arrayOfMembers.length===1) return res.status(400).json({error:"All the members are not in the system or already in a group"});
        //let newGroup= new Group({name:name,members:arrayOfMembers});
        let newGroup = await Group.create({name:name,members:arrayOfMembers})
        const result= await newGroup.save();
        //console.log(newGroup);
        //newGroup.save().then((r) => console.log(r)).catch((e) => console.log(e));
        return res.status(200).json({data:{group:{name: name, members: arrayOfMembers},alreadyInGroup:arrayOfAlreadyInGroup,membersNotFound:arrayOfMembersNotFound},refreshedTokenMessage:res.locals.refreshedTokenMessage});
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

/**
 * Return all the groups
 - Request Body Content: None
 - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
 and an array for the `members` of the group
 - Optional behavior:
 - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
    try {
        const auth=verifyAuth(req,res,{authType:"Admin"});
        if(!auth.authorized) return res.status(401).json({error:auth.cause});
        const groups = await Group.find({}, {_id: 0, name: 1, members: 1}).exec();
        return res.status(200).json({data:groups.map((g) => ({
                name: g.name, members: g.members.map((m) => ({email: m.email}))
            })),refreshedTokenMessage:res.locals.refreshedTokenMessage});
    } catch (err) {
        res.status(500).json({error: err.message})
    }
}

/**
 * Return information of a specific group
 - Request Body Content: None
 - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the
 `members` of the group
 - Optional behavior:
 - error 401 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
    try {
        const cookies= req.cookies
        const name = req.params.name
        const group=(await Group.findOne({name:name}, {_id: 0, __v: 0 }).exec());
        if(!group) return res.status(400).json({error:"Group doesn't exist"});
        const auth=verifyAuth(req,res,{authType:"Group",emails:group.members.map((m)=>m.email)});
        if(!auth.authorized) {
            const authAdmin=verifyAuth(req,res,{authType:"Admin"});
            if(!authAdmin.authorized) return res.status(401).json({error:"User is not an admin"});
        }
        const user=await User.findOne({refreshToken: cookies.refreshToken}).exec();
        if(!user) return res.status(401).json({error:"User not found"});
        return res.status(200).json({data: {name: group.name, members: group.members.map((m) => ({email: m.email}))}, refreshedTokenMessage:res.locals.refreshedTokenMessage});
    } catch (err) {
        return res.status(500).json({error: err.message})
    }
}

/**
 * Add new members to a group
 - Request Body Content: An array of strings containing the emails of the members to add to the group
 - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
 created group and an array for the `members` of the group, this array must include the new members as well as the old ones),
 an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists
 the `membersNotFound` (members whose email does not appear in the system)
 - Optional behavior:
 - error 401 is returned if the group does not exist
 - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const addToGroup = async (req, res) => {
    try {
        const groupname = req.params.name;
        const memberEmails = req.body.emails;

        // checks if the group exists
        let objectiveGroup = await Group.findOne({name:groupname}).exec();
        if(!objectiveGroup) return res.status(400).json({error:"Group not found"});
        if(req.path.endsWith("/add")){
            let auth=verifyAuth(req,res,{authType:"Group",emails:objectiveGroup.members.map((m)=>m.email)});
            if(!auth.authorized) return res.status(401).json({error:auth.cause});
        }else{
            let auth=verifyAuth(req,res,{authType:"Admin"});
            if(!auth.authorized) return res.status(401).json({error:auth.cause});
        }

        //check for parameters
        if(!memberEmails) return res.status(400).json({error:"Missing parameters"});
        // checks if the user exists and is authenticated

        const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/;
        for (const member of memberEmails){
            if(!emailRegex.test(member)) return res.status(400).json({error:"Invalid member email"});
        }

        // checks if all the members are in the system and not already in a group
        let alreadyInGroup = [];
        let membersNotFound = [];
        let membersToAdd = [];
        let email;

        for (email of memberEmails){
            let user = await User.findOne({email:email}).exec();
            if(!user){
                membersNotFound.push(email);
                continue;
            }

            let group = await Group.findOne({members: {$elemMatch: {email:user.email}}}).exec();
            if(group){
                alreadyInGroup.push(email);
                continue;
            }

            membersToAdd.push({email:email}); //user: user
        }

        // results
        if(!membersToAdd.length) return res.status(400).json({error:"All the members are not in the system or already in a group"});
        // !!! WE HAVE TO CHECK THE FOLLOWING TWO LINES !!! //
        //let objGroupQ = await objectiveGroup.exec();
        //const result = await objGroupQ.save();

        //objectiveGroup.members.push(...membersToAdd);
        //const result = await objectiveGroup.save();

        const result = await Group.updateOne(
            {name:groupname},
            {$push: {members: {$each: membersToAdd}}}
        );
        objectiveGroup=await Group.findOne({name:groupname}, {_id: 0, __v: 0}).exec();
        return res.status(200).json({data: {group: {name: objectiveGroup.name, members: objectiveGroup.members.map((m) => ({email: m.email}))},alreadyInGroup:alreadyInGroup,membersNotFound:membersNotFound},refreshedTokenMessage:res.locals.refreshedTokenMessage});
    } catch (err) {
        res.status(500).json(err.message)
    }
}

/**
 * Remove members from a group
 - Request Body Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
 created group and an array for the `members` of the group, this array must include only the remaining members),
 an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists
 the `membersNotFound` (members whose email does not appear in the system)
 - Optional behavior:
 - error 401 is returned if the group does not exist
 - error 401 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
    try {
        const groupname = req.params.name;
        const memberEmails = req.body.emails;

        // checks if the group exists
        let objectiveGroup = await Group.findOne({name:groupname}).exec();
        if(!objectiveGroup) return res.status(400).json({error:"Group not found"});
        if(req.path.endsWith("/remove")){
            let auth=verifyAuth(req,res,{authType:"Group",emails:objectiveGroup.members.map((m)=>m.email)});
            if(!auth.authorized) return res.status(401).json({error:auth.cause});
        }else{
            let auth=verifyAuth(req,res,{authType:"Admin"});
            if(!auth.authorized) return res.status(401).json({error:auth.cause});
        }
        //check for parameters
        if(!memberEmails) return res.status(400).json({error:"Missing member emails"});

        const emailRegex = /^[a-zA-Z0-9]+@[a-zA-Z]+\.[a-zA-Z]+$/;
        for (const member of memberEmails){
            if(!emailRegex.test(member)) return res.status(400).json({error:"Invalid member email"});
        }

        // checks if all the members are in the system and in the group
        let notInGroup = [];
        let membersNotFound = [];
        let membersToRemove = [];
        let email;

        for (email of memberEmails){
            let user = await User.findOne({email:email}).exec();
            if(!user){
                membersNotFound.push(email);
                continue;
            }

            let group = await Group.findOne({members: {$elemMatch: {email:user.email}}}).exec();
            if(!group || group.name !== groupname){
                notInGroup.push(email);
                continue;
            }

            membersToRemove.push(email);
        }

        // results
        if(!membersToRemove.length) return res.status(400).json({error:"All the members are not in the system or not in the group"});
        if(objectiveGroup.members.length === membersToRemove.length){
            if(objectiveGroup.members.length === 1){
                return res.status(400).json({error:"You cannot remove all the members from a group"});
            }
            membersToRemove=membersToRemove.slice(1);
        }
        const result = await Group.findOneAndUpdate(
            {name:groupname},
            {$pull: {members: {email:{$in:membersToRemove}}}},
            {new:true}
        ).exec()
        return res.status(200).json({data:{group: {name: result.name, members: result.members.map((m) => ({email: m.email}))},notInGroup:notInGroup,membersNotFound:membersNotFound},refreshedTokenMessage:res.locals.refreshedTokenMessage});
    } catch (err) {
        res.status(500).json(err.message)
    }
}

/**
 * Delete a user
 - Request Parameters: None
 - Request Body Content: A string equal to the `email` of the user to be deleted
 - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
 specifies whether the user was also `deletedFromGroup` or not.
 - Optional behavior:
 - error 401 is returned if the user does not exist
 */
export const deleteUser = async (req, res) => {
    try {
        //checking for permissions
        const cookies = req.cookies
        const adminAuth= verifyAuth(req, res, {authType: "Admin"})
        if (!adminAuth.authorized)
            return res.status(401).json({error: adminAuth.cause})

        //check for parameters
        if(!req.body.email) return res.status(400).json({error:"Missing email"});
        // checks if the user exists and is not an admin
        const existingUser = await User.findOne({email:req.body.email}).exec()
        if(!existingUser) return res.status(400).json({error:"User not found"});
        if(existingUser.role.toString()==="Admin") return res.status(400).json({error:"Admins cannot be deleted"});

        //variables
        let groupBoolean=false; //used for checking if the user was in a group

        //delete the user from all the groups and set groupBoolean to true if the user was in a group
        const existingGroup=await Group.findOne({members: {$elemMatch: {email:existingUser.email}}}).exec();
        if(existingGroup){
            groupBoolean=true;
            const count=existingGroup.members.length;
            if(count===1) {
                await Group.deleteOne({name: existingGroup.name});
            }else{
                await Group.updateOne({name:existingGroup.name},{$pull:{members:{email:existingUser.email}}});
            }
        }
        //delete all the transactions and set retValue to the number of deleted transactions
        let retValue=await transactions.deleteMany({username:existingUser.username}).exec();
        retValue=retValue.deletedCount;

        //delete the user
        await User.deleteOne({username:existingUser.username});
        return res.status(200).json({data:{deletedTransactions:retValue,deletedFromGroup:groupBoolean},refreshedTokenMessage:res.locals.refreshedTokenMessage});
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}

/**
 * Delete a group
 - Request Body Content: A string equal to the `name` of the group to be deleted
 - Response `data` Content: A message confirming successful deletion
 - Optional behavior:
 - error 401 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
    try {
        // checking for permissions
        const cookie = req.cookies
        if(!req.body.name) return res.status(400).json({error:"Missing group name"});
        // retrieve the group
        const name = req.body.name;
        const group = await Group.findOne({name:name}).exec();
        if(!group) return res.status(400).json({error:"Group not found"});
        const adminAuth = verifyAuth(req, res, {authType: "Admin"})
        if (!adminAuth.authorized)
            return  res.status(401).json({error: adminAuth.cause})
        await Group.deleteOne({name:name});
        return res.status(200).json({data: {message:"Group deleted"},refreshedTokenMessage:res.locals.refreshedTokenMessage});
    } catch (err) {
        res.status(500).json({error:err.message})
    }
}