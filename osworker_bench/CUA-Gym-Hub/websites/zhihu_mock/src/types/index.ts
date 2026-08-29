
export interface User {
  userId: string;
  nickname: string;
  avatar: string;
  headline: string;
  description: string;
  gender: 'male' | 'female' | 'other';
  location: string;
  industry: string;
  employment: Employment[];
  education: Education[];
  followingCount: number;
  followerCount: number;
  voteupCount: number;
  thankedCount: number;
  favoriteCount: number;
  answerCount: number;
  articleCount: number;
  questionCount: number;
}

export interface Employment {
  company: string;
  job: string;
}

export interface Education {
  school: string;
  major: string;
}

export interface Question {
  questionId: string;
  title: string;
  description: string;
  topics: string[];
  authorId: string;
  createdTime: number;
  updatedTime: number;
  followerCount: number;
  viewCount: number;
  answerCount: number;
}

export interface Answer {
  answerId: string;
  questionId: string;
  authorId: string;
  content: string;
  createdTime: number;
  updatedTime: number;
  voteupCount: number;
  commentCount: number;
  favoriteCount: number;
  thankCount: number;
}

export interface Article {
  articleId: string;
  title: string;
  content: string;
  coverImage: string;
  authorId: string;
  columnId?: string;
  topics: string[];
  createdTime: number;
  updatedTime: number;
  viewCount: number;
  voteupCount: number;
  commentCount: number;
  favoriteCount: number;
}

export interface Comment {
  commentId: string;
  targetId: string;
  targetType: 'answer' | 'article' | 'idea' | 'comment';
  authorId: string;
  content: string;
  createdTime: number;
  voteupCount: number;
  replies: Comment[];
}

export interface Topic {
  topicId: string;
  name: string;
  icon: string;
  description: string;
  followerCount: number;
  questionCount: number;
  parentId?: string;
}

export interface Collection {
  collectionId: string;
  name: string;
  description: string;
  privacy: 'public' | 'private';
  itemIds: string[];
  itemTypes: ('answer' | 'article' | 'idea')[];
  createdTime: number;
  updatedTime: number;
}

export interface Notification {
  notificationId: string;
  type: 'voteup' | 'comment' | 'follow' | 'favorite' | 'thank' | 'invite' | 'system';
  fromUserId?: string;
  targetId?: string;
  targetType?: 'answer' | 'article' | 'question' | 'comment';
  content: string;
  isRead: boolean;
  createdTime: number;
}

export interface Idea {
  ideaId: string;
  authorId: string;
  content: string;
  images: string[];
  topics: string[];
  createdTime: number;
  voteupCount: number;
  commentCount: number;
  shareCount: number;
}

export interface AppState {
  currentUser: User;
  users: User[];
  questions: Question[];
  answers: Answer[];
  articles: Article[];
  comments: { [key: string]: Comment[] };
  topics: Topic[];
  collections: Collection[];
  notifications: Notification[];
  ideas: Idea[];
  userVoteups: { [key: string]: boolean };
  userFavorites: { [key: string]: boolean };
  userFollowings: { [key: string]: boolean };
  userFollowedTopics: { [key: string]: boolean };
  userFollowedQuestions: { [key: string]: boolean };
  userCommentVoteups: { [key: string]: boolean };
}
  