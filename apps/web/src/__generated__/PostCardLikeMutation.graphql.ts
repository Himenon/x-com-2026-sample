/**
 * @generated SignedSource<<84dc346576f22a25fe0bb51ffb721c05>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PostCardLikeMutation$variables = {
  id: string;
};
export type PostCardLikeMutation$data = {
  readonly likePost: {
    readonly id: string;
    readonly likes: number;
  };
};
export type PostCardLikeMutation = {
  response: PostCardLikeMutation$data;
  variables: PostCardLikeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "Post",
    "kind": "LinkedField",
    "name": "likePost",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "likes",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "PostCardLikeMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PostCardLikeMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "d722173ae7bdf0b4be7257d1049b5870",
    "id": null,
    "metadata": {},
    "name": "PostCardLikeMutation",
    "operationKind": "mutation",
    "text": "mutation PostCardLikeMutation(\n  $id: ID!\n) {\n  likePost(id: $id) {\n    id\n    likes\n  }\n}\n"
  }
};
})();

(node as any).hash = "c78cb87ff1e550188d609c0a68bf3630";

export default node;
