import {Alert, Button, Col, Form, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {getTitle,setTitle} from "../API.js";

export default function Settings(props){
    let [loading,setLoading]=useState(false);
    let [webPageTitle,setWebPageTitle]=useState('');
    let [error,setError]=useState('');
    async function handleSubmit(){
        setLoading(true);
        try {
            props.setTitle(webPageTitle);
            await setTitle(webPageTitle);
        }catch (e){
            setError(e.message);
        }finally {
            await getTitle().then((res)=>props.setTitle(res));
            setLoading(false);
        }
    }
    useEffect(()=>{
        getTitle().then((res)=>setWebPageTitle(res));
    },[])
    return (
        <>
            {(error) ? <Row><Alert variant="danger"  onClose={() => setError("")} dismissible>{error}</Alert></Row> : <> </> }
            <Form className="d-flex">
                <Row className="d-flex w-100 align-items-center justify-content-center">
                    <Col>
                        <Form.Group controlId="webPageTitle">
                            <Form.Label>Web Page Title</Form.Label>
                            <Form.Control type="text" value={webPageTitle} onChange={(e)=>setWebPageTitle(e.target.value)}/>
                        </Form.Group>
                    </Col>
                    <Col className="justify-content-center align-items-center" >
                        <Form.Group controlId="Submit">
                            <Button active={loading} onClick={handleSubmit}>Submit</Button>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </>

    )
}