require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
require("./tasks/deployment.js");
require('solidity-coverage');
require("hardhat-gas-reporter");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
  networks: {
      hardhat: {
        mining: {
          auto: true,
          interval: 5000
        },
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
    gasReporter: {
      enabled: true
    },
  solidity: "0.8.21"
};
