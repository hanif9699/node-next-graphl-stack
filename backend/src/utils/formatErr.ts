import Joi from 'joi';
import { FieldError } from '../resolvers/user';
// import logger from './logger';

export const formatErr = (err: Joi.ValidationError): FieldError => {
  let result: FieldError = {
    field: '',
    message: ''
  };
  const { details } = err;
  const { context, message } = details[0];
  result.field = context?.key as string;
  result.message = message;
  return result;
};
