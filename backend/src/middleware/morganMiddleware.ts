import { IncomingMessage } from "http";
import morgan from "morgan";
import { logStream } from "../utils/logger";

interface Request extends IncomingMessage {
    body: {
        query: String;
    };
}

const registerGraphQLToken = () => {
    morgan.token("graphql-query", (req: Request) => {
        if (req.url == '/graphql') {
            return `GraphQL ${req.body.query}`
        }
        return 
    });
};

registerGraphQLToken()

const morganMiddleware = morgan(
    ":method :url :status :res[content-length] - :response-time ms\n:graphql-query",
    { stream: logStream }
);

export default morganMiddleware;