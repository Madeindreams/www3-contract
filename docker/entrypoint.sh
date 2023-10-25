#!/bin/sh

# Change to the correct directory
cd /hardhat;

# Run hardhat
yarn start:local &

npx wait-on http://127.0.0.1:8545 && yarn deploy:local;

# Keep node alive
wait $!