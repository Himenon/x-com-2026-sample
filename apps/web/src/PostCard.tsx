import { graphql, useFragment, useMutation } from "react-relay";
import type { PostCard_post$key } from "./__generated__/PostCard_post.graphql";
import type { PostCardLikeMutation } from "./__generated__/PostCardLikeMutation.graphql";

// 記事と同様に、コンポーネントが必要とするフィールドをフラグメントで宣言する。
const postFragment = graphql`
  fragment PostCard_post on Post {
    id
    body
    createdAt
    likes
    author {
      name
      handle
    }
  }
`;
const likeMutation = graphql`
  mutation PostCardLikeMutation($id: ID!) {
    likePost(id: $id) {
      id
      likes
    }
  }
`;

export function PostCard({ post }: { post: PostCard_post$key }) {
  const data = useFragment(postFragment, post);
  const [like, pending] = useMutation<PostCardLikeMutation>(likeMutation);
  return (
    <article className="post">
      <div className="avatar avatar-small" aria-hidden="true">
        S
      </div>
      <div className="post-content">
        <div className="post-meta">
          <strong>{data.author.name}</strong>
          <span>@{data.author.handle}</span>
          <span>·</span>
          <time dateTime={data.createdAt}>{data.createdAt.slice(0, 10)}</time>
        </div>
        <p>{data.body}</p>
        <div className="post-actions">
          <button
            className="like-button"
            disabled={pending}
            onClick={() =>
              like({
                variables: { id: data.id },
                // 投稿の更新後に集計を別途取得し、画面上の合計を更新する。
                onCompleted: () => {
                  window.dispatchEvent(new Event("stats:refresh"));
                },
              })
            }
            aria-label={`いいね ${data.likes} 件`}
          >
            ♡ <span>{data.likes}</span>
          </button>
          <span>
            ↗ <span className="action-caption">Share</span>
          </span>
        </div>
      </div>
    </article>
  );
}
