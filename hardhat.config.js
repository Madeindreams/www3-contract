require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

require("./tasks/deployment.js");
require("./tasks/sign.js");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
  networks: {
      hardhat: {
        mining: {
          auto: true,
          interval: 5000
        },
          forking: {
           url: "https://eth-mainnet.alchemyapi.io/v2/"+process.env.ALCHEMY_API_KEY
          }
      }
    },
    paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./artifacts"
},
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,

    },
  solidity: "0.8.20"
};
