
const APIURL = 'http://localhost:3000/api';
import {Content, Page} from "../Block.js";

async function loginUser(username, password) {
    try {
        const response = await fetch(`${APIURL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password}),
            credentials: 'include'
        });
        if(response.ok){
            return response.json();
        }else{
            let message=await response.text();
            throw new Error('Error logging in' + message);
        }
    } catch (e) {
        throw Error('Network Error logging in'+e.message);
    }
}

async function doLogout() {
    try {
        const response = await fetch(APIURL + '/logout', {
            method: 'POST',
            credentials: 'include'
        });
        if (response.ok) {
            return true ;
        } else {
            let message=await response.text();
            throw new Error('Error logging out' + message);
        }
    } catch (error) {
        throw new Error('Network error');
    }
}

async function getUser(){
    try{
        const response=await fetch(APIURL + '/user',{
            method:'GET',
            credentials:'include'
        });
        if(response.ok){
            return response.json();
        }
        return undefined;
    }catch (e) {
        throw Error('Network Error getting user'+e.message);
    }
}

//SETTINGS

async function getTitle() {
    try {
        const title=await fetch(APIURL + '/frontOffice/setting/getWebTitle');
        if(title.ok){
            let value=await title.json();
            return value.value;
        }else {
            let message=await title.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error getting title'+e.message);
    }
}

async function setTitle(title){
    try{
        const response=await fetch(APIURL + '/backOffice/setting/setWebTitle',{
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({title}),
            credentials:'include'
        });
        if(response.ok){
            return title;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error setting title'+e.message);
    }
}

//PAGES

async function getPagesFrontOffice() {
    try {
        const response = await fetch(APIURL + '/frontOffice');
        if (response.ok) {
            let a= await response.json();
            a=JSON.parse(a.pages);
            return a.map((page) => {
                return new Page(page.pageId, page.title, page.author, page.creationDate, page.publicationDate, page.authorEmail);
            });
        } else {
            let message=await response.text();
            throw new Error('Error' + message);
        }
    } catch (e) {
        throw Error('Network Error getting pages' + e.message);
    }
}

async function getPagesBackOffice() {
    try {
        const response = await fetch(APIURL + '/backOffice',{
            method:'GET',
            credentials:'include'
        });
        if (response.ok) {
            let a= await response.json();
            a=JSON.parse(a.pages);
            return a.map((page) => {
                return new Page(page.pageId, page.title, page.author, page.creationDate, page.publicationDate, page.authorEmail);
            });
        } else {
            let message=await response.text();
            throw new Error('Error' + message);
        }
    } catch (e) {
        throw Error('Network Error getting pages' + e.message);
    }
}

async function deletePageById(pageId){
    try{
        const response=await fetch(APIURL + `/backOffice/page/${pageId}`,{
            method:'DELETE',
            headers:{
                'Content-Type':'application/json'
            },
            credentials:'include'
        });
        if(response.ok){
            return true;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error deleting page'+e.message);
    }
}

async function getContentsByIdFO(pageId){
    try{
        const response=await fetch(APIURL + `/frontOffice/page/${pageId}/content`);
        if(response.ok){
            let value=await response.json();
            let contents=value.content;
            let page=value.page;
            page=new Page(page.pageId, page.title, page.author, page.creationDate, page.publicationDate, page.authorEmail);
            contents.map((content)=>{new Content(content.contentId,content.title,content.type,content.content,content.pageId)})
            return {page,contents};
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error getting contents'+e.message);
    }
}

async function getContentsByIdBO(pageId){
    try{
        const response=await fetch(APIURL + `/backOffice/page/${pageId}/content`,{
            method:'GET',
            credentials:'include'
        });
        if(response.ok){
            let value=await response.json();
            let contents=value.content;
            let page=value.page;
            page=new Page(page.pageId, page.title, page.author, page.creationDate, page.publicationDate, page.authorEmail);
            contents.map((content)=>{new Content(content.contentId,content.title,content.type,content.content,content.pageId)})
            return {page,contents};
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error getting contents'+e.message);
    }
}

async function editPageById(pageId,title,publicationDate){
    try{
        const response=await fetch(APIURL + `/backOffice/page/${pageId}`,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({title,publicationDate}),
            credentials:'include'
        });
        if(response.ok){
            return true;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error editing page'+e.message);
    }
}

async function getPageById(pageId){
    try{
        const response=await fetch(APIURL + `/backOffice/page/${pageId}`,{
            method:'GET',
            credentials:'include'
        });
        if(response.ok){
            let value=await response.json();
            let page=value.pages;
            page=new Page(page.pageId, page.title, page.author, page.creationDate, page.publicationDate, page.authorEmail);
            return page;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error getting page'+e.message);
    }
}

async function getContentById(pageId,contentId){
    try{
        const response=await fetch(APIURL + `/backOffice/page/${pageId}/content/${contentId}`,{
            method:'GET',
            credentials:'include'
        });
        if(response.ok){
            let value=await response.json();
            return new Content(value.contentId,value.type,value.content,value.position,value.pageId);
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error getting content'+e.message);
    }
}

async function editContentById(pageId,contentId,type,content){
    try{
        const response=await fetch(APIURL + `/backOffice/page/${pageId}/content/${contentId}`,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({type,content}),
            credentials:'include'
        });
        if(response.ok){
            return true;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error editing content'+e.message);
    }
}

async function deleteContentById(pageId,contentId){
    try{
        const response=await fetch(APIURL + `/backOffice/page/${pageId}/content/${contentId}`,{
            method:'DELETE',
            credentials:'include'
        });
        if(response.ok){
            return true;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error deleting content '+e.message);
    }
}

async function addContentToPageId(pageId,type,content){
    try{
        const response=await fetch(APIURL + `/backOffice/page/${pageId}/content`,{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({type,content}),
            credentials:'include'
        });
        if(response.ok){
            return true;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error adding content'+e.message);
    }
}

async function changeAuthor(pageId,authorEmail){
    try{
        const response=await fetch(APIURL + `/backOffice/page/${pageId}/author`,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({authorEmail}),
            credentials:'include'
        });
        if(response.ok){
            return true;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error changing author'+e.message);
    }
}

async function swapContents(pageId,contentId1,contentId2){
    try{
        console.log(contentId1,contentId2,pageId);
        const response=await fetch(APIURL + `/backOffice/page/${pageId}/content/position`,{
            method:'PUT',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify({contentId1:contentId1,contentId2:contentId2}),
            credentials:'include',
        });
        if(response.ok){
            return true;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error swapping contents'+e.message);
    }
}

async function createPage(obj){
    console.log(obj);
    try{
        const response=await fetch(APIURL + '/backOffice/page',{
            method:'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body:JSON.stringify(obj),
            credentials:'include'
        });
        if(response.ok){
            return true;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        throw Error('Network Error creating page'+e.message);
    }
}

async function getUsers(){
    try{
        const response=await fetch(APIURL + '/backOffice/users',{
            method:'GET',
            credentials:'include'
        });
        if(response.ok){
            let value=await response.json();
            return value;
        }else{
            let message=await response.text();
            throw new Error('Error' + message);
        }
    }catch (e) {
        console.log(e);
        throw Error('Network Error getting users'+e.message);
    }
}
export {getUsers,createPage,swapContents,changeAuthor,addContentToPageId,deleteContentById,editContentById,getContentById,loginUser, doLogout, getTitle, setTitle, getUser, getPagesFrontOffice, getPagesBackOffice, deletePageById, getContentsByIdFO, getContentsByIdBO, editPageById,getPageById};