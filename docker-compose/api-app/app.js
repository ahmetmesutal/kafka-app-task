require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Event = require('./models/event');
const app = express();

app.use((req, res, next) => {
  console.log(JSON.stringify({
    path: req.path,
    headers: req.headers
  }));
  next();
});

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch((err) => console.error('MongoDB bağlantı hatası:', err));

app.get('/events', async (req, res) => {
  try {
    const { eventType, startTimestamp, endTimestamp, page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const filters = {};
    if (eventType) filters.eventType = eventType;
    if (startTimestamp || endTimestamp) {
      filters.timestamp = {};
      if (startTimestamp) filters.timestamp.$gte = new Date(startTimestamp);
      if (endTimestamp) filters.timestamp.$lte = new Date(endTimestamp);
    }

    const events = await Event.find(filters)
      .skip(skip)
      .limit(Number(limit))
      .exec();

    res.json(events);
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).send('Sunucu hatası');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API çalışıyor: http://localhost:${PORT}`);
});
