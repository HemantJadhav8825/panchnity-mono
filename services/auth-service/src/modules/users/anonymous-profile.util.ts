
export const ADJECTIVES = [
  'Quiet', 'Brave', 'Calm', 'Gentle', 'Silent', 'Wise', 'Kind', 'Patient', 'Strong', 'Deep',
  'Bright', 'Soft', 'Steady', 'Warm', 'Cool', 'Fresh', 'Still', 'Proud', 'Humble', 'Swift',
  'Ancient', 'Young', 'Eager', 'Peaceful', 'Happy', 'Hopeful', 'Safe', 'Free', 'True', 'Pure'
];

export const NOUNS = [
  'Willow', 'Ocean', 'Mountain', 'River', 'Sky', 'Forest', 'Star', 'Moon', 'Sun', 'Rain',
  'Wind', 'Cloud', 'Tree', 'Leaf', 'Flower', 'Stone', 'Bird', 'Bear', 'Wolf', 'Eagle',
  'Lion', 'Tiger', 'Deer', 'Fish', 'Whale', 'Dolphin', 'Cedar', 'Oak', 'Pine', 'Rose'
];

export const AVATAR_COLORS = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF',
  '#33FFF5', '#FF8C33', '#8C33FF', '#33FF8C', '#FF3333'
];

export interface AnonymousProfileData {
  pseudonym: string;
  color: string;
}

export function generateAnonymousProfile(): AnonymousProfileData {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  return {
    pseudonym: `${adj} ${noun}`,
    color,
  };
}
