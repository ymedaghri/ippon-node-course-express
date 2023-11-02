import { PrismaClient as MongoPrismaClient, User } from "../database-mongo/prisma/generated/client-mongo";
import { PrismaClient as PostgresPrismaClient, Post } from "../database-postgres/prisma/generated/client-postgres";

export const mongoPrismaClient = new MongoPrismaClient()
export const postgresPrismaClient = new PostgresPrismaClient()

export type repositories = {
    mongoRepository: {
        createUser: () => Promise<User>
    }
    postgresRepository: {
    }
}

const repositories: repositories = {
    mongoRepository: {
        createUser: () => {
            return mongoPrismaClient.user.create({
                data: {
                    name: 'Rich',
                    email: 'hello@prisma.com',
                    posts: {
                        create: {
                            title: 'My first post',
                            body: 'Lots of really interesting stuff'
                        },
                    },
                },
            })
        }
    },
    postgresRepository: {}
}

export default repositories