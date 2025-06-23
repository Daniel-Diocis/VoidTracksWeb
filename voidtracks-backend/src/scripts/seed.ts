import bcrypt from "bcryptjs";
import { getSequelizeInstance } from "../db/sequelize";
import User from "../models/User";

const sequelize = getSequelizeInstance();

/**
 * Tenta di connettersi al database, riprovando più volte in caso di errore.
 * Utile per garantire che il database sia pronto prima di eseguire il seed.
 *
 * @param retries - Numero massimo di tentativi (default: 10)
 * @param delayMs - Millisecondi di attesa tra un tentativo e l'altro (default: 2000 ms)
 * @throws Errore se la connessione non riesce dopo tutti i tentativi
 */
async function waitForDatabase(retries = 10, delayMs = 2000) {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("Connessione al DB riuscita");
      return;
    } catch (err) {
      console.log(
        `Tentativo fallito. Riprovo tra ${delayMs / 1000} secondi...`
      );
      retries--;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
  throw new Error(
    "Impossibile connettersi al database dopo diversi tentativi."
  );
}

/**
 * Esegue il seeding del database, inserendo utenti di esempio.
 * - Crea tre utenti: un admin e due utenti standard
 * - Applica hash alle password
 * - Evita duplicati usando `findOrCreate`
 */
async function seed() {
  try {
    await waitForDatabase(); // Verifica connessione al DB
    await sequelize.sync(); // Sincronizza i modelli

    const users = [
      {
        username: "admin",
        password: "password0",
        tokens: 100,
        role: "admin" as const,
      },
      {
        username: "utenteUno",
        password: "passwordUno",
        tokens: 10,
        role: "user" as const,
      },
      {
        username: "utenteDue",
        password: "passwordDue",
        tokens: 10,
        role: "user" as const,
      },
    ];

    for (const u of users) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const [user, created] = await User.findOrCreate({
        where: { username: u.username },
        defaults: {
          username: u.username,
          password_hash: hashedPassword,
          tokens: u.tokens,
          role: u.role,
        },
      });
      console.log(
        created ? `Creato: ${u.username}` : `Esiste già: ${u.username}`
      );
    }
  } catch (err) {
    console.error("Errore nel seed:", err);
  } finally {
    await sequelize.close();
  }
}

// Avvia il seeding
seed();