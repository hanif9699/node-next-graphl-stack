import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import { cookie_name, FORGET_PASSWORD_PREFIX } from '../constants';
import Joi from 'joi';
import logger from '../utils/logger';
import { formatErr } from '../utils/formatErr';
import { v4 } from 'uuid';
import { sendEmail } from '../utils/sendEmail';

@InputType()
class UserInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  email: string;
}

@InputType()
class LoginInput {
  @Field()
  usernameOrEmail: string;

  @Field()
  password: string;
}

@ObjectType()
class LoginResponse {
  @Field({ nullable: true })
  user?: User;
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
class ForgetPasswordResponse {
  @Field({ nullable: true })
  send?: Boolean;
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@InputType()
class ChangePasswordInput {
  @Field()
  token: string;

  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, connection }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    let userRepository = connection.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.session.userId } });
    return user;
  }

  @Mutation(() => LoginResponse)
  async register(@Arg('options') options: UserInput, @Ctx() { connection, req }: MyContext): Promise<LoginResponse> {
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(10).required().messages({
        'string.required': `"Username" is a required.`,
        'string.min': `"Username" should be more than 2 character`,
        'string.max': `"Username" should be less than 10 character`,
        'string.empty': `"Username" shouldnt be empty`
      }),
      password: Joi.string().min(3).max(30).required().messages({
        'string.required': `"Password" is a required.`,
        'string.min': `"Password" should be more than 2 character`,
        'string.max': `"Password" should be less than 10 character`
      }),
      email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
        'any.required': `"Email" is a required.`,
        'string.email': `"Email" is not valid`
      })
    });
    try {
      const { error, value } = schema.validate(options);
      // logger.debug(error);
      logger.debug(value);
      if (error) {
        let formattedError = formatErr(error);
        //   logger.debug(formattedError);
        return {
          errors: [
            {
              field: formattedError.field,
              message: formattedError.message
            }
          ]
        };
      }
    } catch (e) {
      logger.error(e);
    }
    let userRepository = connection.getRepository(User);
    const dbuser = await userRepository.findOne({ where: { username: options.username } });
    if (dbuser) {
      return {
        errors: [
          {
            field: 'username',
            message: 'user already exists'
          }
        ]
      };
    }
    let hashedPassword = await argon2.hash(options.password);
    const user = new User();
    user.username = options.username;
    user.password = hashedPassword;
    user.email = options.email;
    await userRepository.save(user);
    req.session.userId = user.id;
    return { user };
  }
  @Mutation(() => LoginResponse)
  async login(@Arg('options') options: LoginInput, @Ctx() { connection, req }: MyContext) {
    const schema = Joi.object({
      usernameOrEmail: Joi.alternatives()
        .try(Joi.string().alphanum().min(3).max(10), Joi.string().email({ minDomainSegments: 2 }))
        .required()
        .messages({
          'alternatives.match': 'Invalid username or email'
        }),
      password: Joi.string().min(3).max(30).required().messages({
        'string.empty': `"Password" is a required.`
      })
    });
    try {
      const { error, value } = schema.validate(options);
      // logger.debug(error);
      logger.debug(value);
      if (error) {
        let formattedError = formatErr(error);
        //   logger.debug(formattedError);
        return {
          errors: [
            {
              field: formattedError.field,
              message: formattedError.message
            }
          ]
        };
      }
    } catch (e) {
      logger.error(e);
    }
    let userRepository = connection.getRepository(User);
    const user = await userRepository.findOne({
      where: [{ username: options.usernameOrEmail }, { email: options.usernameOrEmail }]
    });
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'that username doesnt exist'
          }
        ]
      };
    }
    let valid = await argon2.verify(user.password, options.password);
    // console.log(valid)
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Invalid Creditenial'
          }
        ]
      };
    }
    req.session.userId = user.id;
    // console.log(req)
    return {
      user
    };
  }
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) => {
      req.session.destroy((err: any) => {
        res.clearCookie(cookie_name, {
          sameSite: 'none',
          secure: true
        });
        if (err) {
          console.log(err);
          resolve(false);
        }
        resolve(true);
      });
    });
  }
  @Mutation(() => ForgetPasswordResponse)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { connection, redis }: MyContext
  ): Promise<ForgetPasswordResponse> {
    const schema = Joi.string().email({ minDomainSegments: 2 }).required();
    const { error } = schema.validate(email);
    if (error) {
      let formattedError = formatErr(error);
      //   logger.debug(formattedError);
      return {
        errors: [
          {
            field: formattedError.field,
            message: formattedError.message
          }
        ]
      };
    }
    let userRepository = await connection.getRepository(User);
    let userFound = await userRepository.findOne({ where: { email } });
    if (!userFound) {
      return {
        send: true
      };
    }
    const id = v4();
    await redis.v4.set(FORGET_PASSWORD_PREFIX + id, JSON.stringify(userFound.id), {
      EX: 60 * 60 * 24
    });
    let html = `<a href="http://localhost:3000/change-password/${id}">Reset Password</a>`;
    await sendEmail(email, html);
    return {
      send: true
    };
  }
  @Mutation(() => LoginResponse)
  async changePassword(
    @Arg('option') options: ChangePasswordInput,
    @Ctx() { connection, redis, req }: MyContext
  ): Promise<LoginResponse> {
    let userRepository = await connection.getRepository(User);
    const schema = Joi.object({
      token: Joi.string().required(),
      password: Joi.string().min(3).max(20)
    });
    const { error } = schema.validate(options);
    if (error) {
      let formattedError = formatErr(error);
      //   logger.debug(formattedError);
      return {
        errors: [
          {
            field: formattedError.field,
            message: formattedError.message
          }
        ]
      };
    }
    logger.debug(FORGET_PASSWORD_PREFIX + options.token);
    const userId = await redis.v4.get(FORGET_PASSWORD_PREFIX + options.token);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Token Expired !!!'
          }
        ]
      };
    }
    const user = await userRepository.findOne({ where: { id: parseInt(userId) } });
    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Token Invalid !!!'
          }
        ]
      };
    }
    let hashedPassword = await argon2.hash(options.password);
    user.password = hashedPassword;
    await userRepository.save(user);
    req.session.userId = user.id;
    return {
      user
    };
  }
}
