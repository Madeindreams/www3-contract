require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const WWW3Contract = require('../artifacts/contracts/WorldWideWeb3.sol/WorldWideWeb3.json')
const WWW3ShareContract = require('../artifacts/contracts/WWW3Shares.sol/WWW3Shares.json')
//const { ethers, NonceManager } = require("ethers");

const name = "idecentralize";
const version = "1";

const tokenName = "WWW3 Shares";
const tokenSymbol = "W3S";

const maxAmountOfShares = "5000000000000000000000000";
const privateSellAmount = "1500000000000000000000000";
const initialSharePrice = "000600000000000000";
const vestingPeriod = 2598800; // about one year in terms of block

describe("WorldWideWeb3 Deployment", function () {

    async function deployMaster() {

        const [owner, validator] = await ethers.getSigners()
   
        // deploy www3 share contract 
        const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
        const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice,
            privateSellAmount, vestingPeriod)

        // deploy www3
        const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
        const www3 = await WWW3.deploy(name, version, validator.address, www3Shares.target);
 
        return { www3, www3Shares, owner, validator };
    }

    describe("Deployment", async function () {


        it("Should revert on invalid user signature", async function () {
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
            const valueT1 = "3000000000000000"

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
                    name: "Invalid name",
                    version: version,
                    chainId: chainID.toString(),
                    verifyingContract: www3.address,
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




                await expect(www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT1 }))
                .to.be.rejectedWith('Invalid signature');
        


        });

        it("Should revert if the tier 2 amount is wrong", async function () {
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
            const valueT1 = "000300000000000000"

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

            const validatorSignature = signature


            await expect(www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT1 }))
        .to.be.rejectedWith('Invalid validator signature');


        });



        it("Should revert when the tier is wrong", async function () {
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
            const tier = "0"
            const time = epochTime
            const valueT3 = "300000000000000000"
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

                await expect(www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT3 }))
                .to.be.rejectedWith('invalid tier');


        })

        it("Should revert when the deadline is passed", async function () {
            const { owner, www3, validator } = await loadFixture(
                deployMaster
            );

            // Get the current time
            const currentTime = new Date();

            // Add 5 minutes to the current time
            const futureTime = new Date(currentTime.getTime() - 5 * 60000); // 60000 milliseconds in a minute
            const epochTime = Math.floor(futureTime.getTime() / 1000);
            const message = "My cool message"
            const latitude = "117.0"
            const longitude = "49.0"
            const tier = "2"
            const time = epochTime
            const valueT3 = "3000000000000000"
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

                await expect(www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT3 }))
                .to.be.rejectedWith('passed deadline');


        })

        it("Should revert when the amount of ether is incorrect", async function () {
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
            const tier = "2"
            const time = epochTime
            const valueT3 = "300000000000000"
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

                await expect(www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT3 }))
                .to.be.rejectedWith('incorrect price for tier');


        })

        it("Should set a premium account when the tier is 3", async function () {
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
            const valueT3 = "300000000000000000"
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

                await www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT3 })
                
                expect(await www3.premiumAccount(owner)).to.equal(true)


        })

        it("Should should post a tier 2 message", async function () {
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
            const tier = "2"
            const time = epochTime
            const valueT3 = "3000000000000000"
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

                await www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT3 })
                

        })

        it("Should should not charge a premium account ", async function () {
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
            const valueT3 = "300000000000000000"
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

                await www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT3 })
                
                expect(await www3.premiumAccount(owner)).to.equal(true)

                await www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature)


        })

        it("Should should revert when it failed to pay the shareholders ", async function () {
            const { owner, validator } = await loadFixture(
                deployMaster
            );

            const WWW3S = await ethers.getContractFactory("NoEthReceive", owner)
            const www3Shares = await WWW3S.deploy()
    
            // deploy www3
            const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
            const www3 = await WWW3.deploy(name, version, validator.address, www3Shares.target);

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
            const valueT3 = "300000000000000000"
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

                await expect(www3.submitMessage(message, latitude, longitude, time, tier, signature, validatorSignature, { value: valueT3 }))
                .to.be.rejectedWith('Failed to send Ether');
                
           


        })

        it("Should emit an signature event", async function () {
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
            const valueT3 = "300000000000000000"
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

                await tx.wait(1)
                
                expect(tx).to.emit("Signer").withArgs(owner.address, tier, signature)
                
     


        })





    })
});
