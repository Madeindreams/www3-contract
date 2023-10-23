require("@nomicfoundation/hardhat-toolbox");
const WWW3Contract = require('../artifacts/contracts/WorldWideWeb3.sol/WorldWideWeb3.json')
const WWW3ShareContract = require('../artifacts/contracts/WWW3Shares.sol/WWW3Shares.json')
const { ethers, NonceManager } = require("ethers");
const name = "idecentralize";
const version = "1";

const tokenName = "WWW3 Shares";
const tokenSymbol = "W3S";

const maxAmountOfShares = ethers.parseEther("5000000");
const privateSellAmount = ethers.parseEther("1500000");
const initialSharePrice = ethers.parseEther("0.0006")
const vestingPeriod = 2598800; // about one year in terms of block

task(
    "deploy-www3",
    "Deploy The contract",
    async (_, { network }) => {
        const provider = new ethers.JsonRpcProvider(process.env.LOCAL_RPC);
        const owner = new NonceManager(new ethers.Wallet(process.env.LOCAL_OWNER_PRIVATE_KEY, provider));
        const validator = new ethers.Wallet(process.env.LOCAL_VALIDATOR_PRIVATE_KEY, provider);

        // deploy www3 share contract 
        const WWW3Shares = new ethers.ContractFactory(WWW3ShareContract.abi, WWW3ShareContract.bytecode, owner);
        const www3Shares = await WWW3Shares.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, 
            privateSellAmount, vestingPeriod);
        console.log("share contract address", www3Shares.target)

        // deploy www3
        const WWW3 = new ethers.ContractFactory(WWW3Contract.abi, WWW3Contract.bytecode, owner);
        const www3 = await WWW3.deploy(name, version, validator.address, www3Shares.target);
        console.log("www3 address", www3.target)
    })

