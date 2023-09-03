import {Alert, Button, Card} from "react-bootstrap";
import {useState} from "react";
import {deletePageById, getPagesBackOffice} from "../../API.js";
import {useNavigate} from "react-router-dom";
/* eslint-disable react/prop-types */

export default function BackOfficeCard(props){
    let [loading,setLoading]=useState(false);
    async function deletePage(pageId){
        try{
            setLoading(true);
            props.setPages((pages)=>pages.filter((page)=>page.pageId!==pageId));
            await deletePageById(pageId);
        }catch (e){
            props.setError(e.message);
        }finally {
            props.setPages((await getPagesBackOffice()).sort((a,b)=>{
                if(!a.publicationDate){
                    return 1;
                }
                if(!b.publicationDate){
                    return -1;
                }
                return a.publicationDate.isBefore(b.publicationDate)?1:-1;
            }));
            setLoading(false);
        }
    }
    const nav=useNavigate();
    return (
        <>
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
                    <Button variant="primary" onClick={()=>{nav(`/viewPage/${props.page.pageId}/BO`)}}>View</Button>
                    {(props.user&&(props.user.userId===props.page.author||props.user.role==='admin'))?<Button variant="secondary" active={loading} onClick={()=>{nav(`/editPage/${props.page.pageId}/BO`)}}>Edit</Button>:<> </>}
                    {(props.user&&(props.user.userId===props.page.author||props.user.role==='admin'))?<Button variant="danger" active={loading} onClick={async () => {
                        await deletePage(props.page.pageId)
                    }}>Delete</Button>:<> </>}
                    {props.user&&props.user.role==='admin'?<Button variant="warning" active={loading} onClick={async () => {
                        await nav(`/changeAuthor/${props.page.pageId}`)
                    }}>Change author</Button>:<> </>}
                </Card.Body>
            </Card>
        </>
    )
}