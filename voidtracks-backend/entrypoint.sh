#!/bin/sh

echo "Compilazione TypeScript..."
npm run build

echo "Esecuzione seed iniziale..."
npm run seed

echo "Avvio dell'applicazione..."
npm run start