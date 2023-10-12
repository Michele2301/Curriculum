import {Formik} from "formik";
import {Alert, Button, Form, FormGroup, Row} from "react-bootstrap";
import * as Yup from "yup";
import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {editPageById, getPageById} from "../API.js";
const schema = Yup.object().shape({
    title: Yup.string().required('Required'),
    publicationDate: Yup.string()
});
export default function EditPageFields(props){
    const nav=useNavigate();
    const id=parseInt(useParams().pageId);
    const [updating,setUpdating]=useState(false); //this is used to know if we are updating or adding a new film
    let [page,setPage]=useState({title:"",publicationDate:""});
    let [error,setError]=useState("");
    useEffect(()=>{
        setUpdating(true);
        getPageById(id).then((p)=>{
            setPage(p);
            setUpdating(false);
        })
    },[])
    return(
        <>
            {(error) ? <Row><Alert variant="danger"  onClose={() => setError("")} dismissible>{error}</Alert></Row> : <> </> }
            <Row>
                <Formik
                    initialValues={{
                        title:page.title,
                        publicationDate:page.publicationDate&&page.publicationDate.format('YYYY-MM-DD')||"",
                    }}
                    enableReinitialize
                    validationSchema={schema}
                    onSubmit={async values => {
                        setUpdating(true);
                        try{
                            await editPageById(id,values.title,values.publicationDate);
                            nav(`/editPage/${id}/BO`)
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
                                <Form.Label>title</Form.Label>
                                <Form.Control name="title" type="text"
                                              onChange={handleChange}
                                              value={values.title}
                                              isValid={touched.title && !errors.title}
                                              isInvalid={touched.title && errors.title}
                                              onBlur={handleBlur}/>
                                <Form.Control.Feedback type="invalid">
                                    <h4>{errors.title}</h4>
                                </Form.Control.Feedback>
                            </FormGroup>
                            <FormGroup>
                                <Form.Label>publicationDate</Form.Label>
                                <Form.Control name="publicationDate" type="date"
                                              onChange={handleChange}
                                              value={values.publicationDate}
                                              isValid={touched.publicationDate && !errors.publicationDate}
                                              isInvalid={touched.publicationDate && errors.publicationDate}
                                              onBlur={handleBlur}/>
                                <Form.Control.Feedback type="invalid">
                                    <h4>{errors.publicationDate}</h4>
                                </Form.Control.Feedback>
                            </FormGroup>
                            <Button type={"submit"} disabled={updating}>Submit</Button>
                            <Button variant={"secondary"} onClick={()=>nav(`/editPage/${id}/BO`)}>Cancel</Button>
                        </Form>
                    )

                    }
                </Formik>
            </Row>
        </>
    )
}