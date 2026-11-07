import { makeExecutableSchema } from "@graphql-tools/schema";
import { likePost, posts, profile, stats } from "@sample/database";
import { readFileSync } from "node:fs";

// The schema is copied next to the production server bundle by the build.
const typeDefs = readFileSync(new URL("./schema.graphql", import.meta.url), "utf8");
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers: {
    Query: { profile, posts, stats },
    Mutation: { likePost: (_root: unknown, args: { id: string }) => likePost(args.id) },
    Post: { author: profile },
  },
});
