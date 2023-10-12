import {Col, Container, Row} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomNavbar from "./Components/CustomNavbar.jsx";
import CustomMenu from "./Components/CustomMenu.jsx";
import CustomLogin from "./Components/CustomLogin.jsx";
import {useEffect, useState} from "react";
import {BrowserRouter, Navigate, Outlet, Route, Routes} from "react-router-dom";
import FrontOffice from "./Components/FrontOffice.jsx";
import Settings from "./Components/Settings.jsx";
import {getUser} from "./API.js";
import BackOffice from "./Components/BackOffice.jsx";
import AddPage from "./Components/AddPage.jsx";
import ViewPage from "./Components/ViewPage.jsx";
import EditPageFields from "./Components/EditPageFields.jsx";
import EditContentFields from "./Components/EditContentFields.jsx";
import AddContentToPage from "./Components/AddContentToPage.jsx";
import ChangeAuthor from "./Components/changeAuthor.jsx";
/* eslint-disable react/prop-types */

function App() {
    const [user,setUser]=useState(undefined);
    const [title,setTitle]=useState("Loading...");
    useEffect(()=>{
        getUser().then((res)=>setUser(res));
    },[]);
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage user={user} setUser={setUser} title={title} setTitle={setTitle}/>}>
                    <Route index element={<Navigate to={"/frontOffice/All"}/>}/>
                    <Route path="/frontOffice/All" element={<FrontOffice/>}/>
                    <Route path="/backOffice/All" element={<BackOffice user={user} />}/>
                    <Route path="/settings" element={<Settings setTitle={setTitle}/>}/>
                    <Route path="/login" element={<CustomLogin setUser={setUser}/>} />
                    <Route path="/addPage" element={<AddPage setUser={setUser}/>} />
                    <Route path="/:type/:pageId/:switch" element={<ViewPage/>} />
                    <Route path="/editPage/:pageId" element={<EditPageFields/>} />
                    <Route path="/editPagle/:pageId/editContent/:contentId" element={<EditContentFields/>} />
                    <Route path="/addContent/:pageId" element={<AddContentToPage/>} />
                    <Route path={"/changeAuthor/:pageId"} element={<ChangeAuthor/>}/>
                    <Route path="/*" element={<Navigate to={"/frontOffice/All"}/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

function MainPage(props){
    return(
        <Container fluid>
            <CustomNavbar user={props.user} setUser={props.setUser} title={props.title} setTitle={props.setTitle}/>
            <Row>
                <Col xs={3}>
                    <CustomMenu user={props.user}/>
                </Col>
                <Col xs={9}>
                    <Outlet/>
                </Col>
            </Row>
        </Container>)
}
export default App