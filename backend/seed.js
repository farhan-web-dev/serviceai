require('dotenv').config();
const mongoose = require('mongoose');
const Provider = require('./models/Provider');

const providers = [
  {
    name: 'Ali Raza',
    avatar: 'https://i.pravatar.cc/150?u=ali',
    category: 'AC Technician',
    location: 'G-13, Islamabad',
    rating: 4.8,
    availability: true,
    distance: '2 km'
  },
  {
    name: 'Usman Plumber',
    avatar: 'https://i.pravatar.cc/150?u=usman',
    category: 'Plumber',
    location: 'F-10, Islamabad',
    rating: 4.5,
    availability: true,
    distance: '5 km'
  },
  {
    name: 'Sana Beautician',
    avatar: 'https://i.pravatar.cc/150?u=sana',
    category: 'Beautician',
    location: 'G-13, Islamabad',
    rating: 4.9,
    availability: true,
    distance: '1.5 km'
  },
  {
    name: 'Ahmed Electrician',
    avatar: 'https://i.pravatar.cc/150?u=ahmed',
    category: 'Electrician',
    location: 'I-8, Islamabad',
    rating: 4.6,
    availability: false,
    distance: '8 km'
  },
  {
    name: 'Hassan Tutor',
    avatar: 'https://i.pravatar.cc/150?u=hassan',
    category: 'Tutor',
    location: 'G-13, Islamabad',
    rating: 5.0,
    availability: true,
    distance: '0.5 km'
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Provider.deleteMany({});
    await Provider.insertMany(providers);
    console.log('Providers seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
