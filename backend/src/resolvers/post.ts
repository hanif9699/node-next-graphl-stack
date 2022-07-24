import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {

    @Query(() => [Post])
    async posts(
        @Ctx() { connection }: MyContext
    ): Promise<Post[]> {
        return await connection.manager.find(Post, {})
    }
    @Query(() => Post, { nullable: true })
    post(
        @Arg('id', () => Int) id: number,
        @Ctx() { connection }: MyContext
    ): Promise<Post | null> {
        return connection.manager.findOne(Post, { where: { id } })
    }

    @Mutation(() => Post)
    async createPost(
        @Arg('title', () => String) title: string,
        @Ctx() { connection }: MyContext
    ): Promise<Post> {
        const post = new Post()
        post.title = title
        await connection.manager.save(post)
        return post
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title', () => String) title: string,
        @Ctx() { connection }: MyContext
    ): Promise<Post | null> {
        const post = await connection.manager.findOne(Post, { where: { id } })
        if (!post) {
            return null
        }
        if (typeof title !== 'undefined') {
            post.title = title
            await connection.manager.save(post)
        }
        return post
    }
    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { connection }: MyContext
    ): Promise<boolean> {
        try {
            let postRepository = connection.getRepository(Post)
            await postRepository.delete({ id })
            return true
        } catch (e) {
            console.log(e)
            return false
        }

    }

}