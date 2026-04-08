const mongoose = require('mongoose');
const User = require('./models/User');
const Message = require('./models/Message');

mongoose.connect('mongodb://localhost:27017/socialapp');

async function seedChatData() {
  try {
    await User.deleteMany({});
    await Message.deleteMany({});

    const users = await User.insertMany([
      {
        name: "Sarah Johnson",
        email: "sarah@social.com",
        password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        profilePic: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        isOnline: true
      },
      {
        name: "Mike Chen",
        email: "mike@social.com",
        password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      {
        name: "Emma Davis",
        email: "emma@social.com", 
        password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
        profilePic: "https://images.unsplash.com/photo-1549488230-123d827e9899?w=150"
      }
    ]);

    const [sarah, mike, emma] = users;

    await Message.insertMany([
      { sender: mike._id, receiver: sarah._id, text: "Hey Sarah! Great sunset photo! 🌅", isRead: false },
      { sender: sarah._id, receiver: mike._id, text: "Thanks Mike! 😊 You should come next time!" },
      { sender: mike._id, receiver: sarah._id, text: "Definitely! When's the next one?" },
        
      { sender: emma._id, receiver: sarah._id, text: "Love your photography Sarah! 📸", isRead: true },
      { sender: sarah._id, receiver: emma._id, text: "Aww thank you Emma! 🥰" }
    ]);

    console.log('✅ CHAT DATA SEEDED!');
    console.log('👥 Users:');
    console.log('- sarah@social.com / password123');
    console.log('- mike@social.com / password123');
    console.log('💬 5 Messages created - People will show on left!');
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedChatData();