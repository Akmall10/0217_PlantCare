const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const treatmentRoutes = require('./routes/treatment.routes');
const plantRoutes = require('./routes/plant.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const journalRoutes = require('./routes/journal.routes');
const { fail } = require('./utils/response');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/treatments', treatmentRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/journals', journalRoutes);

// 404 untuk route yang tidak ada
app.use((req, res) => fail(res, 'Endpoint tidak ditemukan', 404));

module.exports = app;
