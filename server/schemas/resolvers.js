//defines the resolver functions for a GraphQL API. These resolvers handle the logic for executing the queries 
//and mutations defined in the GraphQL schema

const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

//responsible for fetching the currently authenticated user's data
const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (context.user) {
        const populatedUser = await User.findOne({ _id: context.user._id }).populate('savedBooks');
        return populatedUser;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  //creates a new user in the database using the User.create method. It takes username, email, and password as arguments. After creating
  //the user, it generates a JSON Web Token (JWT) using the signToken function and returns both the token and the new user object.
  Mutation: {
    addUser: async (_, { username, email, password }) => {
      const newUser = await User.create({ username, email, password });
      const token = signToken(newUser);
      return { token, user: newUser };
    },

    //authenticates a user by finding the user with the provided email using User.findOne. If the user is not found or the 
    //provided password is incorrect (checked using the user.isCorrectPassword method), it throws an AuthenticationError. 
    // If the credentials are valid, it generates a JWT using the signToken function and returns both the token and the user object.

    loginUser: async (_, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Invalid credentials');
      }

      const isCorrectPassword = await user.isCorrectPassword(password);

      if (!isCorrectPassword) {
        throw new AuthenticationError('Invalid credentials');
      }

      const token = signToken(user);
      return { token, user };
    },

    //allows an authenticated user to save a book to their savedBooks list
    saveBook: async (_, { input }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      }

      throw new AuthenticationError('You need to be logged in!');
    },
    //allows an authenticated user to remove a book from their savedBooks list
    
    removeBook: async (_, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');

        return updatedUser;
      }

      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;