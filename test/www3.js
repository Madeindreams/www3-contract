require('dotenv').config();
const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

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

describe("WorldWideWeb3 Deployment", function () {

    async function deployMaster() {
        // Contracts are deployed using the first signer/account by default
        const provider = new ethers.JsonRpcProvider(process.env.RPC);
        const owner = new NonceManager(new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider));
        const validator = new ethers.Wallet(process.env.VALIDATOR_PRIVATE_KEY, provider);

        // deploy www3 share contract 
        const WWW3Shares = new ethers.ContractFactory(WWW3ShareContract.abi, WWW3ShareContract.bytecode, owner);
        const www3Shares = await WWW3Shares.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice,
            privateSellAmount, vestingPeriod);
      
        // deploy www3
        const WWW3 = new ethers.ContractFactory(WWW3Contract.abi, WWW3Contract.bytecode, owner);
        const www3 = await WWW3.deploy(name, version, validator.address, www3Shares.target);
 
        return { www3, www3Shares, owner, validator, provider };
    }

    describe("Deployment", async function () {
        it("Should set the right owner in contracts", async function () {
            const { owner, www3, www3Shares } = await loadFixture(
                deployMaster
            );
            expect(await www3.owner()).to.equal(owner.signer.address);
            expect(await www3Shares.owner()).to.equal(owner.signer.address);
        })

        it("Should sign a valid tier2 message", async function () {
            const { owner, www3, validator} = await loadFixture(
                deployMaster
            );

            // Get the current time
            const currentTime = new Date();

            // Add 5 minutes to the current time
            const futureTime = new Date(currentTime.getTime() + 5 * 60000); // 60000 milliseconds in a minute
            const epochTime = Math.floor(futureTime.getTime() / 1000);
            const message = "My cool message"
            const latitude = "117.0"
            const longitude = "49.0"
            const tier = "2"
            const time = epochTime
            const valueT1 = ethers.parseEther("0.003")

            const chainID = await www3._getChainId()
            // console.log(chainID)

            // sign the message data
            const typedData = {
                types: {
                    Message: [
                        { name: "message", type: "string" },
                        { name: "latitude", type: "string" },
                        { name: "longitude", type: "string" },
                        { name: "tier", type: "uint256" },
                        { name: "time", type: "uint256" },
                    ],
                },
                primaryType: "Message",
                domain: {
                    name: name,
                    version: version,
                    chainId: chainID.toString(),
                    verifyingContract: www3.target,
                },
                message: {
                    message,
                    latitude,
                    longitude,
                    tier,
                    time
                },
            };

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            let recovered = ethers.verifyTypedData(typedData.domain, typedData.types, typedData.message, signature)
            expect(recovered).to.equal(owner.signer.address)

            let recovered2 = ethers.verifyTypedData(typedData.domain, typedData.types, typedData.message, validatorSignature)
            expect(recovered2).to.equal(validator.address)


            const tx = await www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT1 })
            const txReceipt = await tx.wait(1)
            expect(txReceipt.status).to.equal(1)

        });



        it("Should sign a valid tier3 message and sign for free afterward", async function () {
            const { owner, www3, validator } = await loadFixture(
                deployMaster
            );



            // Get the current time
            const currentTime = new Date();

            // Add 5 minutes to the current time
            const futureTime = new Date(currentTime.getTime() + 5 * 60000); // 60000 milliseconds in a minute
            const epochTime = Math.floor(futureTime.getTime() / 1000);
            const message = "My cool message"
            const latitude = "117.0"
            const longitude = "49.0"
            const tier = "3"
            const time = epochTime
            const valueT3 = ethers.parseEther("0.3")
            const chainID = await www3._getChainId()


            // sign the message data
            const typedData = {
                types: {
                    Message: [
                        { name: "message", type: "string" },
                        { name: "latitude", type: "string" },
                        { name: "longitude", type: "string" },
                        { name: "tier", type: "uint256" },
                        { name: "time", type: "uint256" },
                    ],
                },
                primaryType: "Message",
                domain: {
                    name: name,
                    version: version,
                    chainId: chainID.toString(),
                    verifyingContract: www3.target,
                },
                message: {
                    message,
                    latitude,
                    longitude,
                    tier,
                    time
                },
            };

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)


            const tx = await www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT3 })
            const txReceipt = await tx.wait(1)
            expect(txReceipt.status).to.equal(1)


            const tx2 = await www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature)
            const txReceipt2 = await tx2.wait(1)
            expect(txReceipt2.status).to.equal(1)
        })



    })
});
