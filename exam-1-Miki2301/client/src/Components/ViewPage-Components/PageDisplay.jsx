import {Button, Col, Row} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
/* eslint-disable react/prop-types */
export default function PageDisplay(props){
    const nav=useNavigate()
    return(
        <Row className="align-items-center">
            <Col>
                <h3>Title</h3>
                <p>{props.page.title}</p>
                <h3>Author</h3>
                <p>{props.page.authorEmail}</p>
                <h3>PublicationDate</h3>
                <p>{(props.page.publicationDate&&props.page.publicationDate.format('YYYY-MM-DD'))||"empty"}</p>
                <h3>creationDate</h3>
                <p>{props.page.creationDate&&props.page.creationDate.format('YYYY-MM-DD')}</p>
            </Col>
            <Col className="align-items-center justify-content-center">
                <Row>
                    {props.pageType==='editPage'?<Button className="w-50" variant="primary" onClick={()=>{nav(`/editPage/${props.page.pageId}`)}}>Edit Page</Button>:<></>}
                </Row>
            </Col>
        </Row>
    )
}