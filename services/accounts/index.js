const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const typeDefs = gql`
  extend type Query {
    me: User
  }

  type UserMetadata {
    name: String
    address: String
    description: String
  }

  type User @key(fields: "id") {
    id: ID!
    name: String
    username: String
    metadata: [UserMetadata]
  }
`;

const resolvers = {
  Query: {
    me() {
      return users[0];
    }
  },
  User: {
    __resolveReference(object) {
      return users.find(user => user.id === object.id);
    },
    metadata(object, args, context, info) {
      const metaIndex = metadata.findIndex(m => m.id === object.id);
      return metadata[metaIndex].metadata.map(obj => ({ name: obj.name }));
    }
  },
  UserMetadata: {
    address(object) {
      const metaIndex = metadata.findIndex(m => m.metadata.find(o => o.name === object.name));
      return metadata[metaIndex].metadata[0].address;
    },
    description(object) {
      const metaIndex = metadata.findIndex(m => m.metadata.find(o => o.name === object.name));
      return metadata[metaIndex].metadata[0].description;
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

server.listen({ port: 4001 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const users = [
  {
    id: "1",
    name: "Ada Lovelace",
    birthDate: "1815-12-10",
    username: "@ada"
  },
  {
    id: "2",
    name: "Alan Turing",
    birthDate: "1912-06-23",
    username: "@complete"
  }
];

const metadata = [
  {
    id: "1",
    metadata: [{ name: "meta1", address: "1", description: "2"}]
  },
  {
    id: "2",
    metadata: [{ name: "meta2", address: "3", description: "4"}]
  }
];
