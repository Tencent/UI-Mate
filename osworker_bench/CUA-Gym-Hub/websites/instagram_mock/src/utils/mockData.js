import { subHours, subMinutes, subDays } from 'date-fns';

export const CURRENT_USER_ID = 'user_admin';

export const generateInitialData = () => {
  const now = new Date();

  const users = {
    [CURRENT_USER_ID]: {
      id: CURRENT_USER_ID,
      username: 'alex_morgan',
      name: 'Alex Morgan',
      avatar: 'https://i.pravatar.cc/150?img=11',
      bio: 'Photographer | San Francisco, CA\nCapturing moments that matter\nBookings open',
      website: 'https://alexmorgan.com',
      followers: ['user_2', 'user_3', 'user_5', 'user_7', 'user_4', 'user_8'],
      following: ['user_2', 'user_3', 'user_5', 'user_7'],
      isVerified: false,
      isPrivate: false,
      isOnline: true,
    },
    'user_2': {
      id: 'user_2',
      username: 'adventure_seeker',
      name: 'Alice Walker',
      avatar: 'https://i.pravatar.cc/150?img=5',
      bio: 'Travel | Photography | Coffee\nExploring the world one city at a time\n30 countries and counting',
      website: 'https://alicewalker.travel',
      followers: [CURRENT_USER_ID, 'user_3', 'user_5', 'user_6', 'user_7', 'user_8', 'user_9', 'user_10'],
      following: [CURRENT_USER_ID, 'user_3', 'user_5', 'user_7', 'user_9'],
      isVerified: true,
      isPrivate: false,
      isOnline: true,
    },
    'user_3': {
      id: 'user_3',
      username: 'tech_guru',
      name: 'Bob Chen',
      avatar: 'https://i.pravatar.cc/150?img=12',
      bio: 'Software Engineer | Building the future\nSF Bay Area | React & Node.js\nOpen source contributor',
      website: 'https://bobchen.dev',
      followers: [CURRENT_USER_ID, 'user_2', 'user_4', 'user_5', 'user_9', 'user_10'],
      following: [CURRENT_USER_ID, 'user_2', 'user_7', 'user_10'],
      isVerified: false,
      isPrivate: false,
      isOnline: false,
    },
    'user_4': {
      id: 'user_4',
      username: 'design_daily',
      name: 'Sarah Kim',
      avatar: 'https://i.pravatar.cc/150?img=9',
      bio: 'UI/UX Designer | Minimalism is key\nDesign is how it works\nAvailable for freelance',
      website: 'https://sarahkim.design',
      followers: ['user_3', 'user_6', 'user_8', CURRENT_USER_ID, 'user_10'],
      following: ['user_2', 'user_6', 'user_8', CURRENT_USER_ID],
      isVerified: false,
      isPrivate: false,
      isOnline: true,
    },
    'user_5': {
      id: 'user_5',
      username: 'foodie_life',
      name: 'Chef Marco',
      avatar: 'https://i.pravatar.cc/150?img=15',
      bio: 'Food is my love language\nProfessional Chef | Recipe Creator\n2x James Beard Nominee',
      website: 'https://chefmarco.kitchen',
      followers: [CURRENT_USER_ID, 'user_2', 'user_3', 'user_6', 'user_7', 'user_8', 'user_9', 'user_10'],
      following: [CURRENT_USER_ID, 'user_2', 'user_9'],
      isVerified: true,
      isPrivate: false,
      isOnline: false,
    },
    'user_6': {
      id: 'user_6',
      username: 'nature_lover',
      name: 'Emma Green',
      avatar: 'https://i.pravatar.cc/150?img=16',
      bio: 'Hiking & Outdoors\nNational Park Explorer\nLeave no trace',
      website: '',
      followers: ['user_4', 'user_5', 'user_8', 'user_9'],
      following: ['user_2', 'user_4', 'user_5', 'user_8'],
      isVerified: false,
      isPrivate: false,
      isOnline: false,
    },
    'user_7': {
      id: 'user_7',
      username: 'fitness_coach',
      name: 'Jake Thompson',
      avatar: 'https://i.pravatar.cc/150?img=8',
      bio: 'Certified Personal Trainer\nTransform your body, transform your life\nDM for training plans',
      website: 'https://jakefitness.com',
      followers: [CURRENT_USER_ID, 'user_2', 'user_3', 'user_5', 'user_8', 'user_9', 'user_10'],
      following: [CURRENT_USER_ID, 'user_2', 'user_5', 'user_9'],
      isVerified: true,
      isPrivate: false,
      isOnline: true,
    },
    'user_8': {
      id: 'user_8',
      username: 'artsy_vibes',
      name: 'Mia Chen',
      avatar: 'https://i.pravatar.cc/150?img=20',
      bio: 'Digital Artist & Illustrator\nCommissions open\nPrints available below',
      website: 'https://miachen.art',
      followers: ['user_4', 'user_6', 'user_7', CURRENT_USER_ID],
      following: ['user_4', 'user_5', 'user_6', 'user_7', CURRENT_USER_ID],
      isVerified: false,
      isPrivate: false,
      isOnline: false,
    },
    'user_9': {
      id: 'user_9',
      username: 'urban_explorer',
      name: 'David Park',
      avatar: 'https://i.pravatar.cc/150?img=33',
      bio: 'Street Photography | Architecture\nNYC based | Sony Alpha\nPrint shop open',
      website: 'https://davidpark.photo',
      followers: ['user_2', 'user_5', 'user_6', 'user_7', 'user_10'],
      following: ['user_2', 'user_5', 'user_7', 'user_10'],
      isVerified: false,
      isPrivate: false,
      isOnline: true,
    },
    'user_10': {
      id: 'user_10',
      username: 'music_matters',
      name: 'Luna Rivera',
      avatar: 'https://i.pravatar.cc/150?img=25',
      bio: 'Singer-Songwriter | Producer\nNew EP out now\nTour dates in bio link',
      website: 'https://lunarivera.music',
      followers: ['user_3', 'user_4', 'user_7', 'user_9'],
      following: ['user_3', 'user_7', 'user_9'],
      isVerified: true,
      isPrivate: false,
      isOnline: false,
    },
  };

  // 25 posts
  const posts = [
    // --- Current user's posts (4) ---
    {
      id: 'post_1',
      userId: CURRENT_USER_ID,
      images: ['https://picsum.photos/id/1015/800/800'],
      caption: 'Golden hour in the city #photography #sanfrancisco #goldenhour',
      location: 'San Francisco, CA',
      likes: ['user_2', 'user_3', 'user_5', 'user_7', 'user_4'],
      comments: [
        { id: 'c_1', userId: 'user_2', text: 'Stunning shot!', created: subMinutes(now, 30).toISOString(), likes: [CURRENT_USER_ID] },
        { id: 'c_2', userId: 'user_3', text: 'The light is perfect here', created: subMinutes(now, 20).toISOString(), likes: [] },
        { id: 'c_3', userId: 'user_7', text: 'You always nail the golden hour shots', created: subMinutes(now, 10).toISOString(), likes: [CURRENT_USER_ID, 'user_2'] },
      ],
      saved: ['user_3'],
      created: subHours(now, 4).toISOString(),
    },
    {
      id: 'post_2',
      userId: CURRENT_USER_ID,
      images: ['https://picsum.photos/id/1018/800/800', 'https://picsum.photos/id/1019/800/800'],
      caption: 'Weekend adventures with the crew @adventure_seeker @tech_guru #weekendvibes #hiking',
      location: 'Muir Woods, CA',
      taggedUsers: ['user_2', 'user_3'],
      likes: ['user_2', 'user_3', 'user_5', 'user_6', 'user_7'],
      comments: [
        { id: 'c_4', userId: 'user_2', text: 'Such a fun day! Best hike ever', created: subHours(now, 20).toISOString(), likes: [CURRENT_USER_ID, 'user_3'] },
        { id: 'c_5', userId: 'user_3', text: 'Need to do this again soon!', created: subHours(now, 18).toISOString(), likes: [CURRENT_USER_ID] },
      ],
      saved: [],
      created: subDays(now, 1).toISOString(),
    },
    {
      id: 'post_3',
      userId: CURRENT_USER_ID,
      images: ['https://picsum.photos/id/1025/800/800'],
      caption: 'New lens, who dis? #photography #newgear #canon',
      location: '',
      likes: ['user_2', 'user_7', 'user_4'],
      comments: [
        { id: 'c_6', userId: 'user_4', text: 'What lens did you get?', created: subDays(now, 4).toISOString(), likes: [] },
      ],
      saved: [],
      created: subDays(now, 5).toISOString(),
    },
    {
      id: 'post_4a',
      userId: CURRENT_USER_ID,
      images: ['https://picsum.photos/id/1035/800/800', 'https://picsum.photos/id/1036/800/800', 'https://picsum.photos/id/1037/800/800'],
      caption: 'Portfolio update: Urban landscapes series. Three new pieces from my recent downtown shoot. The city never stops inspiring me. #streetphotography #urban #citylights',
      location: 'Downtown SF',
      likes: ['user_2', 'user_3', 'user_5', 'user_7', 'user_8', 'user_9'],
      comments: [
        { id: 'c_6a', userId: 'user_9', text: 'Fellow street photographer here, these are incredible compositions', created: subDays(now, 2).toISOString(), likes: [CURRENT_USER_ID, 'user_2'] },
        { id: 'c_6b', userId: 'user_8', text: 'The lighting in the third one is chef\'s kiss', created: subDays(now, 2).toISOString(), likes: [CURRENT_USER_ID] },
        { id: 'c_6c', userId: 'user_2', text: 'You have such a great eye for this', created: subDays(now, 1).toISOString(), likes: [] },
      ],
      saved: ['user_9'],
      created: subDays(now, 3).toISOString(),
    },
    // --- Posts from followed users ---
    {
      id: 'post_4',
      userId: 'user_2',
      images: ['https://picsum.photos/id/1040/800/800'],
      caption: 'Santorini sunsets hit different #travel #santorini #greece #wanderlust #islandlife',
      location: 'Santorini, Greece',
      likes: [CURRENT_USER_ID, 'user_3', 'user_5', 'user_6', 'user_7', 'user_9'],
      comments: [
        { id: 'c_7', userId: CURRENT_USER_ID, text: 'Absolutely breathtaking!', created: subMinutes(now, 45).toISOString(), likes: ['user_2'] },
        { id: 'c_8', userId: 'user_5', text: 'Adding this to my bucket list', created: subMinutes(now, 30).toISOString(), likes: [] },
        { id: 'c_9', userId: 'user_7', text: 'Take me there!', created: subMinutes(now, 15).toISOString(), likes: ['user_2'] },
        { id: 'c_10', userId: 'user_9', text: 'Greece is magical. Were you there for the whole week?', created: subMinutes(now, 5).toISOString(), likes: [] },
      ],
      saved: [CURRENT_USER_ID],
      created: subHours(now, 2).toISOString(),
    },
    {
      id: 'post_5',
      userId: 'user_2',
      images: ['https://picsum.photos/id/1043/800/800', 'https://picsum.photos/id/1044/800/800', 'https://picsum.photos/id/1045/800/800'],
      caption: 'Lost in the streets of Tokyo #japan #tokyo #streetphotography #asia #nightlife',
      location: 'Tokyo, Japan',
      likes: ['user_3', 'user_5', 'user_6', 'user_9', 'user_10'],
      comments: [
        { id: 'c_11', userId: 'user_3', text: 'Japan is incredible', created: subHours(now, 10).toISOString(), likes: [] },
        { id: 'c_12', userId: 'user_9', text: 'The neon lights are amazing', created: subHours(now, 8).toISOString(), likes: ['user_2'] },
      ],
      saved: [],
      created: subHours(now, 12).toISOString(),
    },
    {
      id: 'post_6',
      userId: 'user_3',
      images: ['https://picsum.photos/id/180/800/800'],
      caption: 'New setup is finally complete! What do you think? #tech #homeoffice #workspace #developer',
      location: 'Home Office',
      likes: [CURRENT_USER_ID, 'user_2', 'user_4', 'user_5', 'user_10'],
      comments: [
        { id: 'c_13', userId: CURRENT_USER_ID, text: 'Clean setup! What monitor is that?', created: subHours(now, 3).toISOString(), likes: ['user_3'] },
        { id: 'c_14', userId: 'user_2', text: 'Goals', created: subHours(now, 2).toISOString(), likes: [] },
        { id: 'c_15', userId: 'user_10', text: 'I need this exact setup for my studio', created: subHours(now, 1).toISOString(), likes: ['user_3'] },
      ],
      saved: [CURRENT_USER_ID],
      created: subHours(now, 6).toISOString(),
    },
    {
      id: 'post_7',
      userId: 'user_5',
      images: ['https://picsum.photos/id/292/800/800'],
      caption: 'Homemade pasta from scratch. The secret is in the dough! Recipe in stories. #cooking #pasta #homemade #foodie #italianfood',
      location: 'My Kitchen',
      likes: [CURRENT_USER_ID, 'user_2', 'user_3', 'user_6', 'user_7', 'user_8', 'user_9'],
      comments: [
        { id: 'c_16', userId: 'user_2', text: 'Recipe please!', created: subHours(now, 1).toISOString(), likes: ['user_5'] },
        { id: 'c_17', userId: CURRENT_USER_ID, text: 'Looks incredible!', created: subMinutes(now, 50).toISOString(), likes: [] },
        { id: 'c_18', userId: 'user_6', text: 'I need to learn this', created: subMinutes(now, 40).toISOString(), likes: [] },
        { id: 'c_19', userId: 'user_7', text: 'Carb loading done right', created: subMinutes(now, 20).toISOString(), likes: ['user_5', CURRENT_USER_ID] },
        { id: 'c_20', userId: 'user_8', text: 'Chef Marco never disappoints', created: subMinutes(now, 10).toISOString(), likes: ['user_5'] },
        { id: 'c_21', userId: 'user_9', text: 'That looks restaurant quality', created: subMinutes(now, 5).toISOString(), likes: [] },
      ],
      saved: [CURRENT_USER_ID],
      created: subHours(now, 3).toISOString(),
    },
    {
      id: 'post_8',
      userId: 'user_5',
      images: ['https://picsum.photos/id/312/800/800', 'https://picsum.photos/id/326/800/800'],
      caption: 'Sunday brunch spread #brunch #sundayfunday #foodphotography #mimosas',
      location: 'The Breakfast Club',
      likes: ['user_2', 'user_6', 'user_8', 'user_10'],
      comments: [
        { id: 'c_22', userId: 'user_10', text: 'Brunch goals!', created: subDays(now, 1).toISOString(), likes: [] },
      ],
      saved: [],
      created: subDays(now, 2).toISOString(),
    },
    {
      id: 'post_9',
      userId: 'user_7',
      images: ['https://picsum.photos/id/348/800/800'],
      caption: 'Consistency is key. 6 months transformation. Never give up on yourself! #fitness #transformation #gym #motivation #gains',
      location: 'Iron Temple Gym',
      taggedUsers: [CURRENT_USER_ID],
      likes: [CURRENT_USER_ID, 'user_2', 'user_3', 'user_5', 'user_8', 'user_9'],
      comments: [
        { id: 'c_23', userId: CURRENT_USER_ID, text: 'Incredible progress!', created: subHours(now, 8).toISOString(), likes: ['user_7'] },
        { id: 'c_24', userId: 'user_5', text: 'Respect', created: subHours(now, 7).toISOString(), likes: [] },
        { id: 'c_25', userId: 'user_9', text: 'What workout split do you follow?', created: subHours(now, 6).toISOString(), likes: ['user_7'] },
      ],
      saved: [],
      created: subHours(now, 10).toISOString(),
    },
    {
      id: 'post_10',
      userId: 'user_3',
      images: ['https://picsum.photos/id/366/800/800'],
      caption: 'Debugging at 3am be like... The code works now but I have no idea why #programming #developer #codinglife #javascript',
      location: '',
      likes: [CURRENT_USER_ID, 'user_2', 'user_4', 'user_10'],
      comments: [
        { id: 'c_26', userId: 'user_2', text: 'Literally me last night', created: subDays(now, 1).toISOString(), likes: ['user_3'] },
        { id: 'c_27', userId: 'user_10', text: 'The struggle is real', created: subDays(now, 1).toISOString(), likes: [] },
      ],
      saved: [],
      created: subDays(now, 1).toISOString(),
    },
    {
      id: 'post_11',
      userId: 'user_7',
      images: ['https://picsum.photos/id/370/800/800', 'https://picsum.photos/id/376/800/800'],
      caption: 'Morning run along the coast. Nothing beats ocean air! Who else loves early morning cardio? #running #fitness #morning #coastalrun',
      location: 'Pacific Coast Highway',
      likes: ['user_2', 'user_5', 'user_9'],
      comments: [
        { id: 'c_28', userId: 'user_2', text: 'Beautiful route!', created: subDays(now, 2).toISOString(), likes: [] },
      ],
      saved: [],
      created: subDays(now, 3).toISOString(),
    },
    // --- Posts from non-followed users (for explore) ---
    {
      id: 'post_12',
      userId: 'user_4',
      images: ['https://picsum.photos/id/380/800/800'],
      caption: 'Less is more. New brand identity project #design #branding #minimalism #uidesign #creative',
      location: 'Design Studio',
      likes: ['user_3', 'user_6', 'user_8', 'user_10'],
      comments: [
        { id: 'c_29', userId: 'user_6', text: 'So clean! Love the color palette', created: subHours(now, 5).toISOString(), likes: ['user_4'] },
        { id: 'c_30', userId: 'user_10', text: 'This is really professional work', created: subHours(now, 4).toISOString(), likes: [] },
      ],
      saved: [],
      created: subHours(now, 8).toISOString(),
    },
    {
      id: 'post_13',
      userId: 'user_6',
      images: ['https://picsum.photos/id/429/800/800'],
      caption: 'Found paradise. Yosemite never disappoints #nature #yosemite #hiking #nationalpark #landscape #california',
      location: 'Yosemite National Park',
      likes: ['user_2', 'user_4', 'user_5', 'user_8', 'user_9'],
      comments: [
        { id: 'c_31', userId: 'user_4', text: 'Absolutely magical!', created: subHours(now, 15).toISOString(), likes: [] },
        { id: 'c_32', userId: 'user_8', text: 'Need to paint this scene', created: subHours(now, 14).toISOString(), likes: ['user_6'] },
        { id: 'c_33', userId: 'user_9', text: 'Which trail is this?', created: subHours(now, 12).toISOString(), likes: [] },
      ],
      saved: [],
      created: subHours(now, 16).toISOString(),
    },
    {
      id: 'post_14',
      userId: 'user_8',
      images: ['https://picsum.photos/id/450/800/800', 'https://picsum.photos/id/452/800/800', 'https://picsum.photos/id/453/800/800'],
      caption: 'New digital art series: "Dreams in Color". Swipe to see the full collection. Prints available through my website. #digitalart #illustration #art #creative #prints',
      location: 'Studio',
      likes: ['user_4', 'user_6', 'user_7', 'user_10', 'user_9'],
      comments: [
        { id: 'c_34', userId: 'user_4', text: 'Your color work is incredible', created: subDays(now, 1).toISOString(), likes: ['user_8'] },
        { id: 'c_35', userId: 'user_6', text: 'Want this as a print!', created: subDays(now, 1).toISOString(), likes: [] },
        { id: 'c_36', userId: 'user_10', text: 'Would love to use one for an album cover', created: subDays(now, 1).toISOString(), likes: ['user_8'] },
      ],
      saved: [],
      created: subDays(now, 2).toISOString(),
    },
    {
      id: 'post_15',
      userId: 'user_6',
      images: ['https://picsum.photos/id/472/800/800'],
      caption: 'Morning mist in the redwoods. There is something magical about being alone in the forest at dawn. #nature #redwoods #california #forest #peaceful',
      location: 'Redwood National Park',
      likes: ['user_4', 'user_8', 'user_9'],
      comments: [
        { id: 'c_37', userId: 'user_9', text: 'The atmosphere in this photo is incredible', created: subDays(now, 3).toISOString(), likes: [] },
      ],
      saved: [],
      created: subDays(now, 4).toISOString(),
    },
    // Additional posts for richer data
    {
      id: 'post_16',
      userId: 'user_9',
      images: ['https://picsum.photos/id/493/800/800'],
      caption: 'Brooklyn Bridge at blue hour. This city has endless compositions. Shot on Sony A7IV + 24mm f/1.4 #nyc #streetphotography #bluehour #architecture',
      location: 'Brooklyn Bridge, NYC',
      likes: ['user_2', 'user_5', 'user_7', 'user_10', CURRENT_USER_ID],
      comments: [
        { id: 'c_38', userId: 'user_2', text: 'NYC is always photogenic', created: subHours(now, 4).toISOString(), likes: ['user_9'] },
        { id: 'c_39', userId: CURRENT_USER_ID, text: 'Great composition!', created: subHours(now, 3).toISOString(), likes: [] },
        { id: 'c_40', userId: 'user_7', text: 'I was just there last week!', created: subHours(now, 2).toISOString(), likes: [] },
      ],
      saved: [],
      created: subHours(now, 5).toISOString(),
    },
    {
      id: 'post_17',
      userId: 'user_10',
      images: ['https://picsum.photos/id/96/800/800'],
      caption: 'Studio session all day. New EP coming soon, been pouring my heart into these tracks. Stay tuned. #music #studio #recording #newmusic #songwriter',
      location: 'Sunset Sound Studios',
      likes: ['user_3', 'user_7', 'user_9', 'user_4'],
      comments: [
        { id: 'c_41', userId: 'user_7', text: 'Can not wait to hear it!', created: subHours(now, 3).toISOString(), likes: ['user_10'] },
        { id: 'c_42', userId: 'user_9', text: 'When is the release date?', created: subHours(now, 2).toISOString(), likes: [] },
        { id: 'c_43', userId: 'user_3', text: 'Loved your last album', created: subHours(now, 1).toISOString(), likes: ['user_10'] },
      ],
      saved: [],
      created: subHours(now, 7).toISOString(),
    },
    {
      id: 'post_18',
      userId: 'user_2',
      images: ['https://picsum.photos/id/164/800/800'],
      caption: 'Rainy day in London but still beautiful. Sometimes the best photos come on overcast days. #london #travel #rainydays #uk',
      location: 'London, UK',
      likes: [CURRENT_USER_ID, 'user_3', 'user_5', 'user_9'],
      comments: [
        { id: 'c_44', userId: CURRENT_USER_ID, text: 'London in the rain is so atmospheric', created: subDays(now, 3).toISOString(), likes: ['user_2'] },
        { id: 'c_45', userId: 'user_3', text: 'Best city in the world', created: subDays(now, 3).toISOString(), likes: [] },
      ],
      saved: [],
      created: subDays(now, 4).toISOString(),
    },
    {
      id: 'post_19',
      userId: 'user_4',
      images: ['https://picsum.photos/id/201/800/800', 'https://picsum.photos/id/200/800/800'],
      caption: 'Color theory exploration. Playing with complementary palettes for a client project. Which combination do you prefer? 1 or 2? #design #colortheory #creativity',
      location: '',
      likes: ['user_3', 'user_6', 'user_8', 'user_10', 'user_2'],
      comments: [
        { id: 'c_46', userId: 'user_3', text: 'Definitely number 1', created: subDays(now, 1).toISOString(), likes: [] },
        { id: 'c_47', userId: 'user_8', text: 'Both are gorgeous but 2 feels more balanced', created: subDays(now, 1).toISOString(), likes: ['user_4'] },
        { id: 'c_48', userId: 'user_6', text: 'Love seeing your process', created: subDays(now, 1).toISOString(), likes: [] },
      ],
      saved: [],
      created: subDays(now, 2).toISOString(),
    },
    {
      id: 'post_20',
      userId: 'user_5',
      images: ['https://picsum.photos/id/225/800/800'],
      caption: 'Farm to table dinner tonight. Local ingredients, seasonal menu. This is what cooking is all about. Drop a comment if you want the recipe! #farmtotable #seasonal #cooking #sustainable',
      location: 'Napa Valley, CA',
      likes: [CURRENT_USER_ID, 'user_2', 'user_6', 'user_7', 'user_8', 'user_9', 'user_10'],
      comments: [
        { id: 'c_49', userId: 'user_2', text: 'Please share the recipe!', created: subDays(now, 5).toISOString(), likes: ['user_5'] },
        { id: 'c_50', userId: 'user_6', text: 'Sustainable cooking is so important', created: subDays(now, 5).toISOString(), likes: [] },
        { id: 'c_51', userId: CURRENT_USER_ID, text: 'Mouth watering', created: subDays(now, 4).toISOString(), likes: [] },
        { id: 'c_52', userId: 'user_10', text: 'Can you do a cooking class?', created: subDays(now, 4).toISOString(), likes: ['user_5'] },
      ],
      saved: [],
      created: subDays(now, 6).toISOString(),
    },
    {
      id: 'post_21',
      userId: 'user_9',
      images: ['https://picsum.photos/id/250/800/800', 'https://picsum.photos/id/251/800/800'],
      caption: 'Chinatown at night. The colors, the energy, the food. NYC never sleeps and neither do I when I am out shooting. #chinatown #nightphotography #nyc #neon',
      location: 'Chinatown, NYC',
      likes: ['user_2', 'user_7', 'user_10'],
      comments: [
        { id: 'c_53', userId: 'user_2', text: 'Incredible nighttime shots', created: subDays(now, 2).toISOString(), likes: [] },
        { id: 'c_54', userId: 'user_10', text: 'Love the neon reflections', created: subDays(now, 2).toISOString(), likes: ['user_9'] },
      ],
      saved: [],
      created: subDays(now, 3).toISOString(),
    },
    {
      id: 'post_22',
      userId: 'user_7',
      images: ['https://picsum.photos/id/274/800/800'],
      caption: 'Meal prep Sunday! Eating clean does not have to be boring. Here is my weekly prep: lean protein, complex carbs, and plenty of greens. DM me for the full plan. #mealprep #fitness #healthyeating #nutrition',
      location: '',
      likes: [CURRENT_USER_ID, 'user_2', 'user_5', 'user_9'],
      comments: [
        { id: 'c_55', userId: 'user_5', text: 'As a chef I approve this!', created: subHours(now, 15).toISOString(), likes: ['user_7'] },
        { id: 'c_56', userId: CURRENT_USER_ID, text: 'Sending you a DM for the plan', created: subHours(now, 14).toISOString(), likes: [] },
      ],
      saved: [],
      created: subHours(now, 18).toISOString(),
    },
    {
      id: 'post_23',
      userId: 'user_8',
      images: ['https://picsum.photos/id/302/800/800'],
      caption: 'Commission piece finished! Watercolor portrait on cold press paper. I love bringing people\'s visions to life. DM for commissions. #art #watercolor #portrait #commission',
      location: 'Art Studio',
      likes: ['user_4', 'user_6', 'user_10'],
      comments: [
        { id: 'c_57', userId: 'user_4', text: 'The detail is stunning', created: subDays(now, 4).toISOString(), likes: ['user_8'] },
        { id: 'c_58', userId: 'user_6', text: 'How long did this take?', created: subDays(now, 4).toISOString(), likes: [] },
      ],
      saved: [],
      created: subDays(now, 5).toISOString(),
    },
    {
      id: 'post_24',
      userId: 'user_10',
      images: ['https://picsum.photos/id/335/800/800', 'https://picsum.photos/id/338/800/800'],
      caption: 'Sound check before tonight\'s show. The venue looks incredible. See you all at 8pm! #livemusic #concert #performance #singer',
      location: 'The Fillmore, SF',
      likes: ['user_3', 'user_7', 'user_9', 'user_2'],
      comments: [
        { id: 'c_59', userId: 'user_7', text: 'Will be there front row!', created: subDays(now, 6).toISOString(), likes: ['user_10'] },
        { id: 'c_60', userId: 'user_3', text: 'Wish I could make it, have fun!', created: subDays(now, 6).toISOString(), likes: [] },
      ],
      saved: [],
      created: subDays(now, 7).toISOString(),
    },
    {
      id: 'post_25',
      userId: 'user_3',
      images: ['https://picsum.photos/id/360/800/800'],
      caption: 'Just shipped v2.0 of my open source project! 500+ stars on GitHub. Grateful for the community. Link in bio. #opensource #developer #coding #milestone',
      location: 'San Francisco, CA',
      likes: [CURRENT_USER_ID, 'user_2', 'user_4', 'user_10', 'user_9'],
      comments: [
        { id: 'c_61', userId: CURRENT_USER_ID, text: 'Congrats! Well deserved', created: subDays(now, 5).toISOString(), likes: ['user_3'] },
        { id: 'c_62', userId: 'user_2', text: 'Going to check it out', created: subDays(now, 5).toISOString(), likes: [] },
        { id: 'c_63', userId: 'user_4', text: 'Amazing work, starred!', created: subDays(now, 4).toISOString(), likes: ['user_3'] },
      ],
      saved: [],
      created: subDays(now, 6).toISOString(),
    },
  ];

  // 10 stories from 6 users
  const stories = [
    {
      id: 'story_1',
      userId: CURRENT_USER_ID,
      image: 'https://picsum.photos/id/500/400/700',
      created: subHours(now, 2).toISOString(),
      expires: subHours(now, -22).toISOString(),
      viewed: false,
    },
    {
      id: 'story_2',
      userId: 'user_2',
      image: 'https://picsum.photos/id/501/400/700',
      created: subMinutes(now, 30).toISOString(),
      expires: subHours(now, -23).toISOString(),
      viewed: false,
    },
    {
      id: 'story_3',
      userId: 'user_2',
      image: 'https://picsum.photos/id/502/400/700',
      created: subMinutes(now, 15).toISOString(),
      expires: subHours(now, -23).toISOString(),
      viewed: false,
    },
    {
      id: 'story_4',
      userId: 'user_3',
      image: 'https://picsum.photos/id/503/400/700',
      created: subHours(now, 3).toISOString(),
      expires: subHours(now, -21).toISOString(),
      viewed: true,
    },
    {
      id: 'story_5',
      userId: 'user_5',
      image: 'https://picsum.photos/id/504/400/700',
      created: subHours(now, 4).toISOString(),
      expires: subHours(now, -20).toISOString(),
      viewed: false,
    },
    {
      id: 'story_6',
      userId: 'user_5',
      image: 'https://picsum.photos/id/505/400/700',
      created: subHours(now, 1).toISOString(),
      expires: subHours(now, -23).toISOString(),
      viewed: false,
    },
    {
      id: 'story_7',
      userId: 'user_7',
      image: 'https://picsum.photos/id/506/400/700',
      created: subHours(now, 5).toISOString(),
      expires: subHours(now, -19).toISOString(),
      viewed: true,
    },
    {
      id: 'story_8',
      userId: 'user_8',
      image: 'https://picsum.photos/id/507/400/700',
      created: subHours(now, 6).toISOString(),
      expires: subHours(now, -18).toISOString(),
      viewed: false,
    },
    {
      id: 'story_9',
      userId: 'user_9',
      image: 'https://picsum.photos/id/508/400/700',
      created: subHours(now, 1).toISOString(),
      expires: subHours(now, -23).toISOString(),
      viewed: false,
    },
    {
      id: 'story_10',
      userId: 'user_10',
      image: 'https://picsum.photos/id/509/400/700',
      created: subHours(now, 7).toISOString(),
      expires: subHours(now, -17).toISOString(),
      viewed: false,
    },
  ];

  // 15 notifications
  const notifications = [
    { id: 'notif_1', type: 'like', fromUserId: 'user_2', postId: 'post_1', commentId: null, text: 'liked your photo.', read: false, created: subMinutes(now, 5).toISOString() },
    { id: 'notif_2', type: 'comment', fromUserId: 'user_3', postId: 'post_1', commentId: 'c_2', text: 'commented: The light is perfect here', read: false, created: subMinutes(now, 20).toISOString() },
    { id: 'notif_3', type: 'follow', fromUserId: 'user_4', postId: null, commentId: null, text: 'started following you.', read: false, created: subMinutes(now, 45).toISOString() },
    { id: 'notif_4', type: 'like', fromUserId: 'user_5', postId: 'post_2', commentId: null, text: 'liked your photo.', read: false, created: subHours(now, 1).toISOString() },
    { id: 'notif_5', type: 'mention', fromUserId: 'user_2', postId: 'post_4', commentId: null, text: 'mentioned you in a comment.', read: false, created: subHours(now, 2).toISOString() },
    { id: 'notif_6', type: 'like_comment', fromUserId: 'user_2', postId: 'post_4', commentId: 'c_7', text: 'liked your comment.', read: true, created: subHours(now, 3).toISOString() },
    { id: 'notif_7', type: 'comment', fromUserId: 'user_7', postId: 'post_1', commentId: null, text: 'commented: You always nail the golden hour shots', read: true, created: subHours(now, 5).toISOString() },
    { id: 'notif_8', type: 'follow', fromUserId: 'user_8', postId: null, commentId: null, text: 'started following you.', read: true, created: subHours(now, 8).toISOString() },
    { id: 'notif_9', type: 'like', fromUserId: 'user_7', postId: 'post_3', commentId: null, text: 'liked your photo.', read: true, created: subHours(now, 12).toISOString() },
    { id: 'notif_10', type: 'mention', fromUserId: 'user_3', postId: 'post_6', commentId: null, text: 'mentioned you in a comment.', read: true, created: subDays(now, 1).toISOString() },
    { id: 'notif_11', type: 'like_comment', fromUserId: 'user_3', postId: 'post_6', commentId: 'c_13', text: 'liked your comment.', read: true, created: subDays(now, 1).toISOString() },
    { id: 'notif_12', type: 'comment', fromUserId: 'user_5', postId: 'post_2', commentId: null, text: 'commented: What an adventure!', read: true, created: subDays(now, 3).toISOString() },
    { id: 'notif_13', type: 'like', fromUserId: 'user_9', postId: 'post_4a', commentId: null, text: 'liked your photo.', read: false, created: subHours(now, 1).toISOString() },
    { id: 'notif_14', type: 'comment', fromUserId: 'user_9', postId: 'post_4a', commentId: 'c_6a', text: 'commented: Fellow street photographer here, these are incredible compositions', read: false, created: subDays(now, 2).toISOString() },
    { id: 'notif_15', type: 'follow', fromUserId: 'user_10', postId: null, commentId: null, text: 'started following you.', read: true, created: subDays(now, 5).toISOString() },
  ];

  // 6 conversations
  const conversations = [
    { id: 'conv_1', participants: [CURRENT_USER_ID, 'user_2'], lastMessage: 'Sounds good! See you there', lastMessageTime: subMinutes(now, 10).toISOString(), unreadCount: 0 },
    { id: 'conv_2', participants: [CURRENT_USER_ID, 'user_3'], lastMessage: 'Check out this new framework', lastMessageTime: subHours(now, 1).toISOString(), unreadCount: 2 },
    { id: 'conv_3', participants: [CURRENT_USER_ID, 'user_5'], lastMessage: 'The recipe turned out great!', lastMessageTime: subDays(now, 1).toISOString(), unreadCount: 0 },
    { id: 'conv_4', participants: [CURRENT_USER_ID, 'user_7'], lastMessage: 'Thanks for the workout plan!', lastMessageTime: subHours(now, 3).toISOString(), unreadCount: 1 },
    { id: 'conv_5', participants: [CURRENT_USER_ID, 'user_2', 'user_3'], lastMessage: 'Who is in for Saturday?', lastMessageTime: subHours(now, 5).toISOString(), unreadCount: 0 },
    { id: 'conv_6', participants: [CURRENT_USER_ID, 'user_9'], lastMessage: 'Would love to do a collab shoot', lastMessageTime: subHours(now, 2).toISOString(), unreadCount: 1 },
  ];

  // 30 messages across conversations
  const messages = [
    // conv_1 (user_2) - 6 messages
    { id: 'msg_1', conversationId: 'conv_1', senderId: 'user_2', text: 'Hey Alex! Love your latest photo', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 2).toISOString() },
    { id: 'msg_2', conversationId: 'conv_1', senderId: CURRENT_USER_ID, text: 'Thanks Alice! That means a lot', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 1).toISOString() },
    { id: 'msg_3', conversationId: 'conv_1', senderId: 'user_2', text: 'Want to do a photo walk this weekend?', type: 'text', imageUrl: null, sharedPostId: null, created: subMinutes(now, 50).toISOString() },
    { id: 'msg_4', conversationId: 'conv_1', senderId: CURRENT_USER_ID, text: 'That would be awesome! Golden Gate area?', type: 'text', imageUrl: null, sharedPostId: null, created: subMinutes(now, 40).toISOString() },
    { id: 'msg_5', conversationId: 'conv_1', senderId: 'user_2', text: 'https://picsum.photos/400/300?random=301', type: 'image', imageUrl: 'https://picsum.photos/400/300?random=301', sharedPostId: null, created: subMinutes(now, 30).toISOString() },
    { id: 'msg_6', conversationId: 'conv_1', senderId: CURRENT_USER_ID, text: 'Sounds good! See you there', type: 'text', imageUrl: null, sharedPostId: null, created: subMinutes(now, 10).toISOString() },

    // conv_2 (user_3) - 5 messages
    { id: 'msg_7', conversationId: 'conv_2', senderId: CURRENT_USER_ID, text: 'Hey Bob, have you tried the new React 19 features?', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 5).toISOString() },
    { id: 'msg_8', conversationId: 'conv_2', senderId: 'user_3', text: 'Yeah! Server components are amazing', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 4).toISOString() },
    { id: 'msg_9', conversationId: 'conv_2', senderId: CURRENT_USER_ID, text: 'Need to try it on my next project', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 3).toISOString() },
    { id: 'msg_10', conversationId: 'conv_2', senderId: 'user_3', text: '', type: 'post_share', imageUrl: null, sharedPostId: 'post_6', created: subHours(now, 2).toISOString() },
    { id: 'msg_11', conversationId: 'conv_2', senderId: 'user_3', text: 'Check out this new framework', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 1).toISOString() },

    // conv_3 (user_5) - 5 messages
    { id: 'msg_12', conversationId: 'conv_3', senderId: 'user_5', text: 'Hey! Tried the pasta recipe?', type: 'text', imageUrl: null, sharedPostId: null, created: subDays(now, 2).toISOString() },
    { id: 'msg_13', conversationId: 'conv_3', senderId: CURRENT_USER_ID, text: 'Yes! It was so good', type: 'text', imageUrl: null, sharedPostId: null, created: subDays(now, 2).toISOString() },
    { id: 'msg_14', conversationId: 'conv_3', senderId: CURRENT_USER_ID, text: 'https://picsum.photos/400/300?random=302', type: 'image', imageUrl: 'https://picsum.photos/400/300?random=302', sharedPostId: null, created: subDays(now, 1).toISOString() },
    { id: 'msg_15', conversationId: 'conv_3', senderId: 'user_5', text: 'Wow that looks great! You are a natural', type: 'text', imageUrl: null, sharedPostId: null, created: subDays(now, 1).toISOString() },
    { id: 'msg_16', conversationId: 'conv_3', senderId: CURRENT_USER_ID, text: 'The recipe turned out great!', type: 'text', imageUrl: null, sharedPostId: null, created: subDays(now, 1).toISOString() },

    // conv_4 (user_7) - 5 messages
    { id: 'msg_17', conversationId: 'conv_4', senderId: CURRENT_USER_ID, text: 'Hey Jake, can you send me that workout plan?', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 6).toISOString() },
    { id: 'msg_18', conversationId: 'conv_4', senderId: 'user_7', text: 'Sure! Here is the 4-week plan', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 5).toISOString() },
    { id: 'msg_19', conversationId: 'conv_4', senderId: 'user_7', text: 'Day 1: Upper body\nDay 2: Lower body\nDay 3: Rest\nDay 4: Full body\nDay 5: Cardio', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 5).toISOString() },
    { id: 'msg_20', conversationId: 'conv_4', senderId: CURRENT_USER_ID, text: 'This is perfect, thanks!', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 4).toISOString() },
    { id: 'msg_21', conversationId: 'conv_4', senderId: 'user_7', text: 'Thanks for the workout plan!', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 3).toISOString() },

    // conv_5 (group: user_2, user_3) - 4 messages
    { id: 'msg_22', conversationId: 'conv_5', senderId: 'user_2', text: 'Hey everyone! Planning a hike this weekend', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 8).toISOString() },
    { id: 'msg_23', conversationId: 'conv_5', senderId: 'user_3', text: 'Count me in!', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 7).toISOString() },
    { id: 'msg_24', conversationId: 'conv_5', senderId: CURRENT_USER_ID, text: 'Same! What trail?', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 6).toISOString() },
    { id: 'msg_25', conversationId: 'conv_5', senderId: 'user_2', text: 'Who is in for Saturday?', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 5).toISOString() },

    // conv_6 (user_9) - 5 messages
    { id: 'msg_26', conversationId: 'conv_6', senderId: 'user_9', text: 'Hey! Love your street photography work', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 4).toISOString() },
    { id: 'msg_27', conversationId: 'conv_6', senderId: CURRENT_USER_ID, text: 'Thanks! Your NYC shots are incredible', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 3).toISOString() },
    { id: 'msg_28', conversationId: 'conv_6', senderId: 'user_9', text: '', type: 'post_share', imageUrl: null, sharedPostId: 'post_16', created: subHours(now, 3).toISOString() },
    { id: 'msg_29', conversationId: 'conv_6', senderId: CURRENT_USER_ID, text: 'That bridge shot is unreal', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 2).toISOString() },
    { id: 'msg_30', conversationId: 'conv_6', senderId: 'user_9', text: 'Would love to do a collab shoot', type: 'text', imageUrl: null, sharedPostId: null, created: subHours(now, 2).toISOString() },
  ];

  // Saved post IDs by current user
  const savedPostIds = ['post_4', 'post_6', 'post_7'];

  return { users, posts, stories, notifications, conversations, messages, savedPostIds };
};

// --- Session-aware storage functions ---

const BASE_STORAGE_KEY = 'instagram_mock_state';
const BASE_INITIAL_KEY = 'instagram_mock_initialState';

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

function normalizeComment(comment, index) {
  return {
    id: comment.id || `c_custom_${index}`,
    userId: comment.userId || comment.user || comment.authorId || CURRENT_USER_ID,
    text: comment.text || comment.content || comment.body || '',
    created: comment.created || comment.createdAt || comment.timestamp || new Date().toISOString(),
    likes: Array.isArray(comment.likes) ? comment.likes : [],
    isReply: typeof comment.isReply === 'boolean' ? comment.isReply : false,
    replyToId: comment.replyToId || null,
  };
}

function normalizePost(post, index) {
  const likes = Array.isArray(post.likes) ? post.likes : [];
  const rawComments = Array.isArray(post.comments) ? post.comments : [];
  const images = Array.isArray(post.images) ? post.images : (post.image ? [post.image] : []);
  return {
    id: post.id || `post_custom_${index}`,
    userId: post.userId || post.user || post.authorId || CURRENT_USER_ID,
    images,
    caption: post.caption || post.content || post.text || '',
    location: post.location || '',
    taggedUsers: Array.isArray(post.taggedUsers) ? post.taggedUsers : [],
    likes,
    comments: rawComments.map((c, i) => normalizeComment(c, i)),
    saved: Array.isArray(post.saved) ? post.saved : [],
    created: post.created || post.createdAt || post.timestamp || new Date().toISOString(),
  };
}

function normalizeStory(story, index) {
  return {
    id: story.id || `story_custom_${index}`,
    userId: story.userId || story.user || CURRENT_USER_ID,
    image: story.image || story.img || story.media || '',
    created: story.created || story.createdAt || new Date().toISOString(),
    expires: story.expires || story.expiresAt || new Date(Date.now() + 86400000).toISOString(),
    viewed: typeof story.viewed === 'boolean' ? story.viewed : false,
  };
}

function normalizeUser(user) {
  return {
    id: user.id || '',
    username: user.username || user.handle || user.name || '',
    name: user.name || user.displayName || user.username || '',
    avatar: user.avatar || user.profilePic || user.image || '',
    bio: user.bio || user.about || user.description || '',
    website: user.website || '',
    followers: Array.isArray(user.followers) ? user.followers : [],
    following: Array.isArray(user.following) ? user.following : [],
    isVerified: typeof user.isVerified === 'boolean' ? user.isVerified : false,
    isPrivate: typeof user.isPrivate === 'boolean' ? user.isPrivate : false,
    isOnline: typeof user.isOnline === 'boolean' ? user.isOnline : false,
  };
}

function normalizeNotification(notif, index) {
  return {
    id: notif.id || `notif_custom_${index}`,
    type: notif.type || 'like',
    fromUserId: notif.fromUserId || notif.from || '',
    postId: notif.postId || null,
    commentId: notif.commentId || null,
    text: notif.text || '',
    read: typeof notif.read === 'boolean' ? notif.read : false,
    created: notif.created || notif.createdAt || new Date().toISOString(),
  };
}

function normalizeConversation(conv, index) {
  return {
    id: conv.id || `conv_custom_${index}`,
    participants: Array.isArray(conv.participants) ? conv.participants : [],
    lastMessage: conv.lastMessage || '',
    lastMessageTime: conv.lastMessageTime || new Date().toISOString(),
    unreadCount: typeof conv.unreadCount === 'number' ? conv.unreadCount : 0,
  };
}

function normalizeMessage(msg, index) {
  return {
    id: msg.id || `msg_custom_${index}`,
    conversationId: msg.conversationId || '',
    senderId: msg.senderId || msg.from || CURRENT_USER_ID,
    text: msg.text || '',
    type: msg.type || 'text',
    imageUrl: msg.imageUrl || null,
    sharedPostId: msg.sharedPostId || null,
    created: msg.created || msg.createdAt || new Date().toISOString(),
  };
}

const arrayNormalizers = {
  posts: normalizePost,
  stories: normalizeStory,
  notifications: normalizeNotification,
  conversations: normalizeConversation,
  messages: normalizeMessage,
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (Array.isArray(custom[key]) && arrayNormalizers[key]) {
        result[key] = custom[key].map((item, i) => arrayNormalizers[key](item, i));
      } else if (key === 'users' && typeof custom[key] === 'object' && !Array.isArray(custom[key])) {
        const mergedUsers = { ...defaults[key] };
        for (const userId in custom[key]) {
          mergedUsers[userId] = normalizeUser(custom[key][userId]);
        }
        result[key] = mergedUsers;
      } else if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

function getDefaultData() {
  return generateInitialData();
}

export { BASE_INITIAL_KEY };

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const initialData = deepMergeWithDefaults(getDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(initialData));
    localStorage.setItem(ik, JSON.stringify(initialData));
    return initialData;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const initialData = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(initialData));
  localStorage.setItem(ik, JSON.stringify(initialData));
  return initialData;
};
