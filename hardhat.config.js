require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
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
           url: "https://eth-mainnet.alchemyapi.io/v2/"+process.env.ALCHEMY_API_KEY,
           //url: "http://192.168.2.16:8545",
          },
      },
    },

    paths: {
    sources: "./contracts",
    tests: "./test",
    artifacts: "./artifacts",
  
},
  solidity: "0.8.20",
};
