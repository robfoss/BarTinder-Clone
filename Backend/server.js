const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose')
const { makeExecutableSchema } = require("graphql-tools")
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge")
const { loadFilesSync } = require("@graphql-tools/load-files")
require('dotenv').config();


// express server
const app = express();

// DB
const db = async () => {
    try {
        const success = await mongoose.connect(process.env.DATABASE_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('DB Connected')

    } catch (error) {
        console.log(error)
    }
};

// execute database connection
db();

// typeDefs
const typeDefs = mergeTypeDefs(loadFilesSync(path.join(__dirname, "./typeDefs")));
// resolvers
const resolvers = mergeResolvers(
    loadFilesSync(path.join(__dirname, "./resolvers"))
);

// Graphql Server
// applyMiddleware method connects ApolloServer to a specific HTTP framework ie: express

let apolloServer = null;

async function startServer() {

    apolloServer = new ApolloServer({

        typeDefs,

        resolvers,

    });

    await apolloServer.start();

    apolloServer.applyMiddleware({ app });

}

startServer();

// Server
const httpserver = http.createServer(app)

app.get('/rest', function (req, res) {
    res.json({
        data: 'you hit rest endpoint'
    })
})



// port
app.listen(process.env.PORT, function () {

    console.log(`listening to port number ${process.env.PORT}`);

    console.log(`Graphql listening to port number ${process.env.PORT}${apolloServer.graphqlPath}`);

})