export interface ShareDTO {
  id: string;
  authorId: string; // Will be "anonymous" if anonymous is true
  content: string;
  visibility: 'public' | 'followers';
  anonymous: boolean;
  commentsEnabled: boolean;
  sensitivityTags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateShareInput {
  content: string;
  visibility?: 'public' | 'followers';
  anonymous?: boolean;
  sensitivityTags?: string[];
}

export interface UserPreferenceDTO {
  userId: string;
  mutedTags: string[];
}

export interface UpdateShareInput {
  content?: string;
  commentsEnabled?: boolean;
}

export interface SupportDTO {
  id: string;
  shareId: string;
  type: 'WITH_YOU' | 'HOLDING' | 'HEARD' | 'SUPPORT';
  createdAt: string;
}

export interface CommentDTO {
  id: string;
  shareId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
