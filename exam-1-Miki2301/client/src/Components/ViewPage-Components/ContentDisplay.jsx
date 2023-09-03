import {Button, Col, Row} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {deleteContentById, getContentsByIdBO, swapContents} from "../../API.js";
/* eslint-disable react/prop-types */
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons";
export default function ContentDisplay(props){
    let updating=props.updating;
    let setUpdating=props.setUpdating;
    async function handleDelete(){
        try{
            setUpdating(true);
            props.setContents(props.contents.filter((c)=>c.contentId!==props.content.contentId));
            await deleteContentById(props.content.pageId,props.content.contentId);
        }catch (e){
            props.setError(e.message);
        }finally {
            await props.setContents((await getContentsByIdBO(props.content.pageId)).contents);
            setUpdating(false);
        }
    }
    async function handleUp(contents, index, pageId) {
        try{
            setUpdating(true)
            let tmp = contents.sort((a, b) => {
                return a.position - b.position
            });
            let contentId1 = tmp[index].contentId;
            let contentId2 = tmp[index - 1].contentId;
            let tmp1=tmp[index].position;
            tmp[index].position = tmp[index-1].position;
            tmp[index-1].position=tmp1;
            props.setContents(tmp);
            await swapContents(pageId, contentId1, contentId2);
        }catch (e) {
            props.setError(e.message);
        }finally {
            await props.setContents((await getContentsByIdBO(props.content.pageId)).contents);
            setUpdating(false);
        }
    }
    async function handleDown(contents, index, pageId) {
        try{
            setUpdating(true)
            let tmp = contents.sort((a, b) => {
                return a.position - b.position
            });
            let contentId1 = tmp[index].contentId;
            let contentId2 = tmp[index + 1].contentId;
            let tmp1=tmp[index].position;
            tmp[index].position = tmp[index+1].position;
            tmp[index+1].position=tmp1;
            props.setContents(tmp);
            await swapContents(pageId, contentId1, contentId2);
        }catch (e) {
            props.setError(e.message);
        }finally {
            await props.setContents((await getContentsByIdBO(props.content.pageId)).contents);
            setUpdating(false);
        }
    }
    const nav=useNavigate();
    return(
        <Row className="align-items-center justify-content-between">
            <Col>
                <hr/>
                <h3>{props.content.type}</h3>
                {props.content.type==='image'?<img style={{width:400, height:400}} src={'http://localhost:3000/static/'+props.content.content+'.jpg'} alt=""/>:<p>{props.content.content}</p>}
            </Col>
            <Col className="align-items-center justify-content-center">
                <Row>
                    {props.pageType==='editPage'?<Button disabled={updating} className="w-auto" variant="primary" onClick={()=>{nav(`/editPage/${props.content.pageId}/editContent/${props.content.contentId}`)}}>Edit Content</Button>:<></>}
                </Row>
                <Row>
                    {props.pageType==='editPage'?<Button disabled={updating} className="w-auto" variant="danger" onClick={async ()=>{await handleDelete()}}>Delete Content</Button>:<></>}
                </Row>
            </Col>
            <Col className="align-items-center justify-content-center">
                <Row>
                    {(props.pageType==='editPage'&&props.index!==0)?<FontAwesomeIcon icon={faArrowUp} size="2xl" onClick={async () => {
                        await handleUp(props.contents,props.index, props.content.pageId);
                    }} />:<></>}
                </Row>
                <Row>
                    {(props.pageType==='editPage'&&props.index!==(props.contents.length-1))?<FontAwesomeIcon icon={faArrowDown} size="2xl" onClick={async ()=>{
                        await handleDown(props.contents,props.index, props.content.pageId);
                    }} />:<></>}
                </Row>
            </Col>
        </Row>
    )
}