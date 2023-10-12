import {ListGroup} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
/* eslint-disable react/prop-types */

export default function CustomMenu(props){
        const nav=useNavigate();
        return(
            <ListGroup>
                <ListGroup.Item onClick={()=>nav("/frontOffice/All")}>frontOffice</ListGroup.Item>
                {props.user!==undefined ? <ListGroup.Item onClick={() => nav("/backOffice/All")}>backOffice</ListGroup.Item>:null}
                {props.user&&props.user.role==='admin'?<ListGroup.Item onClick={() => nav("/settings")}>settings</ListGroup.Item>:null}
            </ListGroup>
        )
}