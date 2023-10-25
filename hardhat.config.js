require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
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
          // interval: 5000
        },
      },
    },
    paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./artifacts"
},
    gasReporter: {
      enabled: true
    },
  solidity: "0.8.21"
};
