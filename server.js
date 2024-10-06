const mongoose = require('mongoose');
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception ! shuting down ...');
  console.log(err.name, err.message);
  process.exit(1);
});
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATA_PASSWORD
);

mongoose.connect(DB, {}).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled rejection ! the app will  shutdown');
  server.close(() => {
    process.exit(1);
  });
});
