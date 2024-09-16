

//imports the GraphQLError class from the graphql package, which will be used to create a custom error object for authentication errors.
const { GraphQLError } = require('graphql');
//imports the jsonwebtoken package, which will be used to sign and verify JSON Web Tokens (JWT).
const jwt = require('jsonwebtoken');
//defines the secret and expiration time for the JWT.
const secret = 'mysecretssshhhhhhh';
const expiration = '2h';

//exports the AuthenticationError (a custom GraphQL error object that can be thrown when authentication fails)
// and authMiddleware (middleware function that can be used to authenticate incoming requests) functions, as well as the 
//signToken (generates a new JWT token using the jwt.sign method) function.
module.exports = {
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  }),
  authMiddleware: function ({ req }) {
    let token = req.body.token || req.query.token || req.headers.authorization;

    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req;
    }

    try {
      const { authenticatedPerson } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = authenticatedPerson;
    } catch {
      console.log('Invalid token');
    }

    return req;
  },
  signToken: function ({ email, username, _id }) {
    const payload = { email, username, _id };
    return jwt.sign({ authenticatedPerson: payload }, secret, { expiresIn: expiration });
  },
};