import {Button, Card} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
/* eslint-disable react/prop-types */
export default function FrontOfficeCard(props){
    const nav=useNavigate();
    return (
        <Card className="justify-content-center w-50">
            <Card.Body>
                <Card.Subtitle>Title</Card.Subtitle>
                <Card.Title>{props.page.title}</Card.Title>
                <Card.Subtitle>Author</Card.Subtitle>
                <Card.Text>{props.page.authorEmail}</Card.Text>
                <Card.Subtitle>PublicationDate</Card.Subtitle>
                <Card.Text>{(props.page.publicationDate&&props.page.publicationDate.format('YYYY-MM-DD'))||"empty"}</Card.Text>
                <Card.Subtitle>creationDate</Card.Subtitle>
                <Card.Text>{props.page.creationDate&&props.page.creationDate.format('YYYY-MM-DD')}</Card.Text>
                <Button variant="primary" onClick={()=>{nav(`/viewPage/${props.page.pageId}/FO`)}}>View</Button>
            </Card.Body>
        </Card>
    )
}