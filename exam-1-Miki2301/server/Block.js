'use strict'

const dayjs = require("dayjs");
function Page(pageId, title, author, creationDate, publicationDate, email) {
    this.pageId = pageId;
    this.title = title
    this.author = author && parseInt(author)
    this.creationDate = creationDate && dayjs(creationDate)
    this.publicationDate = publicationDate && dayjs(publicationDate)
    this.authorEmail = email;
}
function Content(id,type,content,position, pageId){
    this.contentId=id;
    this.type=type;
    this.content=content;
    this.position=position;
    this.pageId=pageId;
}
module.exports={Page, Content};