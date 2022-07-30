import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import InputField from '../components/InputField'
import Wrapper from '../components/wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/utilsToErrorMap'



const ForgetPassword: NextPage<{}> = () => {
    const router = useRouter()
    const [{ }, forgetPassword] = useForgotPasswordMutation()
    return (
        <Wrapper variant='small'>
            <Formik initialValues={{ email: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await forgetPassword(values)
                    if (response.data?.forgotPassword.errors) {
                        setErrors(toErrorMap(response.data.forgotPassword.errors))
                    } else if (response.data?.forgotPassword.send) {
                        router.push('/')
                    }
                }}>{
                    ({ isSubmitting }) => {
                        return <Form>
                            <Box mt={4}>
                                <InputField name="email" type={'email'} label="Email" placeholder='Enter Email' />
                            </Box>
                            <Button type="submit" textAlign={'center'} mt={4} isLoading={isSubmitting}>Submit</Button>
                        </Form>
                    }
                }
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(ForgetPassword)