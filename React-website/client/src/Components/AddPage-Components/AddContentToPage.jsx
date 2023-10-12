import {Formik} from "formik";
import {Button, Col, Form, FormGroup, Row} from "react-bootstrap";
import * as Yup from "yup";
/* eslint-disable react/prop-types */
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowDown, faArrowUp} from "@fortawesome/free-solid-svg-icons";
const schema = Yup.object().shape({
    type: Yup.string().required('Required'),
    content: Yup.string().required('Required'),
});
export default function AddContentToPage(props){
    //two states:
    //the one inside formik defined below and the one from props with all the contents
    return(
        <Row className="align-items-center justify-content-center">
            <Col>
                <Formik
                    enableReinitialize
                    initialValues={{
                        type:props.content.type,
                        content:props.content.content
                    }}
                    validationSchema={schema}
                    onSubmit={()=>{
                        //needed for formik
                    }}>
                    {({
                          handleChange,
                          handleBlur,
                          values,
                          touched,
                          errors,
                      }) => (
                        <>
                                <FormGroup>
                                    <Form.Label>type</Form.Label>
                                    <Form.Select name="type"
                                                 value={values.type}
                                                 onBlur={handleBlur}
                                                 onChange={(newValue) => {
                                                     let tmp=props.contents.map((content)=>(content.counter==props.content.counter ? {...content,type:newValue.currentTarget.value}:content));
                                                     props.setContents(tmp);
                                                     handleChange(newValue);
                                                 }}
                                                 isValid={touched.type && !errors.type}
                                                 isInvalid={touched.type && errors.type}>
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
                                                      onChange={(newValue) => {
                                                          let tmp=props.contents.map((content)=>(content.counter==props.content.counter ? {...content,content:newValue.currentTarget.value}:content));
                                                          props.setContents(tmp);
                                                          handleChange(newValue);
                                                      }}
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
                                                      onChange={(newValue) => {
                                                          let tmp=props.contents.map((content)=>(content.counter==props.content.counter ? {...content,content:newValue.currentTarget.value}:content));
                                                          props.setContents(tmp);
                                                          handleChange(newValue);
                                                      }}
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
                                                             onChange={(newValue) => {
                                                                 let tmp=props.contents.map((content)=>(content.counter==props.content.counter ? {...content,content:newValue.currentTarget.value}:content));
                                                                 props.setContents(tmp);
                                                                 handleChange(newValue);
                                                             }}
                                                             isValid={touched.content && !errors.content}
                                                             isInvalid={touched.content && errors.content}>
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
                                <Button onClick={()=>{props.setContents(props.contents.filter((content)=>(content.counter!==props.content.counter)))}}>Cancel</Button>
                        </>
                    )}
                </Formik>
            </Col>
            <Col className="align-items-center justify-content-center">
                <Row>
                    {(props.index!==0)?<FontAwesomeIcon icon={faArrowUp} size="xl" onClick={async () => {
                        await props.exchangePosition(props.index-1,props.index);
                    }} />:<></>}
                </Row>
                <Row>
                    {(props.index!==(props.contents.length-1))?<FontAwesomeIcon icon={faArrowDown} size="xl" onClick={async ()=>{
                        await props.exchangePosition(props.index,props.index+1);
                    }} />:<></>}
                </Row>
            </Col>
        </Row>

    )
}