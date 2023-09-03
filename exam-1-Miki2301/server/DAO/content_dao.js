'use strict'
const {Page,Content}=require('../Block.js');
const sqlite=require('sqlite3');
const dayjs = require("dayjs");
const db=new sqlite.Database('database.db', (err) => {
    if(err) throw err;
});

function getContentsByPageId(pageId){
    return new Promise((resolve, reject) => {
        const sql1='SELECT * FROM Contents WHERE pageId=?';
        db.all(sql1, [pageId], (err, rows) => {
            if(err) reject(err);
            else{
                resolve(rows.map(row => new Content(row.contentId, row.type, row.content, row.position, row.pageId)));
            }
        })
    })
}

function getContentById(contentId){
    return new Promise((resolve, reject) => {
        const sql1='SELECT * FROM Contents WHERE contentId=?';
        db.get(sql1, [contentId], (err, row) => {
            if(err) reject(err);
            else{
                resolve(new Content(row.contentId, row.type, row.content, row.position, row.pageId));
            }
        })
    })
}

function updateContentById(contentId, type, content){
    return new Promise((resolve, reject) => {
        const sql='UPDATE Contents SET type=?, content=? WHERE contentId=?';
        db.run(sql,[type, content, contentId], function (err) {
            if(err) reject(err);
            else{
                if(this.changes===0){
                    resolve({success:false,message: "Content not found", contentId: contentId});
                }else{
                    resolve({success:true,message: "Content updated", contentId: contentId});
                }
            }
        })
    })
}

function createContent(pageId, type, content, position){
    return new Promise((resolve, reject) => {
        const sql='INSERT INTO Contents(pageId, type, content, position) VALUES(?,?,?,?)';
        db.run(sql,[pageId, type, content, position], function (err){
            if(err) reject(err);
            else resolve({success:true,message: "Content created", contentId: this.lastID});
        })
    })
}

function deleteContentById(contentId){
    return new Promise((resolve, reject) => {
        const sql='DELETE FROM Contents WHERE contentId=?';
        db.run(sql,[contentId], function (err) {
            if(err) reject(err);
            else{
                if(this.changes===0){
                    resolve({success:false,message: "Content not found", contentId: contentId});
                }else{
                    resolve({success:true,message: "Content deleted", contentId: contentId});
                }
            }
        })
    })
}

function deleteContentByPageId(pageId){
    return new Promise((resolve, reject) => {
        const sql='DELETE FROM Contents WHERE pageId=?';
        db.run(sql,[pageId], function (err) {
            if(err) reject(err);
            else{
                if(this.changes===0){
                    resolve({success:false,message: "Content not found", pageId: pageId});
                }else{
                    resolve({success:true,message: "Content deleted", pageId: pageId});
                }
            }
        })
    })
}

async function swapPosition(contentId1, contentId2) {
    try{
        let pos1 = await getPosition(contentId1);
        let pos2 = await getPosition(contentId2);
        await setPosition(contentId1, pos2);
        await setPosition(contentId2, pos1);
        return {success:true,message: "Content swapped", contentId1: contentId1, contentId2: contentId2};
    }catch (err){
        return {success:false,message: "Content not found", contentId1: contentId1, contentId2: contentId2};
    }
}

function getPosition(contentId){
    return new Promise((resolve, reject) => {
        const sql1='SELECT position FROM Contents WHERE contentId=?';
        db.get(sql1, [contentId], (err, row) => {
            if(err) reject(err);
            else{
                resolve(row.position);
            }
        })
    })
}
function setPosition(contentId, position){
    return new Promise((resolve, reject) => {
        const sql='UPDATE Contents SET position=? WHERE contentId=?';
        db.run(sql,[position, contentId], function (err) {
            if(err) reject(err);
            else{
                if(this.changes===0){
                    resolve({success:false,message: "Content not found", contentId: contentId});
                }else{
                    resolve({success:true,message: "Content updated", contentId: contentId});
                }
            }
        })
    })
}
module.exports={getContentsByPageId, updateContentById, createContent, deleteContentById, deleteContentByPageId, getContentById, swapPosition};