import { generateId, getRandomInt } from '../lib/utils';

// --- Seed Data ---

function createInitialData() {
  const users = [
    {
      id: 'u1',
      username: 'sarah_designs',
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      bio: 'Interior designer & plant mom | NYC',
      website: 'https://sarahchen.design',
      followers: ['u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
      following: ['u2', 'u3', 'u5'],
      monthlyViews: 12400,
      createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u2',
      username: 'chef_marco',
      name: 'Marco Rivera',
      avatar: 'https://i.pravatar.cc/150?u=marco',
      bio: 'Professional chef sharing recipes and food art',
      website: 'https://marcorivera.com',
      followers: ['u1', 'u3', 'u5', 'u7'],
      following: ['u1', 'u4'],
      monthlyViews: 8900,
      createdAt: Date.now() - 300 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u3',
      username: 'wanderlust_emma',
      name: 'Emma Thompson',
      avatar: 'https://i.pravatar.cc/150?u=emma',
      bio: 'Travel photographer - 30 countries and counting',
      website: '',
      followers: ['u1', 'u4', 'u6'],
      following: ['u1', 'u2', 'u5'],
      monthlyViews: 23100,
      createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u4',
      username: 'diy_david',
      name: 'David Park',
      avatar: 'https://i.pravatar.cc/150?u=david',
      bio: 'DIY enthusiast - Weekend warrior projects',
      website: 'https://davidpark.blog',
      followers: ['u2', 'u5', 'u7'],
      following: ['u1', 'u3'],
      monthlyViews: 5600,
      createdAt: Date.now() - 150 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u5',
      username: 'fashion_nina',
      name: 'Nina Rodriguez',
      avatar: 'https://i.pravatar.cc/150?u=nina',
      bio: 'Fashion & beauty lover - Styling tips daily',
      website: 'https://ninastyle.co',
      followers: ['u1', 'u3', 'u6'],
      following: ['u2', 'u4'],
      monthlyViews: 18700,
      createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u6',
      username: 'artsy_alex',
      name: 'Alex Morgan',
      avatar: 'https://i.pravatar.cc/150?u=alex_art',
      bio: 'Digital artist & illustrator | Commissions open',
      website: 'https://alexmorgan.art',
      followers: ['u1', 'u2', 'u4'],
      following: ['u1', 'u3', 'u5', 'u7'],
      monthlyViews: 15200,
      createdAt: Date.now() - 250 * 24 * 60 * 60 * 1000
    },
    {
      id: 'u7',
      username: 'home_with_lily',
      name: 'Lily Watson',
      avatar: 'https://i.pravatar.cc/150?u=lily_home',
      bio: 'Home organization & decor tips | Minimalist living',
      website: 'https://homewith.lily',
      followers: ['u1', 'u3', 'u6'],
      following: ['u1', 'u2', 'u4'],
      monthlyViews: 9800,
      createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000
    }
  ];

  // Pin categories for realistic variety
  const pinCategories = [
    { tag: 'interior', titles: ['Minimalist Living Room', 'Cozy Reading Nook', 'Scandinavian Kitchen', 'Boho Bedroom', 'Modern Bathroom Design', 'Rustic Dining Table', 'Small Space Solutions', 'Plant Corner Ideas', 'Mid-Century Modern Chair', 'Japandi Style Entryway'] },
    { tag: 'food', titles: ['Homemade Pasta Recipe', 'Summer Salad Bowl', 'Chocolate Lava Cake', 'Avocado Toast Ideas', 'Smoothie Bowl Art', 'Japanese Ramen', 'Mediterranean Platter', 'Breakfast Inspiration', 'Sourdough Bread Tutorial', 'Thai Green Curry'] },
    { tag: 'travel', titles: ['Santorini Sunset', 'Tokyo Street Scene', 'Patagonia Hiking Trail', 'Venice Canal View', 'Northern Lights Iceland', 'Bali Rice Terraces', 'NYC Skyline', 'Safari Adventure', 'Amalfi Coast Drive', 'Swiss Alps Panorama'] },
    { tag: 'fashion', titles: ['Fall Outfit Inspo', 'Minimalist Wardrobe', 'Street Style Paris', 'Summer Dress Collection', 'Sneaker Culture', 'Vintage Denim Looks', 'Accessory Styling', 'Capsule Wardrobe', 'Athleisure Essentials', 'Holiday Party Outfits'] },
    { tag: 'diy', titles: ['Macrame Wall Hanging', 'Painted Furniture', 'Garden Planter Box', 'Candle Making', 'Concrete Planters', 'Resin Art Tutorial', 'Wood Burning Art', 'Tie-Dye T-Shirts', 'Embroidery Hoop Art', 'Upcycled Bookshelf'] },
    { tag: 'art', titles: ['Watercolor Landscape', 'Abstract Painting', 'Digital Illustration', 'Pottery Workshop', 'Calligraphy Practice', 'Sketchbook Ideas', 'Collage Art', 'Photography Tips', 'Oil Painting Sunset', 'Linocut Print Making'] },
    { tag: 'wedding', titles: ['Garden Wedding Setup', 'Bridal Bouquet Ideas', 'Wedding Cake Inspiration', 'Table Setting Design', 'Wedding Arch Flowers', 'Rustic Venue Decor'] },
    { tag: 'fitness', titles: ['Morning Yoga Routine', 'Home Gym Setup', 'Healthy Meal Prep', 'Running Trail Guide', 'Pilates for Beginners', 'Strength Training Plan'] }
  ];

  // Source websites for pins
  const sourceWebsites = [
    'example.com', 'designmilk.com', 'architecturaldigest.com', 'food52.com',
    'bonappetit.com', 'lonelyplanet.com', 'vogue.com', 'hgtv.com',
    'apartmenttherapy.com', 'allrecipes.com', 'travelandleisure.com',
    'etsy.com', 'amazon.com', 'target.com', 'westelm.com', 'anthropologie.com'
  ];

  // Deterministic pseudo-random using pin index as seed
  function seededRandom(seed) {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
  }

  // Generate 72 pins with realistic variety
  const pins = [];
  let pinIndex = 1;
  pinCategories.forEach(cat => {
    cat.titles.forEach((title, i) => {
      const id = `p${pinIndex}`;
      const userId = users[pinIndex % users.length].id;
      const height = 300 + Math.floor(seededRandom(pinIndex) * 500); // 300-800
      const sourceIdx = Math.floor(seededRandom(pinIndex + 50) * sourceWebsites.length);
      pins.push({
        id,
        userId,
        title,
        description: `Beautiful ${cat.tag} inspiration. ${title} - discover more ideas and save to your boards.`,
        image: `https://picsum.photos/seed/pin${pinIndex}/400/${height}`,
        imageWidth: 400,
        imageHeight: height,
        url: `https://${sourceWebsites[sourceIdx]}/${cat.tag}/${i + 1}`,
        source: sourceWebsites[sourceIdx],
        boardId: null,
        sectionId: null,
        altText: `${title} - ${cat.tag} category`,
        tags: [cat.tag, title.split(' ')[0].toLowerCase()],
        likes: Math.floor(seededRandom(pinIndex + 100) * 200),
        likedBy: [],
        commentCount: 0,
        saves: Math.floor(seededRandom(pinIndex + 200) * 500),
        createdAt: Date.now() - Math.floor(seededRandom(pinIndex + 300) * 30 * 24 * 60 * 60 * 1000)
      });
      pinIndex++;
    });
  });

  // Boards for current user (u1)
  const boards = [
    {
      id: 'b1',
      userId: 'u1',
      name: 'Home Decor Ideas',
      description: 'Inspiration for my apartment renovation',
      privacy: 'public',
      coverPinId: 'p1',
      pins: ['p1', 'p2', 'p3', 'p4', 'p5', 'p9', 'p10'],
      sections: [
        { id: 'sec1', boardId: 'b1', name: 'Living Room', pins: ['p1', 'p3'] },
        { id: 'sec2', boardId: 'b1', name: 'Kitchen', pins: ['p2', 'p10'] }
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
      coverPinId: 'p11',
      pins: ['p11', 'p12', 'p13', 'p14', 'p15', 'p16'],
      sections: [
        { id: 'sec5', boardId: 'b2', name: 'Quick Meals', pins: ['p11', 'p14'] },
        { id: 'sec6', boardId: 'b2', name: 'Desserts', pins: ['p13'] }
      ],
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
      coverPinId: 'p21',
      pins: ['p21', 'p22', 'p23', 'p24', 'p25'],
      sections: [
        { id: 'sec3', boardId: 'b3', name: 'Europe', pins: ['p21', 'p24'] },
        { id: 'sec4', boardId: 'b3', name: 'Asia', pins: ['p22'] }
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
      pins: ['p41', 'p45'],
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
      coverPinId: 'p41',
      pins: ['p41', 'p42', 'p43', 'p44'],
      sections: [],
      collaborators: ['u4'],
      createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b6',
      userId: 'u1',
      name: 'Fashion Inspo',
      description: 'Outfit ideas and style tips',
      privacy: 'public',
      coverPinId: 'p31',
      pins: ['p31', 'p32', 'p33', 'p34'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b7',
      userId: 'u1',
      name: 'Art & Illustration',
      description: 'Creative art pieces and tutorials',
      privacy: 'public',
      coverPinId: 'p51',
      pins: ['p51', 'p52', 'p53', 'p54'],
      sections: [],
      collaborators: ['u6'],
      createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b8',
      userId: 'u1',
      name: 'Wedding Planning',
      description: 'Ideas for the big day',
      privacy: 'secret',
      coverPinId: 'p61',
      pins: ['p61', 'p62', 'p63'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000
    },
    // Boards for other users
    {
      id: 'b9',
      userId: 'u2',
      name: 'My Best Recipes',
      description: 'Tried and tested favorites',
      privacy: 'public',
      coverPinId: 'p12',
      pins: ['p12', 'p16', 'p17', 'p18'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b10',
      userId: 'u3',
      name: 'Dream Destinations',
      description: 'Travel photography collection',
      privacy: 'public',
      coverPinId: 'p23',
      pins: ['p21', 'p23', 'p25', 'p27'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 80 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 4 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b11',
      userId: 'u5',
      name: 'Style Guide 2025',
      description: 'Current fashion trends and outfit ideas',
      privacy: 'public',
      coverPinId: 'p32',
      pins: ['p31', 'p32', 'p35', 'p36'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 50 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b12',
      userId: 'u6',
      name: 'Digital Art Gallery',
      description: 'My favorite digital artworks',
      privacy: 'public',
      coverPinId: 'p53',
      pins: ['p51', 'p53', 'p55', 'p56'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 40 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000
    },
    {
      id: 'b13',
      userId: 'u7',
      name: 'Minimal Home',
      description: 'Less is more - home organization ideas',
      privacy: 'public',
      coverPinId: 'p1',
      pins: ['p1', 'p7', 'p8', 'p9'],
      sections: [],
      collaborators: [],
      createdAt: Date.now() - 35 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000
    }
  ];

  // Assign boardIds and sectionIds to pins that are in boards
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
    { id: 'c2', pinId: 'p1', userId: 'u3', text: 'Those plants really complete the room', likes: 7, likedBy: ['u1', 'u2'], createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000 },
    { id: 'c3', pinId: 'p1', userId: 'u4', text: 'Just saved this to my home reno board!', likes: 1, likedBy: [], createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { id: 'c4', pinId: 'p11', userId: 'u1', text: 'Made this last weekend - turned out amazing!', likes: 12, likedBy: ['u2', 'u3'], createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 },
    { id: 'c5', pinId: 'p11', userId: 'u5', text: 'What type of flour did you use?', likes: 0, likedBy: [], createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { id: 'c6', pinId: 'p21', userId: 'u4', text: 'Santorini is on my bucket list! Any tips?', likes: 4, likedBy: ['u3'], createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000 },
    { id: 'c7', pinId: 'p21', userId: 'u3', text: 'Go in September - fewer crowds, perfect weather!', likes: 8, likedBy: ['u1', 'u4'], createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000 },
    { id: 'c8', pinId: 'p31', userId: 'u5', text: 'This outfit is everything', likes: 15, likedBy: ['u1', 'u2', 'u3'], createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { id: 'c9', pinId: 'p41', userId: 'u1', text: 'Tried this and it took me 3 hours but worth it!', likes: 6, likedBy: ['u4'], createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000 },
    { id: 'c10', pinId: 'p51', userId: 'u2', text: 'Beautiful brushwork! What brand of watercolors?', likes: 2, likedBy: [], createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 },
    { id: 'c11', pinId: 'p3', userId: 'u7', text: 'I need this kitchen in my life!', likes: 5, likedBy: ['u1', 'u3'], createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000 },
    { id: 'c12', pinId: 'p13', userId: 'u6', text: 'This cake looks incredible. Need the recipe!', likes: 9, likedBy: ['u2', 'u5'], createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
    { id: 'c13', pinId: 'p25', userId: 'u1', text: 'Added this to my travel board immediately', likes: 3, likedBy: ['u3'], createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000 },
    { id: 'c14', pinId: 'p53', userId: 'u6', text: 'The colors in this are so dreamy', likes: 11, likedBy: ['u1', 'u7'], createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000 },
  ];

  // Update commentCount on pins that have comments
  const commentCounts = {};
  comments.forEach(c => {
    commentCounts[c.pinId] = (commentCounts[c.pinId] || 0) + 1;
  });
  pins.forEach(pin => {
    if (commentCounts[pin.id]) {
      pin.commentCount = commentCounts[pin.id];
    }
  });

  // Generate notifications for current user
  const notifications = [
    { id: 'n1', type: 'save', fromUserId: 'u2', targetId: 'p1', message: 'Marco Rivera saved your pin', thumbnail: null, read: false, createdAt: Date.now() - 1 * 60 * 60 * 1000 },
    { id: 'n2', type: 'follow', fromUserId: 'u5', targetId: null, message: 'Nina Rodriguez started following you', thumbnail: null, read: false, createdAt: Date.now() - 3 * 60 * 60 * 1000 },
    { id: 'n3', type: 'comment', fromUserId: 'u3', targetId: 'p1', message: 'Emma Thompson commented on your pin', thumbnail: null, read: false, createdAt: Date.now() - 5 * 60 * 60 * 1000 },
    { id: 'n4', type: 'like', fromUserId: 'u4', targetId: 'p11', message: 'David Park liked your pin', thumbnail: null, read: true, createdAt: Date.now() - 12 * 60 * 60 * 1000 },
    { id: 'n5', type: 'save', fromUserId: 'u3', targetId: 'p2', message: 'Emma Thompson saved your pin', thumbnail: null, read: true, createdAt: Date.now() - 24 * 60 * 60 * 1000 },
    { id: 'n6', type: 'recommendation', fromUserId: null, targetId: 'p51', message: 'New ideas for "Home Decor"', thumbnail: null, read: true, createdAt: Date.now() - 48 * 60 * 60 * 1000 },
    { id: 'n7', type: 'board_invite', fromUserId: 'u4', targetId: 'b5', message: 'David Park invited you to "Weekend Woodworking"', thumbnail: null, read: false, createdAt: Date.now() - 6 * 60 * 60 * 1000 },
    { id: 'n8', type: 'comment', fromUserId: 'u2', targetId: 'p21', message: 'Marco Rivera replied to your comment', thumbnail: null, read: true, createdAt: Date.now() - 36 * 60 * 60 * 1000 },
    { id: 'n9', type: 'follow', fromUserId: 'u6', targetId: null, message: 'Alex Morgan started following you', thumbnail: null, read: false, createdAt: Date.now() - 2 * 60 * 60 * 1000 },
    { id: 'n10', type: 'save', fromUserId: 'u7', targetId: 'p3', message: 'Lily Watson saved your pin', thumbnail: null, read: false, createdAt: Date.now() - 30 * 60 * 1000 },
  ];

  // Messages / conversations
  const messages = [
    {
      id: 'conv1',
      participants: ['u1', 'u2'],
      messages: [
        { id: 'msg1', senderId: 'u2', text: 'Hey Sarah! Love your latest pin on the Scandinavian kitchen.', createdAt: Date.now() - 2 * 60 * 60 * 1000 },
        { id: 'msg2', senderId: 'u1', text: 'Thanks Marco! I found it on Architectural Digest.', createdAt: Date.now() - 1.5 * 60 * 60 * 1000 },
        { id: 'msg3', senderId: 'u2', text: 'I should make a recipe inspired by that vibe!', createdAt: Date.now() - 1 * 60 * 60 * 1000 },
        { id: 'msg4', senderId: 'u1', text: 'That would be amazing! Let me know when you do.', createdAt: Date.now() - 30 * 60 * 1000 },
      ],
      updatedAt: Date.now() - 30 * 60 * 1000
    },
    {
      id: 'conv2',
      participants: ['u1', 'u3'],
      messages: [
        { id: 'msg5', senderId: 'u3', text: 'Are you going to Santorini this year?', createdAt: Date.now() - 24 * 60 * 60 * 1000 },
        { id: 'msg6', senderId: 'u1', text: 'I wish! Maybe next spring. Your photos are inspiring me.', createdAt: Date.now() - 23 * 60 * 60 * 1000 },
        { id: 'msg7', senderId: 'u3', text: 'Let me know if you need any recommendations!', createdAt: Date.now() - 22 * 60 * 60 * 1000 },
      ],
      updatedAt: Date.now() - 22 * 60 * 60 * 1000
    },
    {
      id: 'conv3',
      participants: ['u1', 'u5'],
      messages: [
        { id: 'msg8', senderId: 'u5', text: 'Love your fashion board! Can I collaborate?', createdAt: Date.now() - 48 * 60 * 60 * 1000 },
        { id: 'msg9', senderId: 'u1', text: 'Of course! I just sent you an invite.', createdAt: Date.now() - 47 * 60 * 60 * 1000 },
      ],
      updatedAt: Date.now() - 47 * 60 * 60 * 1000
    },
    {
      id: 'conv4',
      participants: ['u1', 'u6'],
      messages: [
        { id: 'msg10', senderId: 'u6', text: 'Thanks for following my art board!', createdAt: Date.now() - 72 * 60 * 60 * 1000 },
        { id: 'msg11', senderId: 'u1', text: 'Your work is amazing! Do you take commissions?', createdAt: Date.now() - 71 * 60 * 60 * 1000 },
        { id: 'msg12', senderId: 'u6', text: 'Yes! DM me anytime for details.', createdAt: Date.now() - 70 * 60 * 60 * 1000 },
      ],
      updatedAt: Date.now() - 70 * 60 * 60 * 1000
    }
  ];

  // Explore categories with curated collections
  const exploreCategories = [
    { id: 'cat1', name: 'Home Decor', tag: 'interior', icon: 'home', color: '#E60023' },
    { id: 'cat2', name: 'Food & Drink', tag: 'food', icon: 'utensils', color: '#FF6900' },
    { id: 'cat3', name: 'Travel', tag: 'travel', icon: 'globe', color: '#0074E8' },
    { id: 'cat4', name: 'Fashion', tag: 'fashion', icon: 'shirt', color: '#8E44AD' },
    { id: 'cat5', name: 'DIY & Crafts', tag: 'diy', icon: 'scissors', color: '#27AE60' },
    { id: 'cat6', name: 'Art', tag: 'art', icon: 'palette', color: '#E91E63' },
    { id: 'cat7', name: 'Weddings', tag: 'wedding', icon: 'heart', color: '#F06292' },
    { id: 'cat8', name: 'Health & Fitness', tag: 'fitness', icon: 'dumbbell', color: '#00BCD4' },
  ];

  return {
    currentUser: users[0],  // Sarah Chen - pre-logged-in
    users,
    pins,
    boards,
    comments,
    notifications,
    messages,
    exploreCategories,
    searchQuery: '',
    searchFilters: [],       // Active category filter chips
    selectedCategory: null,  // Currently selected explore category
    lastUsedBoardId: 'b1'   // Last board used for quick-save
  };
}

export const INITIAL_STATE = createInitialData();

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'pinteract_state';
const BASE_INITIAL_KEY = 'pinteract_initialState';

function storageKey(sid) {
  return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY;
}
function initialKey(sid) {
  return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY;
}

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) {
    sessionStorage.setItem('mock_sid', urlSid);
    return urlSid;
  }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) { console.log('No custom state available'); }
  return null;
};

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      const initialState = getInitialState(sid) || state;
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state, initialState }),
      }).catch(() => {});
    }, 300);
  }
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

// --- Array item normalizers ---

function normalizeUser(user, index) {
  return {
    ...user,
    id: user.id || `u_custom_${index}`,
    username: user.username || user.handle || user.name || `user_${index}`,
    name: user.name || user.username || `User ${index}`,
    avatar: user.avatar || user.image || user.photo || user.profileImage || '',
    bio: user.bio || '',
    website: user.website || '',
    followers: Array.isArray(user.followers) ? user.followers : [],
    following: Array.isArray(user.following) ? user.following : [],
    monthlyViews: typeof user.monthlyViews === 'number' ? user.monthlyViews : 0,
    createdAt: user.createdAt || Date.now(),
  };
}

function normalizePin(pin, index) {
  return {
    ...pin,
    id: pin.id || `p_custom_${index}`,
    userId: pin.userId || pin.user || pin.authorId || pin.author || 'u1',
    title: pin.title || pin.name || `Pin ${index}`,
    description: pin.description || pin.desc || pin.text || pin.body || '',
    image: pin.image || pin.img || pin.src || pin.imageUrl || `https://picsum.photos/seed/custom${index}/400/500`,
    imageWidth: pin.imageWidth || 400,
    imageHeight: pin.imageHeight || 500,
    url: pin.url || pin.link || pin.sourceUrl || '',
    source: pin.source || '',
    boardId: pin.boardId || null,
    sectionId: pin.sectionId || null,
    altText: pin.altText || '',
    tags: Array.isArray(pin.tags) ? pin.tags : [],
    likes: typeof pin.likes === 'number' ? pin.likes : 0,
    likedBy: Array.isArray(pin.likedBy) ? pin.likedBy : [],
    commentCount: typeof pin.commentCount === 'number' ? pin.commentCount : 0,
    saves: typeof pin.saves === 'number' ? pin.saves : 0,
    createdAt: pin.createdAt || pin.created || Date.now(),
  };
}

function normalizeSection(section, index) {
  return {
    ...section,
    id: section.id || `sec_custom_${index}`,
    boardId: section.boardId || null,
    name: section.name || section.title || `Section ${index}`,
    pins: Array.isArray(section.pins) ? section.pins : [],
  };
}

function normalizeBoard(board, index) {
  const rawSections = Array.isArray(board.sections) ? board.sections : [];
  return {
    ...board,
    id: board.id || `b_custom_${index}`,
    userId: board.userId || board.user || 'u1',
    name: board.name || board.title || `Board ${index}`,
    description: board.description || '',
    privacy: board.privacy || 'public',
    coverPinId: board.coverPinId || null,
    pins: Array.isArray(board.pins) ? board.pins : [],
    sections: rawSections.map((s, i) => normalizeSection(s, i)),
    collaborators: Array.isArray(board.collaborators) ? board.collaborators : [],
    archived: typeof board.archived === 'boolean' ? board.archived : false,
    mergedIntoBoardId: board.mergedIntoBoardId || null,
    createdAt: board.createdAt || Date.now(),
    updatedAt: board.updatedAt || Date.now(),
  };
}

function normalizeComment(comment, index) {
  return {
    ...comment,
    id: comment.id || `c_custom_${index}`,
    pinId: comment.pinId || '',
    userId: comment.userId || comment.user || 'u1',
    text: comment.text || comment.body || comment.content || comment.message || '',
    likes: typeof comment.likes === 'number' ? comment.likes : 0,
    likedBy: Array.isArray(comment.likedBy) ? comment.likedBy : [],
    createdAt: comment.createdAt || Date.now(),
  };
}

function normalizeNotification(notification, index) {
  return {
    ...notification,
    id: notification.id || `n_custom_${index}`,
    type: notification.type || 'recommendation',
    fromUserId: notification.fromUserId || null,
    targetId: notification.targetId || null,
    message: notification.message || '',
    thumbnail: notification.thumbnail || null,
    read: typeof notification.read === 'boolean' ? notification.read : false,
    createdAt: notification.createdAt || Date.now(),
  };
}

const arrayNormalizers = {
  users: normalizeUser,
  boards: normalizeBoard,
  pins: normalizePin,
  comments: normalizeComment,
  notifications: normalizeNotification,
};

function createDefaultData() {
  return { ...INITIAL_STATE };
}

function deepMergeWithDefaults(defaults, incoming) {
  if (!incoming || typeof incoming !== 'object') return defaults;
  const result = { ...defaults, ...incoming };

  Object.keys(defaults).forEach(key => {
    const defaultValue = defaults[key];
    const incomingValue = incoming[key];

    if (Array.isArray(defaultValue)) {
      const value = Array.isArray(incomingValue) ? incomingValue : defaultValue;
      result[key] = arrayNormalizers[key]
        ? value.map((item, index) => arrayNormalizers[key](item || {}, index))
        : value;
      return;
    }

    if (
      defaultValue &&
      typeof defaultValue === 'object' &&
      !Array.isArray(defaultValue) &&
      incomingValue &&
      typeof incomingValue === 'object' &&
      !Array.isArray(incomingValue)
    ) {
      result[key] = deepMergeWithDefaults(defaultValue, incomingValue);
    }
  });

  if (result.currentUser) {
    result.currentUser = normalizeUser(result.currentUser, 0);
  }

  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = deepMergeWithDefaults(createDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = createDefaultData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
