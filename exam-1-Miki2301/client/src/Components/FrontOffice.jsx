import {useEffect, useState} from "react";
import {getPagesFrontOffice} from "../API.js";
import FrontOfficeCard from "./FrontOffice-Components/FrontOfficeCard.jsx";
import {Row} from "react-bootstrap";

export default function FrontOffice(){
    let [pages,setPages]=useState([]);
    useEffect(()=>{
        getPagesFrontOffice().then((res)=> {
            let res1=res.sort((a,b)=>a.publicationDate.isBefore(b.publicationDate) ? 1 : -1);
            setPages(res1)
        });
    },[])
    return (
        <Row>
            {pages.map((page) => {
                return <FrontOfficeCard key={page.pageId} page={page}/>
            })}
        </Row>
    )
}