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
  isOwner?: boolean;
  userSupport?: SupportType; // The type of support the current user has given, if any
}

export enum SupportType {
  HEARD = 'HEARD',
  HUG = 'HUG',
  SOLIDARITY = 'SOLIDARITY',
  PRAYER = 'PRAYER'
}

export interface CommentDTO {
  id: string;
  authorId: string;
  shareId: string;
  content: string;
  createdAt: string;
  isOwner?: boolean; // Frontend computed
  anonymous: boolean;
}
