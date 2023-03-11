interface CommentRange {
  absoluteFrom: number;
  absoluteTo: number;
  isOverlapping?: boolean;
}

export function getOverlappingRanges(comments: CommentRange[]): CommentRange[] {
  return comments.reduce(
    (
      overlappingRanges: CommentRange[],
      currentComment: CommentRange,
      currentIndex: number
    ) => {
      const overlappingComments = comments
        .slice(currentIndex + 1)
        .filter((comment) => {
          return (
            currentComment.absoluteTo >= comment.absoluteFrom &&
            currentComment.absoluteFrom <= comment.absoluteTo
          );
        })
        .map((comment) => {
          return {
            absoluteFrom: Math.max(
              currentComment.absoluteFrom,
              comment.absoluteFrom
            ),
            absoluteTo: Math.min(currentComment.absoluteTo, comment.absoluteTo),
          };
        });

      return overlappingRanges.concat(overlappingComments);
    },
    []
  );
}
