const { sequelize, User, Media, Subscription } = require('../models');
const { generatePlaceholderFiles } = require('./generateFiles');

const musicTracks = [
  { title: 'Summer Vibes', description: 'Relaxing summer music with tropical beats', category: 'Pop', isPremium: false },
  { title: 'Electric Pulse', description: 'Electronic dance music that hits hard', category: 'Electronic', isPremium: false },
  { title: 'Midnight Dreams', description: 'Dreamy night vibes for late night sessions', category: 'Ambient', isPremium: false },
  { title: 'Ocean Waves Meditation', description: 'Calm ocean sounds for relaxation and meditation', category: 'Ambient', isPremium: false },
  { title: 'Urban Beats', description: 'City hip-hop beats for the streets', category: 'Hip-Hop', isPremium: false },
  { title: 'Classical Morning', description: 'Classical music for peaceful mornings', category: 'Classical', isPremium: true },
  { title: 'Jazz Nights', description: 'Smooth jazz music for romantic evenings', category: 'Jazz', isPremium: true },
  { title: 'Rock Revolution', description: 'Classic rock anthems that never get old', category: 'Rock', isPremium: false },
  { title: 'Pop Sensation', description: 'Latest pop hits from top artists', category: 'Pop', isPremium: false },
  { title: 'Ambient Chill', description: 'Ambient electronic music for deep focus', category: 'Ambient', isPremium: true },
  { title: 'Acoustic Sessions', description: 'Unplugged acoustic songs with raw emotions', category: 'Acoustic', isPremium: false },
  { title: 'Techno Factory', description: 'Industrial techno beats from the underground', category: 'Techno', isPremium: true },
  { title: 'Folk Tales', description: 'Traditional folk music from around the world', category: 'Folk', isPremium: false },
  { title: 'R&B Groove', description: 'Smooth R&B tracks for your playlist', category: 'R&B', isPremium: false },
  { title: 'Indie Discovery', description: 'Indie music collection from rising stars', category: 'Indie', isPremium: true },
  { title: 'Latin Fiesta', description: 'Latin dance music to get you moving', category: 'Latin', isPremium: false },
  { title: 'Country Roads', description: 'Country music hits for the soul', category: 'Country', isPremium: false },
  { title: 'EDM Festival', description: 'Festival EDM tracks for the main stage', category: 'Electronic', isPremium: true },
  { title: 'Reggae Vibes', description: 'Jamaican reggae music for good times', category: 'Reggae', isPremium: false },
  { title: 'Blues Journey', description: 'Deep blues music with soul', category: 'Blues', isPremium: true },
  { title: 'Hip-Hop Chronicles', description: 'Hip-hop classics from the golden era', category: 'Hip-Hop', isPremium: false },
  { title: 'Trance State', description: 'Trance music journey to another dimension', category: 'Electronic', isPremium: true },
  { title: 'Soulful Sundays', description: 'Soul music playlist for lazy Sundays', category: 'Soul', isPremium: false },
  { title: 'Metal Mayhem', description: 'Heavy metal tracks for headbanging', category: 'Metal', isPremium: false },
  { title: 'K-Pop Wave', description: 'Korean pop music trending worldwide', category: 'K-Pop', isPremium: true },
  { title: 'Lo-Fi Study', description: 'Lo-fi beats perfect for studying', category: 'Lo-Fi', isPremium: false },
  { title: 'World Music Tour', description: 'Music from around the globe', category: 'World', isPremium: true },
  { title: 'Synthwave Dreams', description: 'Retro synthwave music for nostalgia', category: 'Electronic', isPremium: false },
  { title: 'Gospel Glory', description: 'Gospel music collection uplifting spirits', category: 'Gospel', isPremium: false },
  { title: 'Cinematic Score', description: 'Epic movie soundtracks and scores', category: 'Classical', isPremium: true },
  { title: 'Funky Groove', description: 'Funky bass lines that make you move', category: 'Funk', isPremium: false },
  { title: 'Punk Energy', description: 'High energy punk rock anthems', category: 'Punk', isPremium: false },
  { title: 'Smooth Jazz Lounge', description: 'Relaxed jazz for your evening unwind', category: 'Jazz', isPremium: false },
  { title: 'Bass Drop', description: 'Heavy bass electronic tracks', category: 'Electronic', isPremium: true },
  { title: 'Acoustic Love', description: 'Romantic acoustic ballads', category: 'Acoustic', isPremium: false },
  { title: 'Trap Kingdom', description: 'Hard-hitting trap beats', category: 'Hip-Hop', isPremium: true },
  { title: 'Indie Rock Roadtrip', description: 'Indie rock for the open road', category: 'Indie', isPremium: false },
  { title: 'Deep House Session', description: 'Deep house music for late nights', category: 'Electronic', isPremium: true },
  { title: 'Bluegrass Morning', description: 'Bluegrass folk music with banjo', category: 'Folk', isPremium: false },
  { title: 'Afrobeat Rhythm', description: 'African rhythm and beats explosion', category: 'World', isPremium: false },
];

const videoContents = [
  { title: 'Live Concert Experience', description: 'Full live concert recording with amazing visuals', category: 'Rock', isPremium: true },
  { title: 'Music Video Collab', description: 'Artist music video collaboration', category: 'Pop', isPremium: false },
  { title: 'Guitar Tutorial', description: 'Learn guitar step by step from basics', category: 'Acoustic', isPremium: false },
  { title: 'Music Documentary', description: 'Behind the music documentary series', category: 'Rock', isPremium: true },
  { title: 'Piano Lessons', description: 'Piano tutorial series for beginners', category: 'Classical', isPremium: false },
  { title: 'Studio Session', description: 'Behind the scenes studio recording', category: 'R&B', isPremium: true },
  { title: 'Music Theory 101', description: 'Learn music theory basics', category: 'Classical', isPremium: false },
  { title: 'DJ Mix Set', description: 'DJ performance mix from top DJs', category: 'Electronic', isPremium: true },
  { title: 'Drum Tutorial', description: 'Drumming lessons for all levels', category: 'Rock', isPremium: false },
  { title: 'Band Interview', description: 'Exclusive band interview session', category: 'Indie', isPremium: true },
  { title: 'Songwriting Tips', description: 'Learn to write better songs', category: 'Acoustic', isPremium: false },
  { title: 'Live Festival Highlights', description: 'Best festival moments compilation', category: 'Electronic', isPremium: true },
  { title: 'Music Production', description: 'Learn music production techniques', category: 'Electronic', isPremium: false },
  { title: 'Vocal Training', description: 'Improve your vocals with exercises', category: 'Pop', isPremium: false },
  { title: 'Album Review', description: 'Review of latest album releases', category: 'Indie', isPremium: true },
  { title: 'Concert Footage', description: 'Historic concert clips archive', category: 'Rock', isPremium: true },
  { title: 'Music Tech Review', description: 'Gadgets and gear reviews for musicians', category: 'Electronic', isPremium: false },
  { title: 'Jazz Improvisation', description: 'Learn jazz solo techniques', category: 'Jazz', isPremium: true },
  { title: 'Beat Making', description: 'Create beats from scratch tutorial', category: 'Hip-Hop', isPremium: false },
  { title: 'Music Industry Talk', description: 'Industry insights and advice', category: 'R&B', isPremium: true },
  { title: 'Classical Performance', description: 'Orchestra live performance recording', category: 'Classical', isPremium: true },
  { title: 'Electronic Music Lab', description: 'EDM production tips and tricks', category: 'Electronic', isPremium: false },
  { title: 'Acoustic Sessions Live', description: 'Unplugged live performances', category: 'Acoustic', isPremium: false },
  { title: 'Hip-Hop History', description: 'Documentary on hip-hop culture', category: 'Hip-Hop', isPremium: true },
  { title: 'Sound Design Basics', description: 'Create unique sounds from nothing', category: 'Electronic', isPremium: false },
  { title: 'Live Jam Session', description: 'Improvised music session with artists', category: 'Jazz', isPremium: true },
  { title: 'Music Business', description: 'Managing your music career tips', category: 'Hip-Hop', isPremium: false },
  { title: 'Festival Preview', description: 'Upcoming music festivals preview', category: 'Electronic', isPremium: true },
  { title: 'Producer Spotlight', description: 'Interview with top producers', category: 'R&B', isPremium: false },
  { title: 'Retro Music Vault', description: 'Classic music archive collection', category: 'Rock', isPremium: true },
  { title: 'Country Music Stories', description: 'Country music storytelling session', category: 'Country', isPremium: false },
  { title: 'Metal Guitar Masters', description: 'Shredding guitar techniques from pros', category: 'Metal', isPremium: true },
  { title: 'Reggae Sunset Session', description: 'Reggae music from tropical locations', category: 'Reggae', isPremium: false },
  { title: 'Blues Guitar Legends', description: 'Legendary blues guitar performances', category: 'Blues', isPremium: true },
  { title: 'Latin Dance Fever', description: 'Latin dance music videos', category: 'Latin', isPremium: false },
];

const users = [
  { username: 'admin', email: 'admin@musicstream.com', password: '123', role: 'admin' },
  { username: 'john_doe', email: 'john@example.com', password: 'password123', role: 'user' },
  { username: 'jane_smith', email: 'jane@example.com', password: 'password123', role: 'user' },
  { username: 'bob_wilson', email: 'bob@example.com', password: 'password123', role: 'user' },
  { username: 'alice_brown', email: 'alice@example.com', password: 'password123', role: 'user' },
  { username: 'mike_johnson', email: 'mike@example.com', password: 'password123', role: 'user' },
  { username: 'sarah_davis', email: 'sarah@example.com', password: 'password123', role: 'user' },
  { username: 'david_lee', email: 'david@example.com', password: 'password123', role: 'user' },
  { username: 'emma_taylor', email: 'emma@example.com', password: 'password123', role: 'user' }
];

const premiumUsers = ['john_doe', 'jane_smith', 'bob_wilson'];

async function seed() {
  try {
    console.log('Generating placeholder media files...');
    generatePlaceholderFiles();
    
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    const createdUsers = {};
    for (const userData of users) {
      const user = await User.create({
        username: userData.username,
        email: userData.email,
        passwordHash: await User.hashPassword(userData.password),
        role: userData.role,
        isActive: true
      });
      createdUsers[userData.username] = user;
      console.log(`Created user: ${user.username}`);
    }

    for (let i = 0; i < musicTracks.length; i++) {
      const track = musicTracks[i];
      const userKeys = Object.keys(createdUsers);
      const randomUser = createdUsers[userKeys[Math.floor(Math.random() * userKeys.length)]];

       await Media.create({
         title: track.title,
         description: track.description,
         category: track.category,
         fileUrl: `/uploads/music/track_${i + 1}.mp3`,
         thumbnailUrl: `/uploads/thumbnails/music_${i + 1}.svg`,
         mediaType: 'audio',
        userId: randomUser.id,
        isPremium: track.isPremium,
        plays: Math.floor(Math.random() * 10000),
        duration: 120 + Math.floor(Math.random() * 240),
        fileSize: 3000000 + Math.floor(Math.random() * 15000000),
        mimeType: 'audio/mpeg'
      });
    }
    console.log(`Created ${musicTracks.length} music tracks with categories.`);

    for (let i = 0; i < videoContents.length; i++) {
      const video = videoContents[i];
      const userKeys = Object.keys(createdUsers);
      const randomUser = createdUsers[userKeys[Math.floor(Math.random() * userKeys.length)]];

       await Media.create({
         title: video.title,
         description: video.description,
         category: video.category,
         fileUrl: `/uploads/videos/video_${i + 1}.mp4`,
         thumbnailUrl: `/uploads/thumbnails/video_${i + 1}.svg`,
         mediaType: 'video',
        userId: randomUser.id,
        isPremium: video.isPremium,
        plays: Math.floor(Math.random() * 5000),
        duration: 180 + Math.floor(Math.random() * 2700),
        fileSize: 30000000 + Math.floor(Math.random() * 700000000),
        mimeType: 'video/mp4'
      });
    }
    console.log(`Created ${videoContents.length} video contents with categories.`);

    for (const username of premiumUsers) {
      const user = createdUsers[username];
      await Subscription.create({
        userId: user.id,
        plan: 'yearly',
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
      console.log(`Created subscription for: ${username}`);
    }

    console.log('\n========================================');
    console.log('Seed completed successfully!');
    console.log('========================================');
    console.log('\nTest Credentials:');
    console.log('--------------------------------------');
    console.log('Admin:     admin / 123');
    console.log('User:      john_doe / password123');
    console.log('--------------------------------------');
    console.log(`\nTotal Users: ${users.length}`);
    console.log(`Total Music Tracks: ${musicTracks.length}`);
    console.log(`Total Videos: ${videoContents.length}`);
    console.log(`Premium Users: ${premiumUsers.length}`);
    console.log(`Categories Available: 24 genres`);
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
