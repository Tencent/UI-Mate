# Xinterest Mock — Data Model

> This document defines all entity types, their fields, relationships, and the `createInitialData()` structure for `dataManager.js` / `initialData.js`.

---

## Entity Types

### 1. User

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique identifier | `"u1"` |
| `username` | `string` | Unique handle (no spaces) | `"sarah_designs"` |
| `name` | `string` | Display name | `"Sarah Chen"` |
| `avatar` | `string` | URL to profile picture | `"https://i.pravatar.cc/150?u=u1"` |
| `bio` | `string` | Short about text | `"Interior designer & plant mom 🌿"` |
| `website` | `string` | Personal website URL | `"https://sarahchen.design"` |
| `followers` | `string[]` | Array of user IDs who follow this user | `["u2", "u3"]` |
| `following` | `string[]` | Array of user IDs this user follows | `["u2"]` |
| `monthlyViews` | `number` | Monthly profile views count | `12400` |
| `createdAt` | `number` | Account creation timestamp | `1672531200000` |

### 2. Pin

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique identifier | `"p1"` |
| `userId` | `string` | Author's user ID | `"u1"` |
| `title` | `string` | Pin title (max ~100 chars) | `"Minimalist Living Room Inspo"` |
| `description` | `string` | Longer description text | `"Clean lines, neutral palette..."` |
| `image` | `string` | Image URL | `"https://picsum.photos/400/600?random=p1"` |
| `imageWidth` | `number` | Original image width in px | `400` |
| `imageHeight` | `number` | Original image height in px | `600` |
| `url` | `string` | Source/destination link | `"https://example.com/article"` |
| `boardId` | `string \| null` | Board this pin belongs to (or null) | `"b1"` |
| `sectionId` | `string \| null` | Section within board (or null) | `"sec1"` |
| `altText` | `string` | Accessibility alt text | `"A minimalist white living room"` |
| `tags` | `string[]` | Category/topic tags | `["interior", "minimalist", "living room"]` |
| `likes` | `number` | Like/reaction count | `42` |
| `likedBy` | `string[]` | User IDs who liked this pin | `["u2", "u3"]` |
| `commentCount` | `number` | Number of comments (denormalized) | `3` |
| `saves` | `number` | Save count (how many users saved it) | `156` |
| `createdAt` | `number` | Pin creation timestamp | `1704067200000` |

### 3. Board

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique identifier | `"b1"` |
| `userId` | `string` | Owner's user ID | `"u1"` |
| `name` | `string` | Board name | `"Home Décor Ideas"` |
| `description` | `string` | Board description | `"Inspiration for my apartment..."` |
| `privacy` | `string` | `"public"` or `"secret"` | `"public"` |
| `coverPinId` | `string \| null` | Pin ID used as board cover | `"p1"` |
| `pins` | `string[]` | Ordered array of pin IDs | `["p1", "p2", "p5"]` |
| `sections` | `Section[]` | Array of section objects | (see Section) |
| `collaborators` | `string[]` | User IDs who can add pins | `[]` |
| `createdAt` | `number` | Board creation timestamp | `1672531200000` |
| `updatedAt` | `number` | Last modification timestamp | `1704067200000` |

### 4. Section (nested within Board)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique identifier | `"sec1"` |
| `boardId` | `string` | Parent board ID | `"b1"` |
| `name` | `string` | Section name | `"Living Room"` |
| `pins` | `string[]` | Ordered array of pin IDs in this section | `["p3", "p7"]` |

### 5. Comment

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique identifier | `"c1"` |
| `pinId` | `string` | Parent pin ID | `"p1"` |
| `userId` | `string` | Commenter's user ID | `"u2"` |
| `text` | `string` | Comment body | `"Love this color palette!"` |
| `likes` | `number` | Comment like count | `5` |
| `likedBy` | `string[]` | User IDs who liked this comment | `["u1"]` |
| `createdAt` | `number` | Comment creation timestamp | `1704067200000` |

### 6. Notification

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | `string` | Unique identifier | `"n1"` |
| `type` | `string` | `"save"`, `"follow"`, `"comment"`, `"like"`, `"board_invite"`, `"recommendation"` | `"save"` |
| `fromUserId` | `string \| null` | Acting user (null for system) | `"u2"` |
| `targetId` | `string \| null` | Pin/board/comment ID this relates to | `"p5"` |
| `message` | `string` | Display text | `"Design Guru saved your pin"` |
| `thumbnail` | `string \| null` | Small image preview URL | (pin image URL) |
| `read` | `boolean` | Whether user has seen this | `false` |
| `createdAt` | `number` | Notification timestamp | `1704153600000` |

---

## Relationships

```
User 1──* Pin          (user creates pins)
User 1──* Board        (user owns boards)
User *──* User         (follows relationship via followers/following arrays)
Board 1──* Section     (board contains sections)
Board 1──* Pin         (board contains pins via pins[] array)
Section 1──* Pin       (section contains pins via pins[] array)
Pin 1──* Comment       (pin has comments)
User 1──* Comment      (user writes comments)
User 1──* Notification (user receives notifications)
```

---

## Suggested `createInitialData()` Structure

```javascript
export function createInitialData() {
  const users = [
    {
      id: 'u1',
      username: 'sarah_designs',
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      bio: 'Interior designer & plant mom 🌿 | NYC',
      website: 'https://sarahchen.design',
      followers: ['u2', 'u3', 'u4', 'u5'],
      following: ['u2', 'u3'],
      monthlyViews: 12400,
      createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u2',
      username: 'chef_marco',
      name: 'Marco Rivera',
      avatar: 'https://i.pravatar.cc/150?u=marco',
      bio: 'Professional chef 🍳 Sharing recipes and food art',
      website: 'https://marcorivera.com',
      followers: ['u1', 'u3', 'u5'],
      following: ['u1', 'u4'],
      monthlyViews: 8900,
      createdAt: Date.now() - 300 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u3',
      username: 'wanderlust_emma',
      name: 'Emma Thompson',
      avatar: 'https://i.pravatar.cc/150?u=emma',
      bio: 'Travel photographer 📸 30 countries and counting',
      website: '',
      followers: ['u1', 'u4'],
      following: ['u1', 'u2', 'u5'],
      monthlyViews: 23100,
      createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u4',
      username: 'diy_david',
      name: 'David Park',
      avatar: 'https://i.pravatar.cc/150?u=david',
      bio: 'DIY enthusiast 🔨 Weekend warrior projects',
      website: 'https://davidpark.blog',
      followers: ['u2', 'u5'],
      following: ['u1', 'u3'],
      monthlyViews: 5600,
      createdAt: Date.now() - 150 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u5',
      username: 'fashion_nina',
      name: 'Nina Rodriguez',
      avatar: 'https://i.pravatar.cc/150?u=nina',
      bio: 'Fashion & beauty lover 💄 Styling tips daily',
      website: 'https://ninastyle.co',
      followers: ['u1', 'u3'],
      following: ['u2', 'u4'],
      monthlyViews: 18700,
      createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000
    }
  ];

  // Pin categories for realistic variety
  const pinCategories = [
    { tag: 'interior', titles: ['Minimalist Living Room', 'Cozy Reading Nook', 'Scandinavian Kitchen', 'Boho Bedroom', 'Modern Bathroom Design', 'Rustic Dining Table', 'Small Space Solutions', 'Plant Corner Ideas'] },
    { tag: 'food', titles: ['Homemade Pasta Recipe', 'Summer Salad Bowl', 'Chocolate Lava Cake', 'Avocado Toast Ideas', 'Smoothie Bowl Art', 'Japanese Ramen', 'Mediterranean Platter', 'Breakfast Inspiration'] },
    { tag: 'travel', titles: ['Santorini Sunset', 'Tokyo Street Scene', 'Patagonia Hiking Trail', 'Venice Canal View', 'Northern Lights Iceland', 'Bali Rice Terraces', 'NYC Skyline', 'Safari Adventure'] },
    { tag: 'fashion', titles: ['Fall Outfit Inspo', 'Minimalist Wardrobe', 'Street Style Paris', 'Summer Dress Collection', 'Sneaker Culture', 'Vintage Denim Looks', 'Accessory Styling', 'Capsule Wardrobe'] },
    { tag: 'diy', titles: ['Macramé Wall Hanging', 'Painted Furniture', 'Garden Planter Box', 'Candle Making', 'Concrete Planters', 'Resin Art Tutorial', 'Wood Burning Art', 'Tie-Dye T-Shirts'] },
    { tag: 'art', titles: ['Watercolor Landscape', 'Abstract Painting', 'Digital Illustration', 'Pottery Workshop', 'Calligraphy Practice', 'Sketchbook Ideas', 'Collage Art', 'Photography Tips'] }
  ];

  // Generate 50 pins with realistic variety
  const pins = [];
  let pinIndex = 1;
  pinCategories.forEach(cat => {
    cat.titles.forEach((title, i) => {
      const id = `p${pinIndex}`;
      const userId = users[pinIndex % users.length].id;
      const height = 300 + Math.floor(Math.random() * 500); // 300-800
      pins.push({
        id,
        userId,
        title,
        description: `Beautiful ${cat.tag} inspiration. ${title} — discover more ideas and save to your boards.`,
        image: `https://picsum.photos/400/${height}?random=${id}`,
        imageWidth: 400,
        imageHeight: height,
        url: `https://example.com/${cat.tag}/${i + 1}`,
        boardId: null,
        sectionId: null,
        altText: `${title} - ${cat.tag} category`,
        tags: [cat.tag, title.split(' ')[0].toLowerCase()],
        likes: Math.floor(Math.random() * 200),
        likedBy: [],
        commentCount: Math.floor(Math.random() * 10),
        saves: Math.floor(Math.random() * 500),
        createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
      pinIndex++;
    });
  });

  // Boards for current user (u1)
  const boards = [
    {
      id: 'b1',
      userId: 'u1',
      name: 'Home Décor Ideas',
      description: 'Inspiration for my apartment renovation',
      privacy: 'public',
      coverPinId: 'p1',
      pins: ['p1', 'p2', 'p3', 'p4', 'p5'],
      sections: [
        { id: 'sec1', boardId: 'b1', name: 'Living Room', pins: ['p1', 'p3'] },
        { id: 'sec2', boardId: 'b1', name: 'Kitchen', pins: ['p2'] }
      ],
      collaborators: [],
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b2',
      userId: 'u1',
      name: 'Recipes to Try',
      description: 'Delicious meals and snacks to cook',
      privacy: 'public',
      coverPinId: 'p9',
      pins: ['p9', 'p10', 'p11', 'p12'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b3',
      userId: 'u1',
      name: 'Travel Bucket List',
      description: 'Places I want to visit someday',
      privacy: 'public',
      coverPinId: 'p17',
      pins: ['p17', 'p18', 'p19', 'p20'],
      sections: [
        { id: 'sec3', boardId: 'b3', name: 'Europe', pins: ['p17', 'p20'] },
        { id: 'sec4', boardId: 'b3', name: 'Asia', pins: ['p18'] }
      ],
      collaborators: [],
      createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b4',
      userId: 'u1',
      name: 'Gift Ideas',
      description: 'Birthday and holiday gift inspiration',
      privacy: 'secret',
      coverPinId: null,
      pins: ['p33', 'p37'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b5',
      userId: 'u1',
      name: 'DIY Projects',
      description: 'Weekend projects to try',
      privacy: 'public',
      coverPinId: 'p33',
      pins: ['p33', 'p34', 'p35'],
      sections: [],
      collaborators: ['u4'],
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000
    },
    // Boards for other users
    {
      id: 'b6',
      userId: 'u2',
      name: 'My Best Recipes',
      description: 'Tried and tested favorites',
      privacy: 'public',
      coverPinId: 'p10',
      pins: ['p10', 'p14', 'p15'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b7',
      userId: 'u3',
      name: 'Dream Destinations',
      description: 'Travel photography collection',
      privacy: 'public',
      coverPinId: 'p19',
      pins: ['p17', 'p19', 'p21', 'p22'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 80 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000
    }
  ];

  // Assign boardIds to pins that are in boards
  boards.forEach(board => {
    board.pins.forEach(pinId => {
      const pin = pins.find(p => p.id === pinId);
      if (pin && !pin.boardId) {
        pin.boardId = board.id;
      }
    });
    board.sections.forEach(section => {
      section.pins.forEach(pinId => {
        const pin = pins.find(p => p.id === pinId);
        if (pin) {
          pin.sectionId = section.id;
        }
      });
    });
  });

  // Generate comments
  const comments = [
    { id: 'c1', pinId: 'p1', userId: 'u2', text: 'Love this color palette! Where is that couch from?', likes: 3, likedBy: ['u1'], createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { id: 'c2', pinId: 'p1', userId: 'u3', text: 'Those plants really complete the room 🌱', likes: 7, likedBy: ['u1', 'u2'], createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000 },
    { id: 'c3', pinId: 'p1', userId: 'u4', text: 'Just saved this to my home reno board!', likes: 1, likedBy: [], createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { id: 'c4', pinId: 'p9', userId: 'u1', text: 'Made this last weekend — turned out amazing!', likes: 12, likedBy: ['u2', 'u3'], createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 },
    { id: 'c5', pinId: 'p9', userId: 'u5', text: 'What type of flour did you use?', likes: 0, likedBy: [], createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { id: 'c6', pinId: 'p17', userId: 'u4', text: 'Santorini is on my bucket list! Any tips?', likes: 4, likedBy: ['u3'], createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    { id: 'c7', pinId: 'p17', userId: 'u3', text: 'Go in September — fewer crowds, perfect weather!', likes: 8, likedBy: ['u1', 'u4'], createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 },
    { id: 'c8', pinId: 'p25', userId: 'u5', text: 'This outfit is everything 😍', likes: 15, likedBy: ['u1', 'u2', 'u3'], createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { id: 'c9', pinId: 'p33', userId: 'u1', text: 'Tried this and it took me 3 hours but worth it!', likes: 6, likedBy: ['u4'], createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000 },
    { id: 'c10', pinId: 'p41', userId: 'u2', text: 'Beautiful brushwork! What brand of watercolors?', likes: 2, likedBy: [], createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 }
  ];

  // Generate notifications for current user
  const notifications = [
    { id: 'n1', type: 'save', fromUserId: 'u2', targetId: 'p1', message: 'Marco Rivera saved your pin', thumbnail: null, read: false, createdAt: Date.now() - 1 * 60 * 60 * 1000 },
    { id: 'n2', type: 'follow', fromUserId: 'u5', targetId: null, message: 'Nina Rodriguez started following you', thumbnail: null, read: false, createdAt: Date.now() - 3 * 60 * 60 * 1000 },
    { id: 'n3', type: 'comment', fromUserId: 'u3', targetId: 'p1', message: 'Emma Thompson commented on your pin', thumbnail: null, read: false, createdAt: Date.now() - 5 * 60 * 60 * 1000 },
    { id: 'n4', type: 'like', fromUserId: 'u4', targetId: 'p9', message: 'David Park liked your pin', thumbnail: null, read: true, createdAt: Date.now() - 12 * 60 * 60 * 1000 },
    { id: 'n5', type: 'save', fromUserId: 'u3', targetId: 'p2', message: 'Emma Thompson saved your pin', thumbnail: null, read: true, createdAt: Date.now() - 24 * 60 * 60 * 1000 },
    { id: 'n6', type: 'recommendation', fromUserId: null, targetId: 'p45', message: 'New ideas for "Home Décor"', thumbnail: null, read: true, createdAt: Date.now() - 48 * 60 * 60 * 1000 },
    { id: 'n7', type: 'board_invite', fromUserId: 'u4', targetId: 'b5', message: 'David Park invited you to "Weekend Woodworking"', thumbnail: null, read: false, createdAt: Date.now() - 6 * 60 * 60 * 1000 },
    { id: 'n8', type: 'comment', fromUserId: 'u2', targetId: 'p17', message: 'Marco Rivera replied to your comment', thumbnail: null, read: true, createdAt: Date.now() - 36 * 60 * 60 * 1000 }
  ];

  return {
    currentUser: users[0],  // Sarah Chen — pre-logged-in
    users,
    pins,
    boards,
    comments,
    notifications,
    searchQuery: '',
    searchFilters: [],       // Active category filter chips
    selectedCategory: null   // Currently selected explore category
  };
}
```

---

## State Shape Summary

```javascript
{
  currentUser: User,           // The logged-in user (always users[0])
  users: User[],               // All users (5 total)
  pins: Pin[],                 // All pins (48 total, 8 per category × 6 categories)
  boards: Board[],             // All boards (7 total, 5 for u1 + 2 for others)
  comments: Comment[],         // All comments (10 total, spread across pins)
  notifications: Notification[], // Current user's notifications (8 total)
  searchQuery: string,         // Current search text
  searchFilters: string[],     // Active filter chips (e.g., ["interior", "minimalist"])
  selectedCategory: string | null // Selected explore category
}
```

---

## Normalizer Field Mappings

The existing code already handles alternate field names during state injection. Keep these mappings:

| Canonical Field | Alternate Names |
|----------------|----------------|
| `pin.userId` | `user`, `authorId`, `author` |
| `pin.image` | `img`, `src`, `imageUrl` |
| `pin.description` | `desc`, `text`, `body` |
| `pin.url` | `link`, `sourceUrl` |
| `board.name` | `title` |
| `section.name` | `title` |
| `user.avatar` | `image`, `photo`, `profileImage` |
| `user.username` | `handle` |
| `comment.text` | `body`, `content`, `message` |
