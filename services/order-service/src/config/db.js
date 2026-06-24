const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI manquant dans les variables d\'environnement');

  await mongoose.connect(uri);
  console.log(`✅ MongoDB connecté (${mongoose.connection.name})`);
};

module.exports = connectDB;
