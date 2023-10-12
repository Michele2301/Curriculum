import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, {authType:"Admin"});
        if (!adminAuth.authorized) return res.status(401).json({error: adminAuth.cause});
        let type = req.body&&req.body.type;
        let color = req.body&&req.body.color
        if (!type || !color) return res.status(400).json({error: "Missing required fields"});
        if(!type.trim()||!color.trim()) return res.status(400).json({error: "Missing required fields"});
        let category = await categories.findOne({type: type});
        if (category) return res.status(400).json({error: "Category already exists"});
        const new_categories = new categories({type, color});
        const data=await new_categories.save()
        return res.status(200).json({data:{type:type,color:color},refreshedTokenMessage:res.locals.refreshedTokenMessage});
    }catch (err) {
        res.status(500).json({error: err.message});
    }
}

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 401 returned if the specified category does not exist
    - error 401 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
    try {
        const auth=verifyAuth(req,res,{authType:"Admin"});
        if(!auth.authorized) return res.status(401).json({error:auth.cause});
        const type = req.params.type;
        const new_type= req.body&&req.body.type;
        const new_color = req.body&&req.body.color;
        if (!new_type || !new_color) {
            return res.status(400).json({ error: "Missing required fields" }) // unauthorized
        }
        if(!new_type.trim()||!new_color.trim()) return res.status(400).json({error: "Missing required fields"});

        let cat = await categories.findOne({ type: type });
        if (!cat) {
            return res.status(400).json({ error: "Category not found" }) // unauthorized
        }

        let new_cat = await categories.findOne({ type: new_type });
        if (new_cat) {
            return res.status(400).json({ error: "New category already exists" }) // unauthorized
        }

        const result = await categories.findOneAndUpdate(
            { type: type },
            { type: new_type,color: new_color},
            { new: true }
        );
        const count = (await transactions.updateMany({ type: type }, { type: new_type })).modifiedCount;
        return res.status(200).json({ data: { message: "Category edited successfully", count: count },refreshedTokenMessage:res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 401 is returned if the specified category does not exist
 */
export const deleteCategory = async (req, res) => {
    try {
        const auth=verifyAuth(req,res,{authType:"Admin"});
        if(!auth.authorized) return res.status(401).json({error:auth.cause});
        let types = req.body.types;
        if(!types || types.length===0) return res.status(400).json({error:"Missing required fields"});
        const numberOfCategories=(await categories.find().exec()).length;
        if(numberOfCategories===1) return res.status(400).json({error:"Cannot delete all categories"});
        let t;
        for(t of types){
            if(!t||!t.trim()) return res.status(400).json({error:"Missing required fields"});
            let cat = await categories.findOne({ type: t });
            if (!cat) {
                return res.status(400).json({ error: "Category not found" }) // unauthorized
            }
        }

        // CHECK: IF IT WORKS
        let first_cat = await categories.findOne({ type: { $nin: types } },{},{'created_at':1}).exec();
        if(!first_cat) // it means it was called with all the database categories
        {
            first_cat = await categories.findOne({}, {}, {'created_at': 1}).exec();
            types=types.filter(t => t !== first_cat.type);
        }
        const count = await transactions.countDocuments({ type: { $in: types } });

        for(t of types){
            await transactions.updateMany({ type: t }, { type: first_cat.type });
            await categories.deleteOne({ type: t });
        }
        return res.status(200).json({ data: { message: "Categories deleted", count: count },refreshedTokenMessage:res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {
        const simpleAuth=verifyAuth(req,res,{authType:"Simple"});
        if(!simpleAuth.authorized) return res.status(401).json({error:simpleAuth.cause});

        let data = await categories.find({}).exec();

        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))

        return res.status(200).json({ data: filter,refreshedTokenMessage:res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 401 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
    try {
        const simpleAuth=verifyAuth(req,res,{authType:"User",username:req.params.username});
        if(!simpleAuth.authorized) return res.status(401).json({error:simpleAuth.cause});

        const { username, amount, type } = req.body;

        if(username == undefined || amount == undefined || type == undefined){
            return res.status(400).json({ error: "Missing parameters" })
        }

        if(username.trim()==="" || type.trim()===""){
            return res.status(400).json({ error: "Empty parameters" })
        }

        //check if amount is a number
        if(isNaN(amount)){
            return res.status(400).json({ error: "Amount must be a number" })
        }

        const user = req.params.username;
        const u_par = await User.findOne({ username: user })
        if(!u_par){
            return res.status(400).json({ error: "Username parameter not found" })
        }


        if(user !== username){
            return res.status(400).json({ error: "Mismatch between parameters and request" })
        }


        const u = await User.findOne({ username: username })
        const t = await categories.findOne({ type: type })
        if(!u || !t){
            return res.status(400).json({ error: "Username or category not found" })
        }

        const new_transactions = new transactions({ username, amount, type })

        new_transactions.save()
            .then(data => {
                return res.status(200).json({ data: data,refreshedTokenMessage:res.locals.refreshedTokenMessage })
            })
            .catch(err => { throw err })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        const auth=verifyAuth(req,res,{authType:"Admin"});
        if(!auth.authorized) return res.status(401).json({error:auth.cause});
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
            return res.status(200).json({ data: data,refreshedTokenMessage:res.locals.refreshedTokenMessage })
        }).catch(error => { throw (error) })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        const u_par = await User.findOne({ username: req.params.username }).exec()
        if(!u_par){
            return res.status(400).json({ error: "Username parameter not found" })
        }

        if (req.url.indexOf("/transactions/users/") >= 0) {
            //Admin
            const authAdmin=verifyAuth(req,res,{authType:"Admin"});
            if(!authAdmin.authorized) return res.status(401).json({error:authAdmin.cause});
            let matchObj = { username: req.params.username }
            let data = await transactions.aggregate([
                {
                    $match: matchObj
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" }
            ]).then((result) => {
                let data = result.map(v => Object.assign({}, { type: v.type, amount: v.amount, color: v.categories_info.color, username: v.username, date: v.date }))
                return data;
            }).catch(error => {
                throw (error)
            })
            return res.status(200).json({ data: data,refreshedTokenMessage:res.locals.refreshedTokenMessage });
        } else {
            //Regular
            const authUser=verifyAuth(req,res,{authType:"User",username:req.params.username});
            if(!authUser.authorized) return res.status(401).json({error:authUser.cause});


            //mongoDB query filters
            let amountFilter = handleAmountFilterParams(req)
            let dateFilter = handleDateFilterParams(req)
            let matchObj = { username: req.params.username }

            if (amountFilter.amount !== undefined) {
                matchObj.amount = amountFilter.amount
            }
            if (dateFilter.date !== undefined) {
                matchObj.date = dateFilter.date
            }

            //mongoDB query
            let data = await transactions.aggregate([
                {
                    $match: matchObj
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" }
            ]).then((result) => {
                let data = result.map(v => Object.assign({}, { username: v.username, type: v.type, amount: v.amount, date: v.date, color: v.categories_info.color }))
                return data;
            }).catch(error => {
                throw (error) 
            })
            return res.status(200).json({ data: data,refreshedTokenMessage:res.locals.refreshedTokenMessage });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user filtered by a specific category (OK)
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category (OK)
    - error 401 is returned if the user or the category does not exist (OK)
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        if(req.url.indexOf("/transactions/users/")>=0){
            //Admin
            const authAdmin=verifyAuth(req,res,{authType:"Admin"});
            if(!authAdmin.authorized) return res.status(401).json({error:authAdmin.cause});
        }
        else{
            //Regular
            const authUser=verifyAuth(req,res,{authType:"User",username:req.params.username});
            if(!authUser.authorized) return res.status(401).json({error:authUser.cause});
        }
        //checking if user exists
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(400).json({ error: 'Username parameter not found' });
        }

        //checking if category exists
        const category = await categories.findOne({ type: req.params.category });
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }

        /**
         * SELECT * FROM transactions, categories
         * WHERE transactions.type = categories.type
         * AND transaction.username = __req-user__
         * AND transactions.type = __req-type__
         */
        let result = await transactions.aggregate([
            {
                $match: {
                    type: req.params.category,
                    username: req.params.username
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ])
        let data = result.map(v => Object.assign({}, { _id: v._id, username: v.username, amount: v.amount, type: v.type, color: v.categories_info.color, date: v.date }))

        return res.status(200).json({ data: data,refreshedTokenMessage:res.locals.refreshedTokenMessage })
        

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by members of a specific group (OK)
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 401 is returned if the group does not exist (OK)
    - empty array must be returned if there are no transactions made by the group (OK)
 */
export const getTransactionsByGroup = async (req, res) => {
    try {
        //authentication
        const groupname = req.params.name;
        let user;
        // checks if the group exists
        let objectiveGroup = await Group.findOne({name:groupname}).exec();
        if(!objectiveGroup) return res.status(400).json({error:"Group not found"});

        //distinguish the routes admin from group
        if(req.url.indexOf("/transactions/groups/")>=0){
            //Admin
            const authAdmin=verifyAuth(req,res,{authType:"Admin"});
            if(!authAdmin.authorized) return res.status(401).json({error:authAdmin.cause});
        }else{
            //Group
            const authGroup=verifyAuth(req,res,{authType:"Group",emails:objectiveGroup.members.map(member => member.email)});
            if(!authGroup.authorized) return res.status(401).json({error:authGroup.cause});
        }

        const emails = objectiveGroup.members.map(member => member.email);

        /**
         * SELECT username, type, amount, date, color FROM transactions, categories,
         * WHERE transactions.type = categories.type
         * AND transactions.username = users.username
         */
        let data = await transactions.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "username",
                    foreignField: "username",
                    as: "users_info"
                }
            },
            { $unwind: "$users_info" },
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" },
            { $project: {_id:0, username:1, type:1, amount:1, date:1, users_info:{email:1}, categories_info:{color:1}}}
        ])

        const filteredData = data.filter(elem => emails.includes(elem.users_info.email));
        const dataProjection = filteredData.map(elem => ({
            username: elem.username,
            amount: elem.amount,
            type: elem.type,
            date: elem.date,
            color: elem.categories_info.color
        }));
        return res.status(200).json({ data: dataProjection,refreshedTokenMessage:res.locals.refreshedTokenMessage })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by members of a specific group filtered by a specific category (OK)
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 401 is returned if the group or the category does not exist (OK)
    - empty array must be returned if there are no transactions made by the group with the specified category (OK)
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
        //authentication
        const groupname = req.params.name;

        // checks if the user exists and is authenticated
        let user;

        // checks if the group exists
        let objectiveGroup = await Group.findOne({name:groupname}).exec();
        if(!objectiveGroup) return res.status(400).json({error:"Group not found"});

        //distinguish the routes
        if(req.url.indexOf("/transactions/groups/")>=0){
            //admin
            let auth=verifyAuth(req,res,{authType:"Admin"})
            if(!auth.authorized) return res.status(401).json({error:auth.cause});
        }else{
            const emails=objectiveGroup.members.map((m)=>m.email);
            let auth=verifyAuth(req,res,{authType:"Group",emails:emails});
            if(!auth.authorized) return res.status(401).json({error:auth.cause});
        }

        //check if category exists and retrieve caegories list
        const categoriesList = await categories.findOne({ type: req.params.category}).exec()
        if(!categoriesList) {
            return res.status(400).json({error: "Category not found"})
        }
        const emails = objectiveGroup.members.map(member => member.email);

        /**
         * SELECT username, type, amount, date, color FROM transactions, categories,
         * WHERE transactions.type = categories.type
         * AND transactions.username = users.username
         * AND categories.type = __req-type__
         */
        let data = await transactions.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "username",
                    foreignField: "username",
                    as: "users_info"
                }
            },
            { $unwind: "$users_info" },
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" },
            { $project: {_id:0, username:1, type:1, amount:1, date:1, users_info:{email:1}, categories_info:{color:1}}}
        ]).exec();

        const filteredData = data.filter(elem => emails.includes(elem.users_info.email));
        const dataProjection = filteredData.map(elem => ({
                username: elem.username,
                amount: elem.amount,
                type: elem.type,
                date: elem.date,
                color: elem.categories_info.color
            })).filter(elem => elem.type === req.params.category );
        return res.status(200).json({ data: dataProjection,refreshedTokenMessage:res.locals.refreshedTokenMessage })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 401 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
    try {
        let username=req.params.username;
        //check if user exists
        let user = await User.findOne({username:username}).exec();
        if(!user) return res.status(400).json({error:"User not found"});

        const authUser=verifyAuth(req,res,{authType:"User",username:username});
        if(!authUser.authorized){
            const authAdmin=verifyAuth(req,res,{authType:"Admin"});
            if(!authAdmin.authorized) return res.status(401).json({error:authAdmin.cause});
        }

        //check if id to delete is in the request body
        if(!req.body._id) return res.status(400).json({error:"Missing _id in request body"});

        //check if transaction exists
        let transaction = await transactions.find({_id:req.body._id});

        if(transaction.length == 0) return res.status(400).json({error:"Transaction not found"});

        if(transaction[0].username != username) return res.status(400).json({error:"Cannot delete transaction of another user"})

        let data = await transactions.deleteOne({ _id: req.body._id });
        return res.status(200).json({ data: {message:"Transaction deleted"},refreshedTokenMessage:res.locals.refreshedTokenMessage })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


/**
 * Delete multiple transactions identified by their ids (OK)
 - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
 - Response `data` Content: A message confirming successful deletion (OK)
 - Optional behavior:
 - error 401 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case (OK)
 */
export const deleteTransactions = async (req, res) => {
    try {
        //checking access token
        const authAdmin = verifyAuth(req, res, { authType: "Admin" })
        if(!authAdmin.authorized) return res.status(401).json({error:authAdmin.cause});

        //making sure all transactions to be deleted are present
        const ids = req.body._ids

        if (!ids) {
            return res.status(400).json({ error: 'Missing transactions in request body' });
        }

        if (ids.some(id => id === '')) {
            return res.status(400).json({ error: 'One or more ids are empty strings' });
        }

        const transactions_found = await transactions.find({ _id: { $in: ids } });
        if (transactions_found.length !== ids.length) {
            return res.status(400).json({ error: 'One or more transactions not found' });
        }

        //if all transactions are present then delete them
        let result = await transactions.deleteMany({
            _id: {
                $in: req.body._ids
            }
        })

        if(result.acknowledged == true)
            return res.status(200).json({ data: {message:"Transactions deleted"},refreshedTokenMessage:res.locals.refreshedTokenMessage })
        else
            res.status(400).json({ error: "There was a problem elaborating your request"})

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
