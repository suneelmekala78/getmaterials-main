/** Average of materials that actually have reviews. `$avg` ignores null. */
export const ratedAverageExpr = {
  $avg: {
    $cond: [
      { $gt: [{ $ifNull: ["$rating.count", 0] }, 0] },
      "$rating.average",
      null,
    ],
  },
};
