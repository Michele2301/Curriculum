import {useEffect, useState} from "react";
/* eslint-disable react/prop-types */
import {getContentsByIdBO, getContentsByIdFO} from "../API.js";
import ContentDisplay from "./ViewPage-Components/ContentDisplay.jsx";
import PageDisplay from "./ViewPage-Components/PageDisplay.jsx";
import {useNavigate, useParams} from "react-router-dom";
import {Alert, Button, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
export default function ViewPage(props){
    let [page,setPage]=useState(undefined);
    let [contents,setContents]=useState([]);
    let pageId=useParams().pageId;
    let switchvalue=useParams().switch;
    let pageType=useParams().type;
    let [error,setError]=useState("");
    let [updating,setUpdating]=useState(false);
    useEffect(()=>{
        if(switchvalue=='BO'){
            getContentsByIdBO(pageId).then((res)=>{
                console.log(res);
                setContents(res.contents);
                setPage(res.page);
            });
        }else{
            getContentsByIdFO(pageId).then((res)=>{
                console.log(res);
                setContents(res.contents);
                setPage(res.page);
            });
        }
    },[])
    const nav=useNavigate();
    return (
        <>
            {(error) ? <Row><Alert variant="danger"  onClose={() => setError("")} dismissible>{error}</Alert></Row> : <> </> }
            {
                (page&&<PageDisplay page={page} pageType={pageType} contents={contents} setError={setError}/>)||<h1>loading</h1>
            }
            {
                contents.sort((a,b)=>{return a.position-b.position})
                    .map((content,index)=>{
                        return(<ContentDisplay index={index} setError={setError} pageType={pageType} setContents={setContents} contents={contents} key={content.contentId} content={content} updating={updating} setUpdating={setUpdating}/>)
                    })
            }
            {
                pageType==='editPage'?
                    <FontAwesomeIcon className="align-items-center fa-pull-left" icon={faPlusCircle} size="2xl" style={{color:"blue"}} onClick={()=>{nav(`/addContent/${pageId}`)}}></FontAwesomeIcon>
                    :<></>
            }
            <Button variant="secondary" onClick={()=>{switchvalue=='BO'?nav('/backOffice/All'):nav('/frontOffice/All')}}>Back</Button>
        </>
    )
}