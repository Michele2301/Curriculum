import {Container, Navbar} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faUser} from "@fortawesome/free-solid-svg-icons";
import {useNavigate} from "react-router-dom";
import {faArrowRightFromBracket} from "@fortawesome/free-solid-svg-icons/faArrowRightFromBracket";
import {doLogout, getTitle} from "../API.js";
import {useEffect} from "react";
/* eslint-disable react/prop-types */

export default function CustomNavbar(props){
    const nav=useNavigate();
    useEffect(()=>{
        getTitle().then((value)=>{
            props.setTitle(value);
        });
    },[])
    return (<Navbar bg="dark" variant="dark">
        <Container>
            <Navbar.Brand>{props.title}</Navbar.Brand>
            {!props.user ?
                <FontAwesomeIcon icon={faUser} style={{color: "#ffffff",}} onClick={async () => {
                nav('/login')}} /> :
                <FontAwesomeIcon icon={faArrowRightFromBracket} style={{color: "#ffffff",}} onClick={async () => {
                props.setUser(undefined);
                await doLogout();
                nav("/frontOffice/All");}}/>
            }
        </Container>
        </Navbar>)
}