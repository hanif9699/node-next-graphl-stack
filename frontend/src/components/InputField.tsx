import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/react'
import { useField } from 'formik'
import React from 'react'

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    placeholder: string;
    label: string;
}



const InputField: React.FC<InputFieldProps> = ({ label, size: _, ...props }) => {
    // console.log(props)
    const [field, { error }] = useField(props)
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel>{label}</FormLabel>
            <Input {...field} {...props} />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    )
}

export default InputField