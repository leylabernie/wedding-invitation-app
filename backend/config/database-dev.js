// In-memory database for development
const users = [];
const events = [];
const guests = [];
const designs = [];
const notifications = [];
const exports = [];

let counter = {
  users: 1,
  events: 1,
  guests: 1,
  designs: 1,
  notifications: 1,
  exports: 1
};

// Mock connection function
const connectDB = async () => {
  console.log('🗄️  Using in-memory database for development');
  console.log('⚠️  Note: Data will be lost when server restarts');
  return Promise.resolve();
};

// Helper functions for data management
const getNextId = (type) => {
  return counter[type]++;
};

const findById = (collection, id) => {
  return collection.find(item => item._id === id);
};

const findByEmail = (email) => {
  return users.find(user => user.email === email);
};

const save = (collection, data) => {
  const item = {
    _id: getNextId(collection === users ? 'users' : 
                 collection === events ? 'events' : 
                 collection === guests ? 'guests' : 
                 collection === designs ? 'designs' : 
                 collection === notifications ? 'notifications' : 'exports'),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  collection.push(item);
  return item;
};

const update = (collection, id, data) => {
  const index = collection.findIndex(item => item._id === id);
  if (index !== -1) {
    collection[index] = {
      ...collection[index],
      ...data,
      updatedAt: new Date()
    };
    return collection[index];
  }
  return null;
};

const remove = (collection, id) => {
  const index = collection.findIndex(item => item._id === id);
  if (index !== -1) {
    return collection.splice(index, 1)[0];
  }
  return null;
};

// Simple mock mongoose-like models
const UserModel = {
  create: (data) => Promise.resolve(save(users, data)),
  findOne: ({ email }) => Promise.resolve(findByEmail(email) || null),
  findById: (id) => Promise.resolve(findById(users, id) || null),
  find: () => Promise.resolve(users),
  findByIdAndUpdate: (id, data) => Promise.resolve(update(users, id, data)),
  findByIdAndDelete: (id) => Promise.resolve(remove(users, id))
};

const EventModel = {
  create: (data) => Promise.resolve(save(events, data)),
  find: () => Promise.resolve(events),
  findById: (id) => Promise.resolve(findById(events, id) || null),
  findByIdAndUpdate: (id, data) => Promise.resolve(update(events, id, data)),
  findByIdAndDelete: (id) => Promise.resolve(remove(events, id))
};

const GuestModel = {
  create: (data) => Promise.resolve(save(guests, data)),
  find: () => Promise.resolve(guests),
  findById: (id) => Promise.resolve(findById(guests, id) || null),
  findByIdAndUpdate: (id, data) => Promise.resolve(update(guests, id, data)),
  findByIdAndDelete: (id) => Promise.resolve(remove(guests, id))
};

const DesignModel = {
  create: (data) => Promise.resolve(save(designs, data)),
  find: () => Promise.resolve(designs),
  findById: (id) => Promise.resolve(findById(designs, id) || null),
  findByIdAndUpdate: (id, data) => Promise.resolve(update(designs, id, data)),
  findByIdAndDelete: (id) => Promise.resolve(remove(designs, id))
};

module.exports = {
  connectDB,
  users,
  events,
  guests,
  designs,
  notifications,
  exports,
  findById,
  findByEmail,
  save,
  update,
  remove,
  // Mock models
  User: UserModel,
  Event: EventModel,
  Guest: GuestModel,
  Design: DesignModel
};