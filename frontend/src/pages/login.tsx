import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { useMutation } from 'urql'
import InputField from '../components/InputField'
import Wrapper from '../components/wrapper'
import { useLoginMutation, useRegisterMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/utilsToErrorMap'



const Login: React.FC<{}> = () => {
    const router = useRouter()
    const [{ }, login] = useLoginMutation()
    return (
        <Wrapper variant='small'>
            <Formik initialValues={{ usernameOrEmail: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    // console.log(values)
                    // return register(values)
                    const response = await login({ options: values })
                    if (response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors))
                    } else if (response.data?.login.user) {
                        router.push('/')
                    }
                }}>{
                    ({ isSubmitting }) => {
                        return <Form>
                            <Box mt={4}>
                                <InputField name="usernameOrEmail" label="Username" placeholder='Enter Username' />
                            </Box>
                            <Box mt={4}>
                                <InputField name="password" label="Password" placeholder='Enter Password' type={'password'} />
                            </Box>
                            <Button type="submit" textAlign={'center'} mt={4} isLoading={isSubmitting}>Login</Button>
                        </Form>
                    }
                }
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient)(Login)