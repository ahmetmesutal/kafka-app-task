const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB bağlantısı başarılı');
}).catch((err) => {
  console.error('MongoDB bağlantısı başarısız', err);
});
