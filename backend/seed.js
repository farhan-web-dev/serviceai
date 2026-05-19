require('dotenv').config();
const mongoose = require('mongoose');
const Provider = require('./models/Provider');

const providers = [
  // AC Technicians
  { name: 'Ali Raza', avatar: 'https://i.pravatar.cc/150?u=ali', category: 'AC Technician', location: 'G-13, Islamabad', rating: 4.8, price: 1500, availability: true, distance: '2 km' },
  { name: 'Kamran Cooling', avatar: 'https://i.pravatar.cc/150?u=kamran', category: 'AC Technician', location: 'F-8, Islamabad', rating: 4.2, price: 1200, availability: true, distance: '8 km' },
  { name: 'Zain AC Experts', avatar: 'https://i.pravatar.cc/150?u=zain', category: 'AC Technician', location: 'G-11, Islamabad', rating: 4.9, price: 2000, availability: false, distance: '4 km' },
  
  // Plumbers
  { name: 'Usman Plumber', avatar: 'https://i.pravatar.cc/150?u=usman', category: 'Plumber', location: 'F-10, Islamabad', rating: 4.5, price: 800, availability: true, distance: '5 km' },
  { name: 'Rizwan Pipes', avatar: 'https://i.pravatar.cc/150?u=rizwan', category: 'Plumber', location: 'G-13, Islamabad', rating: 4.1, price: 600, availability: true, distance: '1 km' },
  { name: 'Super Plumbing', avatar: 'https://i.pravatar.cc/150?u=super', category: 'Plumber', location: 'I-8, Islamabad', rating: 4.9, price: 1500, availability: true, distance: '10 km' },

  // Beauticians
  { name: 'Sana Beautician', avatar: 'https://i.pravatar.cc/150?u=sana', category: 'Beautician', location: 'G-13, Islamabad', rating: 4.9, price: 3000, availability: true, distance: '1.5 km' },
  { name: 'Ayesha Salon', avatar: 'https://i.pravatar.cc/150?u=ayesha', category: 'Beautician', location: 'F-7, Islamabad', rating: 4.6, price: 5000, availability: true, distance: '12 km' },
  { name: 'Zara Glow', avatar: 'https://i.pravatar.cc/150?u=zara', category: 'Beautician', location: 'G-11, Islamabad', rating: 4.2, price: 2000, availability: false, distance: '5 km' },

  // Electricians
  { name: 'Ahmed Electrician', avatar: 'https://i.pravatar.cc/150?u=ahmed', category: 'Electrician', location: 'I-8, Islamabad', rating: 4.6, price: 1000, availability: false, distance: '8 km' },
  { name: 'Bilal Sparks', avatar: 'https://i.pravatar.cc/150?u=bilal', category: 'Electrician', location: 'G-13, Islamabad', rating: 4.8, price: 1200, availability: true, distance: '2 km' },
  { name: 'Fast Electric', avatar: 'https://i.pravatar.cc/150?u=fast', category: 'Electrician', location: 'F-11, Islamabad', rating: 4.3, price: 800, availability: true, distance: '6 km' },

  // Tutors
  { name: 'Hassan Tutor', avatar: 'https://i.pravatar.cc/150?u=hassan', category: 'Tutor', location: 'G-13, Islamabad', rating: 5.0, price: 5000, availability: true, distance: '0.5 km' },
  { name: 'Tariq Math Expert', avatar: 'https://i.pravatar.cc/150?u=tariq', category: 'Tutor', location: 'F-10, Islamabad', rating: 4.7, price: 4000, availability: true, distance: '5 km' },
  { name: 'Nida Science Tutor', avatar: 'https://i.pravatar.cc/150?u=nida', category: 'Tutor', location: 'I-8, Islamabad', rating: 4.8, price: 4500, availability: false, distance: '9 km' }
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
