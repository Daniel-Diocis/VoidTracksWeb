#!/bin/sh

echo "Esecuzione seed iniziale..."
npm run seed

echo "Avvio dell'applicazione..."
exec npm run start
