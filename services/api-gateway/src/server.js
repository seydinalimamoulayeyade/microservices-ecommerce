require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚪 API Gateway en écoute sur le port ${PORT} (${process.env.NODE_ENV})`);
});
