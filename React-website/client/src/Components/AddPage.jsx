/* eslint-disable react/prop-types */

import {createPage} from "../API.js";
import {Alert, Button, Form, FormGroup, Row} from "react-bootstrap";
import {Formik} from "formik";
import * as Yup from "yup";
import {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import AddContentToPage from "./AddPage-Components/AddContentToPage.jsx";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
const schema = Yup.object().shape({
    title: Yup.string().required("title is required"),
    publicationDate: Yup.string()
})

export default function AddPage(){
    let [contents,setContents]=useState([]);
    let [updating,setUpdating]=useState(false);
    let [counter,setCounter]=useState(0);
    let [error,setError]=useState("");
    function exchangePosition(index1,index2){
        let tmp=contents[index1].counter;
        contents[index1].counter=contents[index2].counter;
        contents[index2].counter=tmp;
        contents=contents.sort((a,b)=>(a.counter-b.counter));
        setContents([...contents]);
    }
    const nav=useNavigate();
    return(
       <>
           {(error) ? <Row><Alert variant="danger"  onClose={() => setError("")} dismissible>{error}</Alert></Row> : <> </> }
           <Row>
            <Formik
                initialValues={{
                    title:"",
                    publicationDate:"",
                }}
                validationSchema={schema}
                enableReinitialize
                onSubmit={async values => {
                    setUpdating(true);
                    try{
                        await createPage({
                            page:{
                                title:values.title,
                                publicationDate:dayjs(values.publicationDate).isValid()?dayjs(values.publicationDate).format("YYYY-MM-DD HH:mm:ss"):"",
                            },
                            contents:contents.map((content)=>{return {type:content.type,content:content.content}})
                        })
                        nav('/backOffice/All');
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
                            <Form.Control name="title"
                                          value={values.title}
                                          onBlur={handleBlur}
                                          onChange={handleChange}
                                          isValid={touched.title && !errors.title}
                                          isInvalid={touched.title && !!errors.title}
                            />
                            <Form.Control.Feedback type="invalid">
                                <h4>{errors.title}</h4>
                            </Form.Control.Feedback>
                        </FormGroup>
                        <FormGroup>
                            <Form.Label>publicationDate</Form.Label>
                            <Form.Control name="publicationDate"
                                          value={values.publicationDate}
                                          onBlur={handleBlur}
                                          onChange={handleChange}
                                          isValid={touched.publicationDate && !errors.publicationDate}
                                          type="date"
                            />
                        </FormGroup>
                        {
                            contents.map((c,i)=> {
                                return <AddContentToPage key={i} index={i} content={c} contents={contents} setContents={setContents} exchangePosition={exchangePosition}/>
                            })
                        }
                        <FontAwesomeIcon icon={faPlusCircle} style={{color: "black"}} className="fa-2x" onClick={async () => {
                            setContents([...contents, {counter:counter,content: "", type: ""}]);
                            setCounter(counter+1);
                        }}/>
                        <br/>
                        <br/>
                        <Button type="submit" disabled={updating}>Submit</Button>
                        <Button variant="secondary" onClick={()=>nav('/backOffice/All')}>Cancel</Button>
                    </Form>
                )

                }
            </Formik>
        </Row>
       </>
    )
}