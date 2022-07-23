import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import { useMutation } from 'urql'
import InputField from '../components/InputField'
import Wrapper from '../components/wrapper'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/utilsToErrorMap'

interface registerProps {

}



const Register: React.FC<registerProps> = () => {
    const router = useRouter()
    const [{ }, register] = useRegisterMutation()
    return (
        <Wrapper variant='small'>
            <Formik initialValues={{ username: '', password: '' }}
                onSubmit={async (values, { setErrors }) => {
                    // console.log(values)
                    // return register(values)
                    const response = await register(values)
                    if (response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors))
                    }else if(response.data?.register.user){
                        router.push('/')
                    }
                }}>{
                    ({ isSubmitting }) => {
                        return <Form>
                            <Box mt={4}>
                                <InputField name="username" label="Username" placeholder='Enter Username' />
                            </Box>
                            <Box mt={4}>
                                <InputField name="password" label="Password" placeholder='Enter Password' type={'password'} />
                            </Box>
                            <Button type="submit" textAlign={'center'} mt={4} isLoading={isSubmitting}>Register</Button>
                        </Form>
                    }
                }</Formik></Wrapper>
    )
}

export default Register