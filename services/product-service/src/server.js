require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3002;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`📦 Product Service en écoute sur le port ${PORT} (${process.env.NODE_ENV})`);
    });
  } catch (err) {
    console.error('❌ Démarrage du Product Service échoué :', err.message);
    process.exit(1);
  }
};

start();
