import bcrypt from 'bcryptjs';
import sequelize from '../db/sequelize';
import User from '../models/User';

// Attende che il database sia pronto
async function waitForDatabase(retries = 10, delayMs = 2000) {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log('✅ Connessione al DB riuscita');
      return;
    } catch (err) {
      console.log(`⏳ Tentativo fallito. Riprovo tra ${delayMs / 1000} secondi...`);
      retries--;
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error('❌ Impossibile connettersi al database dopo diversi tentativi.');
}

async function seed() {
  try {
    await waitForDatabase(); // Aspetta il DB prima di proseguire
    await sequelize.sync();

    const users = [
      {
        username: 'admin',
        password: 'password0',
        tokens: 100,
        role: 'admin' as const
      },
      {
        username: 'utenteUno',
        password: 'passwordUno',
        tokens: 10,
        role: 'user' as const
      },
      {
        username: 'utenteDue',
        password: 'passwordDue',
        tokens: 10,
        role: 'user' as const
      }
    ];

    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const [user, created] = await User.findOrCreate({
        where: { username: u.username },
        defaults: {
          username: u.username,
          password_hash: hashedPassword,
          tokens: u.tokens,
          role: u.role
        }
      });
      console.log(created ? `✅ Creato: ${u.username}` : `ℹ️ Esiste già: ${u.username}`);
    }
  } catch (err) {
    console.error('❌ Errore nel seed:', err);
  } finally {
    await sequelize.close();
  }
}

seed();