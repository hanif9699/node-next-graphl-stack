import { Field, Int, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@ObjectType()
@Entity()
export class User {

    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => Date)
    @CreateDateColumn()
    createdAt = new Date();

    @Field(() => Date)
    @UpdateDateColumn()
    updatedAt = new Date();

    @Field()
    @Column({ unique: true })
    username: string;

    @Field()
    @Column()
    password: string

}