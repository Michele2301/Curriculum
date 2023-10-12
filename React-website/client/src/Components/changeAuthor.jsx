import {useEffect, useState} from "react";
import {Alert, Button, Form, FormGroup, Row} from "react-bootstrap";
import {changeAuthor, getPageById, getUsers} from "../API.js";
import {Formik} from "formik";
import * as Yup from "yup";
import {useNavigate, useParams} from "react-router-dom";

const schema = Yup.object().shape({
    authorEmail: Yup.string().required('Required'),
});
export default function ChangeAuthor(){
    useEffect(()=>{
        getPageById(pageId).then((p)=>{
            setAuthorEmail(p.authorEmail);
        });
        getUsers().then((res)=>setUsers(res));
    },[])
    const nav=useNavigate();
    const pageId=parseInt(useParams().pageId);
    const [updating,setUpdating]=useState(false);
    let [authorEmail,setAuthorEmail]=useState("");
    let [error,setError]=useState("");
    const [users,setUsers]=useState([]);
    return(
        <>
            {(error) ? <Row><Alert variant="danger"  onClose={() => setError("")} dismissible>{error}</Alert></Row> : <> </> }
            <Row>
                <Formik
                    initialValues={{
                        authorEmail:authorEmail
                    }}
                    validationSchema={schema}
                    enableReinitialize
                    onSubmit={async values => {
                        setUpdating(true);
                        try{
                            await changeAuthor(pageId, values.authorEmail);
                            nav(`/editPage/${pageId}/BO`);
                        }catch (e){
                            setError(e.message);
                        }finally {
                            setUpdating(false);
                        }
                    }}>
                    {({
                          handleSubmit,
                          handleChange,
                          handleBlur,
                          values,
                          touched,
                          errors,
                      }) => (
                        <Form onSubmit={handleSubmit} noValidate>
                            <FormGroup>
                                <Form.Label>author</Form.Label>
                                <Form.Select name="authorEmail"
                                             value={values.authorEmail}
                                             onBlur={handleBlur}
                                             onChange={handleChange}
                                             isValid={touched.authorEmail && !errors.authorEmail}
                                             isInvalid={touched.authorEmail && !!errors.authorEmail}
                                >
                                    {
                                        users.map((user)=>(<option key={user.email} value={user.email}>{user.email}</option>))
                                    }
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    <h4>{errors.authorEmail}</h4>
                                </Form.Control.Feedback>
                            </FormGroup>
                            <Button type="submit" disabled={updating}>Submit</Button>
                            <Button variant="secondary" onClick={()=>nav(`/backOffice/All`)}>Cancel</Button>
                        </Form>
                    )

                    }
                </Formik>
            </Row>
        </>

    )
}

