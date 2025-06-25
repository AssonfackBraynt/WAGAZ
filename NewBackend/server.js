const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    await sequelize.sync({ force: true });
    console.log('📦 Models synchronized.');

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
  }
})();
