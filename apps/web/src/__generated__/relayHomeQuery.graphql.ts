/**
 * @generated SignedSource<<3211befea0f7f22ef32c0c39f1f47f9c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type relayHomeQuery$variables = Record<PropertyKey, never>;
export type relayHomeQuery$data = {
  readonly posts: ReadonlyArray<{
    readonly id: string;
    readonly " $fragmentSpreads": FragmentRefs<"PostCard_post">;
  }>;
  readonly profile: {
    readonly bio: string;
    readonly handle: string;
    readonly id: string;
    readonly name: string;
  };
  readonly stats: {
    readonly cache: string;
    readonly postCount: number;
    readonly totalLikes: number;
  };
};
export type relayHomeQuery = {
  response: relayHomeQuery$data;
  variables: relayHomeQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "handle",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "Profile",
  "kind": "LinkedField",
  "name": "profile",
  "plural": false,
  "selections": [
    (v0/*:: as any*/),
    (v1/*:: as any*/),
    (v2/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "bio",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "Stats",
  "kind": "LinkedField",
  "name": "stats",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "postCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "totalLikes",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "cache",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "relayHomeQuery",
    "selections": [
      (v3/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Post",
        "kind": "LinkedField",
        "name": "posts",
        "plural": true,
        "selections": [
          (v0/*:: as any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "PostCard_post"
          }
        ],
        "storageKey": null
      },
      (v4/*:: as any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "relayHomeQuery",
    "selections": [
      (v3/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Post",
        "kind": "LinkedField",
        "name": "posts",
        "plural": true,
        "selections": [
          (v0/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "body",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "createdAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "likes",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "Profile",
            "kind": "LinkedField",
            "name": "author",
            "plural": false,
            "selections": [
              (v1/*:: as any*/),
              (v2/*:: as any*/),
              (v0/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v4/*:: as any*/)
    ]
  },
  "params": {
    "cacheID": "0cc9b5f946c832842b264971541f1bfe",
    "id": null,
    "metadata": {},
    "name": "relayHomeQuery",
    "operationKind": "query",
    "text": "query relayHomeQuery {\n  profile {\n    id\n    name\n    handle\n    bio\n  }\n  posts {\n    id\n    ...PostCard_post\n  }\n  stats {\n    postCount\n    totalLikes\n    cache\n  }\n}\n\nfragment PostCard_post on Post {\n  id\n  body\n  createdAt\n  likes\n  author {\n    name\n    handle\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "663d1c46269247708d709406334ee40b";

export default node;
