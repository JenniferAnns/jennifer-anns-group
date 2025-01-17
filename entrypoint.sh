#!/bin/bash

if [ ! -f "./.env" ]; then
  echo "Secrets not found. Pulling files from Bitwarden..."
  if [[ -z "${BW_PASSWORD}" ]]; then
    echo "Error: BW_PASSWORD envvar is not defined. Please inject BW_PASSWORD into container!"
    exit 1;
  fi

  npm install -g @bitwarden/cli fx
  # get secrets
  bw logout
  export BW_SESSION=$(bw login product@bitsofgood.org ${BW_PASSWORD} --raw);
  bw sync --session $BW_SESSION
  bw get item 59607d65-8de1-4105-8eaf-b11f0038670ca | fx .notes > ".env"

  echo "Secrets successfully retrieved."
else
  echo "Secrets already loaded, no need for BW_PASSWORD. If you need to refetch, delete .env and re-sync."
fi
echo "Checking if primary admin emails exist"

exec "$@"
