import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2'

@InputType()
class UserInput {

    @Field()
    username: string;

    @Field()
    password: string;
}

@ObjectType()
class LoginResponse {
    @Field({ nullable: true })
    user?: User;
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
}

@ObjectType()
class FieldError {
    @Field()
    field: string;
    @Field()
    message: string
}

@Resolver()
export class UserResolver {

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req, connection }: MyContext
    ) {
        if (!req.session.userId) {
            return null
        }
        let userRepository = connection.getRepository(User)
        const user = await userRepository.findOne({ where: { id: req.session.userId } })
        return user
    }

    @Mutation(() => LoginResponse)
    async register(
        @Arg('options') options: UserInput,
        @Ctx() { connection, req }: MyContext
    ): Promise<LoginResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: 'username',
                    message: "username length should be more than 2 char"
                }]
            }
        }
        if (options.password.length <= 2) {
            return {
                errors: [{
                    field: 'password',
                    message: "password length should be more than 2 char"
                }]
            }
        }
        let userRepository = connection.getRepository(User)
        const dbuser = await userRepository.findOne({ where: { username: options.username } })
        if (dbuser) {
            return {
                errors: [{
                    field: 'username',
                    message: "user already exists"
                }]
            }
        }
        let hashedPassword = await argon2.hash(options.password)
        const user = new User()
        user.username = options.username
        user.password = hashedPassword
        await userRepository.save(user)
        req.session.userId = user.id
        return { user }
    }
    @Mutation(() => LoginResponse)
    async login(
        @Arg('options') options: UserInput,
        @Ctx() { connection, req }: MyContext
    ) {
        let userRepository = connection.getRepository(User)
        const user = await userRepository.findOne({ where: { username: options.username } })
        if (!user) {
            return {
                errors: [{
                    field: 'username',
                    message: "that username doesnt exist"
                }]
            }
        }
        let valid = await argon2.verify(user.password, options.password)
        console.log(valid)
        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: "Invalid Creditenial"
                }]
            }
        }
        req.session.userId = user.id
        console.log(req.session)
        return {
            user
        }
    }

}