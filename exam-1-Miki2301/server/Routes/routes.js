'use strict'

const Router=require('express');
const router=Router.Router();
const {check, validationResult} = require("express-validator");
const dayjs = require("dayjs");
//AUTHENTICATION
const checkLogin=(req,res)=>{
    if (!req.isAuthenticated()) {
        return {success: false};
    }
    if(req.user.role==='admin'){
        return {success: true, role: req.user.role};
    }
    return {success: true, role: req.user.role};
}



//DAO
const content_dao=require('../DAO/content_dao.js');
const page_dao=require('../DAO/page_dao.js');
const user_dao=require('../DAO/user_dao.js');
const setting_dao=require('../DAO/setting_dao.js');

//ROUTES
router.get('/frontOffice', async (req, res) => {
    try {
        let pages=await page_dao.getAllPages();
        pages=pages.filter(page => page.publicationDate&&page.publicationDate.isBefore(dayjs())).map(page => {
            return {
                ...page,
                publicationDate: page.publicationDate.format('YYYY-MM-DD'),
                creationDate: page.creationDate.format('YYYY-MM-DD')
            }
        })
        return res.status(200).json({message: 'Pages found', pages:JSON.stringify(pages)});
    } catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
});

router.get('/frontOffice/setting/getWebTitle', async (req, res) => {
    try {
        let response=await setting_dao.getWebsiteTitle();
        if (response.success){
            return res.status(200).json(response);
        }else{
            return res.status(404).json(response);
        }
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
})


//return the page with frontOffice constraints and all the contents of the page
router.get('/frontOffice/page/:pageId/content', async (req, res) => {
    try {
        let page = await page_dao.getPageById(req.params.pageId);
        if (!page) {
            return res.status(404).json({message: 'Page not found'});
        }
        if (!page.publicationDate || page.publicationDate.isAfter(dayjs())) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        let response = await content_dao.getContentsByPageId(req.params.pageId);
        return res.status(200).json({page: page, content: response});
    } catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
});

//BACKOFFICE
router.get('/backOffice', async (req, res) => {
    try {
        let auth=checkLogin(req,res);
        if(!auth.success){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let pages=await page_dao.getAllPages();
        pages=pages.map(page => {
            return {
                ...page,
                publicationDate: page.publicationDate&&page.publicationDate.format('YYYY-MM-DD'),
                creationDate: page.creationDate&&page.creationDate.format('YYYY-MM-DD')
            }
        })
        return res.status(200).json({message: 'Pages found', pages:JSON.stringify(pages)});
    } catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
});

//PAGES

router.get('/backOffice/page/:pageId', async (req, res) => {
    try {
        let pages=await page_dao.getPageById(req.params.pageId);
        if(!pages){
            return res.status(404).json({message: 'Page not found'});
        }
        if(!(pages.publicationDate)||pages.publicationDate.isAfter(dayjs())){
            let auth=checkLogin(req,res);
            if(!auth.success){
                return res.status(401).json({message: 'Unauthorized'});
            }
        }
        return res.status(200).json({message: 'Pages found', pages:pages});
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
});


//create a page with all the constraints required


const schema=[
    check('page.title').isString().trim().isLength({min:1}).withMessage('Title must be a string'),
    check('page.publicationDate').isString().withMessage('Publication date must be a string'),
    check('contents').exists().withMessage('Contents must exists'),
]
function checkSchema(req) {
    const errors = validationResult(req);
    // if there is error then return Error
    if (!errors.isEmpty()) {
        return {success: false, errors: errors.array().map(err => err.msg)};
    }
    return {success: true};
}

router.post('/backOffice/page',...schema, async (req, res) => {
    //this function needs to have a huge JSON with content and pages together as an input
    if(checkSchema(req).success===false){
        return res.status(400).json({message: 'Bad request', errors: checkSchema(req).errors});
    }
    let auth=checkLogin(req,res);
    if(!auth.success){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        //new page
        let title=req.body.page.title;
        let publicationDate=req.body.page.publicationDate;
        let contents=req.body.contents;
        if(!title||!contents||contents.length<2){
            return res.status(400).json({message: 'Bad request'});
        }
        if(publicationDate){
            let pubDate=dayjs(publicationDate);
            if(!pubDate.isValid()||pubDate.isBefore(dayjs(),'day')){
                return res.status(400).json({message: 'Date must be a valid date and after or equal today'});
            }
        }
        let header=0;
        let block=0;
        for (let i of contents){
            if(i.type!="header"&&i.type!="paragraph"&&i.type!="image"){
                return res.status(400).json({message: 'Bad request'});
            }
            if(i.type=="header"||i.type=="paragraph"){
                if(i.content.trim().length==0){
                    return res.status(400).json({message: 'Bad request'});
                }
            }
            if(i.type=="image"){
                if(i.content!="image1"&&i.content!="image2"&&i.content!="image3"&&i.content!="image4"){
                    return res.status(400).json({message: 'Wrong image name'});
                }
            }
            if(i.type=="header"){
                header++;
            }
            if(i.type!="header"){
                block++;
            }
        }
        if(header==0||block==0){
            return res.status(400).json({message: 'Bad request'});
        }
        let response=await page_dao.createPage(title,req.user.userId, publicationDate);
        response=response.pageId;
        let position=1;
        for (let content of contents){
            await content_dao.createContent(response, content.type, content.content, position);
            position++;
        }
        return res.status(200).json({message: 'Page created', pageId: response});
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }

});

const schema1=[
    check('title').isString().trim().isLength({min:1}).withMessage('Title must be a string'),
    check('publicationDate').isString().withMessage('Publication date must be a date or null'),
]
router.put('/backOffice/page/:pageId',...schema1, async (req, res) => {
    if(checkSchema(req).success===false){
        return res.status(400).json({message: 'Bad request', errors: checkSchema(req).errors});
    }
    //update page
    let auth=checkLogin(req,res);
    if(!auth.success){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        let page=await page_dao.getPageById(req.params.pageId);
        if(!page){
            return res.status(404).json({message: 'Page not found'});
        }
        if(req.body.publicationDate&&req.body.publicationDate!=page.publicationDate.format('YYYY-MM-DD')){
            let date=dayjs(req.body.publicationDate);
            if(!date.isValid()||date.isBefore(dayjs(),'day')){
                return res.status(400).json({message: 'Date must be a valid date and after or equal today'});
            }
        }
        if(req.user.role!=='admin'&&req.user.userId!==page.author){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let response=await page_dao.updatePage(req.params.pageId,req.body.title, req.body.publicationDate);
        if (response.success){
            return res.status(200).json(response);
        }else{
            return res.status(404).json(response);
        }
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
});


//deletes a page with all the contents
router.delete('/backOffice/page/:pageId', async (req, res) => {
    let auth=checkLogin(req,res);
    if(!auth.success){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        let page=await page_dao.getPageById(req.params.pageId);
        if(!page){
            return res.status(404).json({message: 'Page not found'});
        }
        if(req.user.role!=='admin'&&req.user.userId!==page.author){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let responseContent=await content_dao.deleteContentByPageId(parseInt(req.params.pageId));
        if(!responseContent.success){
            return res.status(404).json(responseContent);
        }
        let response=await page_dao.deletePage(req.params.pageId);
        if (response.success){
            return res.status(200).json(response);
        }else{
            return res.status(404).json(response);
        }
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
});

const schema2=[
    check('authorEmail').isEmail().withMessage('Author email must be an email'),
    ]
router.put('/backOffice/page/:pageId/author',...schema2, async (req, res) => {
    if(checkSchema(req).success===false){
        return res.status(400).json({message: 'Bad request', errors: checkSchema(req).errors});
    }
    let auth=checkLogin(req,res);
    if(!auth.success){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        if(req.user.role!=='admin'){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let author=await user_dao.getUserIdByEmail(req.body.authorEmail);
        if(!author){
            return res.status(404).json({message: 'Author not found'});
        }
        let response=await page_dao.updateAuthor(req.params.pageId,author);
        if (response.success){
            return res.status(200).json(response);
        }else{
            return res.status(404).json(response);
        }
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
})

//SETTINGS

const schema3=[
check('title').isString().trim().isLength({min:1}).withMessage('Title must be at least 1 char long'),
    ]
router.put('/backOffice/setting/setWebTitle', ...schema3,async (req, res) => {
    if(checkSchema(req).success===false){
        return res.status(400).json({message: 'Bad request', errors: checkSchema(req).errors});
    }
    let auth=checkLogin(req,res);
    if(!auth.success){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        if(req.user.role!=='admin'){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let response=await setting_dao.setWebsiteTitle(req.body.title);
        if (response.success){
            return res.status(200).json(response);
        }else{
            return res.status(404).json(response);
        }
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
});

//CONTENT - no admin required
//return the page with backOffice constraints and all the contents of the page

const schema4=[
    check('contentId1').isInt().withMessage('ContentId1 must be an integer'),
    check('contentId2').isInt().withMessage('ContentId2 must be an integer'),
]
router.put('/backOffice/page/:pageId/content/position',...schema4,async (req, res) => {
    if(checkSchema(req).success===false){
        return res.status(400).json({message: 'Bad request', errors: checkSchema(req).errors});
    }
    try{
        let auth=checkLogin(req,res);
        if(!auth.success){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let page=await page_dao.getPageById(req.params.pageId);
        if(!page){
            return res.status(404).json({message: 'Page not found'});
        }
        if(req.user.role!=='admin'&&req.user.userId!==page.author){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let contents=await content_dao.getContentById(req.body.contentId1);
        let contents2=await content_dao.getContentById(req.body.contentId2);
        if(!contents||!contents2){
            return res.status(404).json({message: 'Content not found'});
        }
        if(contents.pageId!=contents2.pageId||contents.pageId!=req.params.pageId){
            return res.status(400).json({message: 'Content not found'});
        }
        await content_dao.swapPosition(contents.contentId,contents2.contentId);
        return res.status(200).json({success:true});
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
})
router.get('/backOffice/page/:pageId/content', async (req, res) => {
    try {
        let auth=checkLogin(req,res);
        if(!auth.success){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let page=await page_dao.getPageById(req.params.pageId);
        if(!page){
            return res.status(404).json({message: 'Page not found'});
        }
        let response=await content_dao.getContentsByPageId(req.params.pageId);
        return res.status(200).json({page:page,content:response});
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
})

router.get('/backOffice/page/:pageId/content/:contentId', async (req, res) => {
    try{
        let auth=checkLogin(req,res);
        if(!auth.success){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let page=await page_dao.getPageById(req.params.pageId);
        if(!page){
            return res.status(404).json({message: 'Page not found'});
        }
        if(req.user.role!=='admin'&&req.user.userId!==page.author){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let content=await content_dao.getContentById(req.params.contentId);
        if(!content){
            return res.status(404).json({message: 'Content not found'});
        }
        if(content.pageId!==page.pageId){
            return res.status(404).json({message: 'Content not found'});
        }
        return res.status(200).json(content);
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
})

const schema5=[
check('type').isString().isLength({min:1}).withMessage('Type must be at least 1 char long'),
check('content').isString().trim().isLength({min:1}).withMessage('Content must be at least 1 char long'),
    ]
router.post('/backOffice/page/:pageId/content',...schema5, async (req, res) => {
    if(checkSchema(req).success===false){
        return res.status(400).json({message: 'Bad request', errors: checkSchema(req).errors});
    }
    let auth=checkLogin(req,res);
    if(!auth.success){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        let page=await page_dao.getPageById(req.params.pageId);
        if(req.user.role!=='admin'&&req.user.userId!==page.author){
            return res.status(401).json({message: 'Unauthorized'});
        }
        if(req.body.type!=='header'&&req.body.type!=='image'&&req.body.type!=='paragraph'){
            return res.status(400).json({message: 'Invalid content type'});
        }
        if(req.body.type=='image'){
            if(req.body.content!="image1"&&req.body.content!=="image2"&&req.body.content!="image3"&&req.body.content!="image4"){
                return res.status(400).json({message: 'Invalid image'});
            }
        };
        let maxPosition=(await content_dao.getContentsByPageId(req.params.pageId)).map(c=>c.position).reduce((a,b)=>Math.max(a,b),0);
        let response=await content_dao.createContent(req.params.pageId, req.body.type, req.body.content,maxPosition+1);
        return res.status(200).json(response);
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
});

const schema6=[
    check('type').isString().isLength({min:1}).withMessage('Type must be at least 1 char long'),
    check('content').isString().trim().isLength({min:1}).withMessage('Content must be at least 1 char long'),
]
router.put('/backOffice/page/:pageId/content/:contentId',...schema6, async (req, res) => {
    if(checkSchema(req).success===false){
        return res.status(400).json({message: 'Bad request', errors: checkSchema(req).errors});
    }
    let auth=checkLogin(req,res);
    if(!auth.success){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        let page=await page_dao.getPageById(req.params.pageId);
        if(!page){
            return res.status(404).json({message: 'Page not found'});
        }
        if(req.user.role!=='admin'&&req.user.userId!==page.author){
            return res.status(401).json({message: 'Unauthorized'});
        }
        if(req.body.type!=='header'&&req.body.type!=='image'&&req.body.type!=='paragraph'){
            return res.status(400).json({message: 'Invalid content type'});
        }
        if(req.body.type=='image'){
            if(req.body.content!="image1"&&req.body.content!=="image2"&&req.body.content!="image3"&&req.body.content!="image4"){
                return res.status(400).json({message: 'Invalid image'});
            }
        };
        let contents=await content_dao.getContentsByPageId(req.params.pageId);
        contents=contents.map(c=>c.contentId==req.params.contentId?{...c,type:req.body.type,content:req.body.content}:c);
        let header=0;
        let others=0;
        for(let i of contents){
            if(i.type==='header'){
                header++;
            }else{
                others++;
            }
        }
        if(header===0||others===0){
            return res.status(400).json({message: 'Page must have at least one header and one other content'});
        }
        let response=await content_dao.updateContentById(req.params.contentId, req.body.type, req.body.content);
        if (response.success){
            return res.status(200).json(response);
        }else{
            return res.status(404).json(response);
        }
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
});

router.delete('/backOffice/page/:pageId/content/:contentId', async (req, res) => {
    let auth=checkLogin(req,res);
    if(!auth.success){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try {
        let page=await page_dao.getPageById(req.params.pageId);
        if(req.user.role!=='admin'&&req.user.userId!==page.author){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let contents=await content_dao.getContentsByPageId(req.params.pageId);
        contents=contents.filter(c=>c.contentId!=req.params.contentId);
        let header=0;
        let others=0;
        for(let i of contents){
            if(i.type==='header'){
                header++;
            }else{
                others++;
            }
        }
        if(header===0||others===0){
            return res.status(400).json({message: 'Page must have at least one header and one other content'});
        }
        let response=await content_dao.deleteContentById(req.params.contentId);
        if (response.success){
            return res.status(200).json(response);
        }else{
            return res.status(404).json(response);
        }
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
})

router.get('/backOffice/users', async (req,res)=>{
    let auth=checkLogin(req,res);
    if(!auth.success){
        return res.status(401).json({message: 'Unauthorized'});
    }
    try{
        if(req.user.role!=='admin'){
            return res.status(401).json({message: 'Unauthorized'});
        }
        let response=await user_dao.getUsers();
        return res.status(200).json(response);
    }catch (e) {
        return res.status(500).json({message: `Request failed ${e && e.message}`});
    }
})
module.exports=router;
