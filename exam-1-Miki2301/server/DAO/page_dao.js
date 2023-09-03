'use strict'
const {Page,Content}=require('../Block.js');
const sqlite=require('sqlite3');
const dayjs = require("dayjs");
const db=new sqlite.Database('database.db', (err) => {
    if(err) throw err;
});
const content_dao=require('./content_dao.js');


//TODO need to remove it?
async function getAll(){
    try {
        const pages=await getAllPages();
        for (const page of pages) {
            page.contents=await content_dao.getContentsByPageId(page.pageId);
        }
        return pages;
    } catch (e) {
        throw e;
    }
}

async function getPageById(pageId){
    return new Promise((resolve, reject) => {
        const sql="SELECT * FROM Pages,Users WHERE pageId=? AND Pages.author=Users.userId";
        db.get(sql,[pageId], (err, row) => {
            if(err) reject(err);
            else{
                if(row===undefined){
                    resolve(undefined);
                }else{
                    resolve(new Page(row.pageId, row.title, row.author, row.creationDate, row.publicationDate,row.email));
                }
            }
        })
    })
}


function getAllPages(){
    return new Promise((resolve, reject) => {
        const now=dayjs().format('YYYY-MM-DD');
        const sql='SELECT * FROM Pages,Users WHERE Pages.author=Users.userId';
        db.all(sql,(err, rows) => {
            if(err) reject(err);
            else{
                resolve(rows.map(row => new Page(row.pageId, row.title, row.author, row.creationDate, row.publicationDate, row.email)));
            }
        })
    })
}

function updatePage(pageId, title, publicationDate){
    return new Promise((resolve, reject) => {
        const sql='UPDATE Pages SET title=?, publicationDate=? WHERE pageId=?';
        db.run(sql,[title, publicationDate, pageId], function (err) {
            if(err) reject(err);
            else{
                if(this.changes===0){
                    resolve({success:false,message: "Page not found", pageId: pageId});
                }else{
                    resolve({success:true,message: "Page updated", pageId: pageId});
                }
            }
        })
    })
}

function createPage(title, author, publicationDate){
    return new Promise((resolve, reject) => {
        const sql='INSERT INTO Pages(title, author, publicationDate) VALUES(?,?,?)';
        db.run(sql,[title, author, publicationDate], function (err){
            if(err) reject(err);
            else resolve({message: "Page created", pageId: this.lastID});
        })
    })
}

function deletePage(pageId){
    return new Promise((resolve, reject) => {
        const sql='DELETE FROM Pages WHERE pageId=?';
        db.run(sql,[pageId], function (err) {
            if(err) reject(err);
            else{
                if(this.changes===0){
                    resolve({success:false,message: "Page not found", pageId: pageId});
                }else{
                    resolve({success:true,message: "Page deleted", pageId: pageId});
                }
            }
        })
    })
}

function updateAuthor(pageId, author){
    return new Promise((resolve, reject) => {
        const sql='UPDATE Pages SET author=? WHERE pageId=?';
        db.run(sql,[author, pageId], function (err) {
            if(err) reject(err);
            else{
                if(this.changes===0){
                    resolve({success:false,message: "Page not found", pageId: pageId});
                }else{
                    resolve({success:true,message: "Page updated", pageId: pageId});
                }
            }
        })
    })
}
module.exports={getAll,createPage,updatePage,deletePage,updateAuthor,getPageById,getAllPages};