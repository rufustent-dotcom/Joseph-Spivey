import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  orderBy, 
  where,
  increment,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db, auth, isRealFirebase, handleFirestoreError, OperationType } from "./firebase";

export interface UserProfile {
  uid: string;
  username: string;
  avatarUrl: string;
  followers: string[]; // List of follower UIDs
  following: string[]; // List of followed UIDs
  history: { id: string; action: string; timestamp: string }[];
  savedProjectsCount: number;
}

export interface FeedPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  likesCount: number;
  likes: string[]; // Array of user UIDs who liked
  commentsCount: number;
  createdAt: string;
  associatedFile?: string; // Opt file link from workspace
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

// Initial mock-data for community posts so the feed feels active from the start
export const INITIAL_COMMUNITY_POSTS: FeedPost[] = [
  {
    id: "post_1",
    title: "Synthesizing Neural Flow Schematics",
    content: "Just mapped our new Multi-Agent intelligence network. I used the 'Adaptation Compounds Advantage' pattern to route incoming market signals automatically over our vector memory stores. The overall system efficiency gains are massive!",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    authorId: "user_quantum_arch",
    authorName: "Quantum_Architect",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    likesCount: 52,
    likes: ["user_cyber_sage"],
    commentsCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
  },
  {
    id: "post_2",
    title: "The Architecture of Brevity: Balancing Sprints",
    content: "When data loads explode, intelligence architects must enforce cognitive decompression. Added my team's custom 'Breathing Space' protocol to our project files index. Keep your neural workspace tidy, and remember to pause.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    authorId: "user_cyber_sage",
    authorName: "Cyber_Sage",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    likesCount: 38,
    likes: [],
    commentsCount: 1,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString() // 12 hours ago
  },
  {
    id: "post_3",
    title: "Leaping Forward with Open-Source Models",
    content: "Comparing open-source Copilot models against commercial engines. Found huge advantages in deploying local agents for custom tasks. Check out our comparative reports!",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80",
    authorId: "user_helix_ventures",
    authorName: "Helix_Ventures",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    likesCount: 21,
    likes: ["user_quantum_arch"],
    commentsCount: 0,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  }
];

export const INITIAL_COMMENTS: Record<string, PostComment[]> = {
  "post_1": [
    {
      id: "c1",
      postId: "post_1",
      authorId: "user_cyber_sage",
      authorName: "Cyber_Sage",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
      content: "This is brilliant! Mind sharing the raw Obsidian markdown file? The adaptation weighting seems incredibly precise.",
      createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString()
    },
    {
      id: "c2",
      postId: "post_1",
      authorId: "user_helix_ventures",
      authorName: "Helix_Ventures",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
      content: "Incredible. We were hitting a wall routing high-frequency signals, but your connection layout solves this perfectly.",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  "post_2": [
    {
      id: "c3",
      postId: "post_2",
      authorId: "user_quantum_arch",
      authorName: "Quantum_Architect",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
      content: "Deeply agree with the breathing space concept. Throttling active inputs restored our core execution bandwidth entirely.",
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
    }
  ]
};

// --- USER PROFILE OPERATIONS ---

export async function fetchUserProfile(uid: string): Promise<UserProfile> {
  const localKey = `social_profile_${uid}`;
  
  if (isRealFirebase && db && auth?.currentUser) {
    try {
      const docRef = doc(db, "userProfiles", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        // Cache to local as fallback configuration
        localStorage.setItem(localKey, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn("Could not fetch user profile from Firestore, falling back to local cache/simulation.", err);
    }
  }

  // Fallback to local storage or create base default profile
  const saved = localStorage.getItem(localKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // JSON crash fallback
    }
  }

  const defaultProfile: UserProfile = {
    uid,
    username: `Strategist_${Math.floor(1000 + Math.random() * 9000)}`,
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`, // default friendly tech avatar
    followers: [],
    following: [],
    history: [
      { id: "h1", action: "System initialized. Strategic intelligence workspace active.", timestamp: new Date().toISOString() }
    ],
    savedProjectsCount: 9
  };
  localStorage.setItem(localKey, JSON.stringify(defaultProfile));
  return defaultProfile;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const localKey = `social_profile_${profile.uid}`;
  localStorage.setItem(localKey, JSON.stringify(profile));

  if (isRealFirebase && db && auth?.currentUser && auth.currentUser.uid === profile.uid) {
    try {
      const docRef = doc(db, "userProfiles", profile.uid);
      await setDoc(docRef, profile, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `userProfiles/${profile.uid}`);
    }
  }
}

// --- FEED & POST OPERATIONS ---

export async function fetchPosts(): Promise<FeedPost[]> {
  const localKey = "social_posts_feed";
  
  if (isRealFirebase && db && auth?.currentUser) {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnap = await getDocs(q);
      const firestorePosts: FeedPost[] = [];
      querySnap.forEach((doc) => {
        firestorePosts.push({ id: doc.id, ...doc.data() } as FeedPost);
      });
      if (firestorePosts.length > 0) {
        localStorage.setItem(localKey, JSON.stringify(firestorePosts));
        return firestorePosts;
      }
    } catch (err) {
      console.warn("Could not fetch posts from Firestore, reading cached/mock feed flow.", err);
    }
  }

  const saved = localStorage.getItem(localKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  // Populate mock data if no feed existed
  localStorage.setItem(localKey, JSON.stringify(INITIAL_COMMUNITY_POSTS));
  return INITIAL_COMMUNITY_POSTS;
}

export async function createPost(post: Omit<FeedPost, "likesCount" | "likes" | "commentsCount">): Promise<FeedPost> {
  const newPost: FeedPost = {
    ...post,
    likesCount: 0,
    likes: [],
    commentsCount: 0
  };

  // 1. Write to local state/cache first
  const localKey = "social_posts_feed";
  const currentPosts = await fetchPosts();
  const updatedPosts = [newPost, ...currentPosts];
  localStorage.setItem(localKey, JSON.stringify(updatedPosts));

  // 2. Write to Firebase live if authorized
  if (isRealFirebase && db && auth?.currentUser) {
    try {
      const docRef = doc(db, "posts", newPost.id);
      await setDoc(docRef, newPost);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `posts/${newPost.id}`);
    }
  }

  return newPost;
}

export async function toggleLikePost(postId: string, userId: string): Promise<boolean> {
  // Returns true if liked, false if unliked
  const localKey = "social_posts_feed";
  const currentPosts = await fetchPosts();
  let likedState = false;

  const updatedPosts = currentPosts.map((p) => {
    if (p.id === postId) {
      const alreadyLiked = p.likes.includes(userId);
      likedState = !alreadyLiked;
      const newLikes = alreadyLiked 
        ? p.likes.filter((uid) => uid !== userId)
        : [...p.likes, userId];
      return {
        ...p,
        likes: newLikes,
        likesCount: newLikes.length
      };
    }
    return p;
  });

  localStorage.setItem(localKey, JSON.stringify(updatedPosts));

  if (isRealFirebase && db && auth?.currentUser) {
    try {
      const docRef = doc(db, "posts", postId);
      if (likedState) {
        await updateDoc(docRef, {
          likes: arrayUnion(userId),
          likesCount: increment(1)
        });
      } else {
        await updateDoc(docRef, {
          likes: arrayRemove(userId),
          likesCount: increment(-1)
        });
      }
    } catch (err) {
      console.error("Firestore like failed:", err);
    }
  }

  return likedState;
}

// --- COMMENT OPERATIONS ---

export async function fetchComments(postId: string): Promise<PostComment[]> {
  const localKey = `social_comments_${postId}`;

  if (isRealFirebase && db && auth?.currentUser) {
    try {
      const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
      const querySnap = await getDocs(q);
      const firestoreComments: PostComment[] = [];
      querySnap.forEach((doc) => {
        firestoreComments.push({ id: doc.id, ...doc.data() } as PostComment);
      });
      localStorage.setItem(localKey, JSON.stringify(firestoreComments));
      return firestoreComments;
    } catch (err) {
      console.warn(`Firestore comment load failed for ${postId}, using cache.`, err);
    }
  }

  const saved = localStorage.getItem(localKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }

  // Load from initial mock if applicable
  const originalComments = INITIAL_COMMENTS[postId] || [];
  localStorage.setItem(localKey, JSON.stringify(originalComments));
  return originalComments;
}

export async function createComment(postId: string, comment: PostComment): Promise<PostComment> {
  // Update comments collection
  const localCommentsKey = `social_comments_${postId}`;
  const currentComments = await fetchComments(postId);
  const updatedComments = [...currentComments, comment];
  localStorage.setItem(localCommentsKey, JSON.stringify(updatedComments));

  // Update post counts inside feed
  const localPostsKey = "social_posts_feed";
  const currentPosts = await fetchPosts();
  const updatedPosts = currentPosts.map((p) => {
    if (p.id === postId) {
      return {
        ...p,
        commentsCount: (p.commentsCount || 0) + 1
      };
    }
    return p;
  });
  localStorage.setItem(localPostsKey, JSON.stringify(updatedPosts));

  if (isRealFirebase && db && auth?.currentUser) {
    try {
      // 1. Create comment doc
      const commentDocRef = doc(db, "posts", postId, "comments", comment.id);
      await setDoc(commentDocRef, comment);

      // 2. Increment comment count on principal post doc
      const postDocRef = doc(db, "posts", postId);
      await updateDoc(postDocRef, {
        commentsCount: increment(1)
      });
    } catch (err) {
      console.error("Syncing comment to Firestore failed:", err);
    }
  }

  return comment;
}
