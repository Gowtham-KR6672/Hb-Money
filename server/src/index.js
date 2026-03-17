import app from './app.js';
import ensureAdminUser from './services/adminSeedService.js';
import connectDb from './config/db.js';
import { scheduleMonthlyStatements } from './services/statementScheduler.js';

const port = process.env.PORT || 5000;

async function bootstrap() {
  await connectDb();
  await ensureAdminUser();
  scheduleMonthlyStatements();
  app.listen(port, () => {
    console.log(`HB Money API running on port ${port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start HB Money API', error);
  process.exit(1);
});
