'use strict'

import dayjs from "dayjs";
export function Page(pageId, title, author, creationDate, publicationDate, authorEmail){
    this.pageId=pageId;
    this.title=title
    this.author=author&&parseInt(author)
    this.creationDate=creationDate&&dayjs(creationDate)
    this.publicationDate=publicationDate&&dayjs(publicationDate).isValid()?dayjs(publicationDate):"";
    this.authorEmail=authorEmail;
}

export function Content(id,type,content,position,pageId){
    this.contentId=id;
    this.type=type;
    this.content=content;
    this.position=position;
    this.pageId=pageId;
}