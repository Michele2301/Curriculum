import {Formik} from "formik";
import {Alert, Button, Col, Form, FormGroup, Row} from "react-bootstrap";
import * as Yup from "yup";
import {useNavigate, useParams} from "react-router-dom";
import {useState} from "react";
import {addContentToPageId} from "../API.js";
const schema = Yup.object().shape({
    type: Yup.string().required('Required'),
    content: Yup.string().required('Required'),
});
export default function AddContentToPage(props){
    const nav=useNavigate();
    const pageId=parseInt(useParams().pageId);
    const [updating,setUpdating]=useState(false);
    let [error,setError]=useState("");
    return(
        <>
            {(error) ? <Row><Alert variant="danger"  onClose={() => setError("")} dismissible>{error}</Alert></Row> : <> </> }
            <Row>
                <Formik
                    initialValues={{
                        type:"",
                        content:""
                    }}
                    validationSchema={schema}
                    onSubmit={async values => {
                        setUpdating(true);
                        try{
                            await addContentToPageId(pageId,values.type,values.content);
                            nav(`/editPage/${pageId}/BO`)
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
                                <Form.Label>type</Form.Label>
                                <Form.Select name="type"
                                             value={values.type}
                                             onBlur={handleBlur}
                                             onChange={handleChange}
                                             isValid={touched.type && !errors.type}
                                             isInvalid={touched.type && errors.type}
                                >
                                    <option value=""></option>
                                    <option value="header">header</option>
                                    <option value="paragraph">paragraph</option>
                                    <option value="image">image</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    <h4>{errors.type}</h4>
                                </Form.Control.Feedback>
                            </FormGroup>
                            {values.type==="header"?
                                <FormGroup>
                                    <Form.Label>content</Form.Label>
                                    <Form.Control name="content" type="text"
                                                  onChange={handleChange}
                                                  value={values.content}
                                                  isValid={touched.content && !errors.content}
                                                  isInvalid={touched.content && errors.content}
                                                  onBlur={handleBlur}/>
                                    <Form.Control.Feedback type="invalid">
                                        <h4>{errors.content}</h4>
                                    </Form.Control.Feedback>
                                </FormGroup>:<></>
                            }
                            {values.type==="paragraph"?
                                <FormGroup>
                                    <Form.Label>content</Form.Label>
                                    <Form.Control name="content" as="textarea"
                                                  onChange={handleChange}
                                                  value={values.content}
                                                  isValid={touched.content && !errors.content}
                                                  isInvalid={touched.content && errors.content}
                                                  onBlur={handleBlur}/>
                                    <Form.Control.Feedback type="invalid">
                                        <h4>{errors.content}</h4>
                                    </Form.Control.Feedback>
                                </FormGroup>:<></>
                            }
                            {values.type==="image"?
                                <FormGroup>
                                    <Row>
                                        <Col>
                                            <Form.Label>content</Form.Label>
                                            <Form.Select name="content"
                                                         value={values.content}
                                                         onBlur={handleBlur}
                                                         onChange={handleChange}
                                                         isValid={touched.content && !errors.content}
                                                         isInvalid={touched.content && errors.content}
                                            >
                                                <option value=""></option>
                                                <option value="image1">image1</option>
                                                <option value="image2">image2</option>
                                                <option value="image3">image3</option>
                                                <option value="image4">image4</option>
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">
                                                <h4>{errors.content}</h4>
                                            </Form.Control.Feedback>
                                        </Col>
                                        <Col>
                                            {(values.content=="image1"||values.content=="image2"||values.content=="image3"||values.content=="image4")?<img src={`http://localhost:3000/static/${values.content}.jpg`} alt={values.content}  width="100px" height="100px"/>:<></>}
                                        </Col>
                                    </Row>
                                </FormGroup>:<></>
                            }
                            <Button type={"submit"} disabled={updating}>Submit</Button>
                            <Button variant="secondary" onClick={()=>nav(`/editPage/${pageId}/BO`)}>Cancel</Button>
                        </Form>
                    )

                    }
                </Formik>
            </Row>
        </>
    )
}