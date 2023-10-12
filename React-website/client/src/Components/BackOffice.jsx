import {useEffect, useState} from "react";
import {getPagesBackOffice} from "../API.js";
import BackOfficeCard from "./BackOffice-Components/BackOfficeCard.jsx";
import {Alert, Row} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
/* eslint-disable react/prop-types */

export default function BackOffice(props){
    let [pages,setPages]=useState([]);
    let nav=useNavigate();
    let [error,setError]=useState("");
    useEffect(()=>{
        getPagesBackOffice().then((res)=>setPages(res.sort((a,b)=>{
            if(!a.publicationDate){
                return 1;
            }
            if(!b.publicationDate){
                return -1;
            }
            return a.publicationDate.isBefore(b.publicationDate)?1:-1;
        })));
    },[])
    return (
        <>
            {(error) ? <Row><Alert variant="danger"  onClose={() => setError("")} dismissible>{error}</Alert></Row> : <> </> }
            <Row>
                {
                    pages.map((page) => {
                        return <BackOfficeCard setError={setError} key={page.pageId} user={props.user} setPages={setPages} pages={pages} page={page}/>
                    })
                }
            </Row>
            <Row className="fa-pull-left align-items-center">
                <FontAwesomeIcon icon={faPlusCircle} style={{color: "black"}} className="fa-2x" onClick={async () => {
                    nav("/addPage");
                }}/>
            </Row>
        </>
    )
}