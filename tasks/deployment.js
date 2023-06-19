require("@nomicfoundation/hardhat-toolbox");
const contract = require('../artifacts/contracts/WorldWideWeb3.sol/WorldWideWeb3.json')
const {ethers} = require("ethers");
const name = "idecentralize";
const version = "1";

const tokenName = "IDFI";
const tokenSymbol = "IDFI";

task(
    "deploy-www3",
    "Deploy The contract",
    async (_, {network }) => {
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        const owner = await new ethers.Wallet(process.env.PRIVATE_KEY, provider);
            const validator = await new ethers.Wallet(process.env.VALIDATOR_KEY, provider);
        const WWW3 = await new  ethers.ContractFactory(contract.abi, contract.bytecode,owner);
        console.log(validator.address)
        const www3 = await WWW3.deploy(name, version, validator.address, tokenName, tokenSymbol);
        const receipt = await www3.deploymentTransaction();
        console.log("www3 deployed:", receipt);
        console.log("address", www3.target)
    })
