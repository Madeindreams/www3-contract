# Use the official Node.js image as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /hardhat

# Copy the package.json and package-lock.json (if you have it) to the container
COPY . ./

# Install Hardhat globally
RUN yarn install --non-interactive


# Don't put a real key here. This is only for a local hardhat instance and is already known
ENV OWNER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ENV VALIDATOR_PRIVATE_KEY=0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

COPY $PWD/docker/entrypoint.sh ./


# Expose the necessary ports (8545 for JSON-RPC)
EXPOSE 8545

# Set the default command to run the Hardhat node
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]