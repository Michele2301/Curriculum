import * as Yup from "yup";
import {Formik} from "formik";
import {loginUser} from "..//API.js";
import {Alert, Button, Form, FormGroup, Row} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
/* eslint-disable react/prop-types */

const schema = Yup.object().shape({
    email: Yup.string().required('Required').email('Invalid email address'),
    password: Yup.string().required('Required'),
});
export default function CustomLogin(props){
    const nav=useNavigate();
    let [error,setError]=useState("");
    let [updating,setUpdating]=useState(false);
    return (
        <>
            {(error) ? <Row><Alert variant="danger"  onClose={() => setError("")} dismissible>{error}</Alert></Row> : <> </> }
            <Row>
                <Formik
                    initialValues={{
                        email: '',
                        password: '',
                    }}
                    validationSchema={schema}
                    onSubmit={async values => {
                        try {
                            setUpdating(true);
                            const user=await loginUser(values.email,values.password);
                            props.setUser(user);
                            nav('/filter/All');
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
                          isValid,
                          errors,
                      }) => (
                        <Form onSubmit={handleSubmit} noValidate>
                            <FormGroup>
                                <Form.Label>Email</Form.Label>
                                <Form.Control name="email" type="text"
                                              onChange={handleChange}
                                              value={values.email}
                                              isValid={touched.email && !errors.email}
                                              isInvalid={touched.email && errors.email}
                                              onBlur={handleBlur}/>
                                <Form.Control.Feedback type="invalid">
                                    <h4>{errors.email}</h4>
                                </Form.Control.Feedback>
                            </FormGroup>
                            <FormGroup>
                                <Form.Label>Password</Form.Label>
                                <Form.Control name="password"
                                              type="password"
                                              onChange={handleChange}
                                              value={values.password}
                                              isValid={touched.password && !errors.password}
                                              isInvalid={touched.password && errors.password}
                                              onBlur={handleBlur}/>
                                <Form.Control.Feedback type="invalid">
                                    <h4>{errors.password}</h4>
                                </Form.Control.Feedback>
                            </FormGroup>
                            <Button disabled={updating} type={"submit"}>Submit</Button>
                            <Button disabled={updating} onClick={()=>nav("/frontOffice/All")}>Cancel</Button>
                        </Form>
                    )

                    }
                </Formik>
            </Row>
        </>
    )
}