'use strict'
const {Page,Content}=require('../Block.js');
const sqlite=require('sqlite3');
const dayjs = require("dayjs");
const db=new sqlite.Database('database.db', (err) => {
    if(err) throw err;
});

function setWebsiteTitle(title){
    return new Promise((resolve, reject) => {
        const sql='UPDATE Settings SET settingValue=? WHERE settingName="websiteTitle"';
        db.run(sql,[title], function (err) {
            if(err) reject(err);
            else{
                if(this.changes===0){
                    resolve({success:false,message: "Setting not found", key: "websiteTitle"});
                }else{
                    resolve({success:true,message: "Setting updated", key: "websiteTitle"});
                }
            }
        })
    })
}

function getWebsiteTitle(title){
    return new Promise((resolve, reject) => {
        const sql='SELECT settingValue FROM Settings WHERE settingName="websiteTitle"';
        db.get(sql,[], function (err,row) {
            if(err) reject(err);
            else{
                if(row){
                    resolve({success:true,message: "Setting found", key: "websiteTitle", value: row.settingValue});
                }else{
                    resolve({success:false,message: "Setting not found", key: "websiteTitle"});
                }
            }
        })
    })
}
module.exports={setWebsiteTitle,getWebsiteTitle};