import {
  Environment,
  Network,
  RecordSource,
  Store,
  createOperationDescriptor,
  getRequest,
  type GraphQLResponse,
} from "relay-runtime";
import { graphql } from "react-relay";

export const HomeQuery = graphql`
  query relayHomeQuery {
    profile {
      id
      name
      handle
      bio
    }
    posts {
      id
      ...PostCard_post
    }
    stats {
      postCount
      totalLikes
      cache
    }
  }
`;

export function createRelayEnvironment(initialData?: GraphQLResponse) {
  const environment = new Environment({
    network: Network.create(async (operation, variables) => {
      const response = await fetch("/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: operation.text, variables }),
      });
      if (!response.ok) throw new Error(`GraphQL request failed: ${response.status}`);
      return response.json();
    }),
    store: new Store(new RecordSource()),
  });
  if (initialData && "data" in initialData && initialData.data) {
    environment.commitPayload(
      createOperationDescriptor(getRequest(HomeQuery), {}),
      initialData.data,
    );
  }
  return environment;
}
