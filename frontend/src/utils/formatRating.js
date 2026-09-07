export function getRatingColor(rating) {
  if (!rating) return "#9ca3af";
  if (rating >= 3000) return "#ff0000";
  if (rating >= 2600) return "#ff3333";
  if (rating >= 2400) return "#ff7777";
  if (rating >= 2300) return "#ffbb55";
  if (rating >= 2100) return "#ffcc88";
  if (rating >= 1900) return "#ff88ff";
  if (rating >= 1600) return "#aaaaff";
  if (rating >= 1400) return "#77ddbb";
  if (rating >= 1200) return "#77ff77";
  return "#cccccc";
}

export function getRatingTitle(rating) {
  if (!rating) return "Unrated";
  if (rating >= 3000) return "Legendary Grandmaster";
  if (rating >= 2600) return "International Grandmaster";
  if (rating >= 2400) return "Grandmaster";
  if (rating >= 2300) return "International Master";
  if (rating >= 2100) return "Master";
  if (rating >= 1900) return "Candidate Master";
  if (rating >= 1600) return "Expert";
  if (rating >= 1400) return "Specialist";
  if (rating >= 1200) return "Pupil";
  return "Newbie";
}

export function formatRatingChange(change) {
  if (change === null || change === undefined) return "—";
  if (change > 0) return `+${change}`;
  return String(change);
}
