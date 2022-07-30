import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { useMutation } from 'urql'
import InputField from '../../components/InputField'
import Wrapper from '../../components/wrapper'
import { useChangePasswordMutation } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { toErrorMap } from '../../utils/utilsToErrorMap'

interface ChangePasswordProps {
    token: string;
}


const ChangePassword: NextPage<ChangePasswordProps> = ({ token }) => {
    const router = useRouter()
    const [{ }, changePassword] = useChangePasswordMutation()
    return (
        <Wrapper variant='small'>
            <Formik initialValues={{ password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    // console.log(values)
                    // return register(values)
                    const response = await changePassword({ option: { ...values, token } })
                    if (response.data?.changePassword.errors) {
                        setErrors(toErrorMap(response.data.changePassword.errors))
                    } else if (response.data?.changePassword.user) {
                        router.push('/')
                    }
                }}>{
                    ({ isSubmitting }) => {
                        return <Form>
                            <Box mt={4}>
                                <InputField name="password" label="Password" placeholder='Enter Password' type={'password'} />
                            </Box>
                            <Button type="submit" textAlign={'center'} mt={4} isLoading={isSubmitting}>Reset Password</Button>
                        </Form>
                    }
                }
            </Formik>
        </Wrapper>
    )
}

ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.id as string,
    }
}

export default withUrqlClient(createUrqlClient)(ChangePassword)