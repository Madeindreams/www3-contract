require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");


const { createTypedData } = require('./utils.js');

const domain = "idecentralize";
const invalidDomain = "random";
const version = "1";
const invalidVersion = "2";
const tokenName = "WWW3 Shares";
const tokenSymbol = "W3S";
const maxAmountOfShares = ethers.parseEther("5000000")
const privateSellAmount = ethers.parseEther("1500000")
const initialSharePrice = ethers.parseEther("0.0006")
const vestingPeriod = 2598800;
const currentTime = new Date();
const futureTime = new Date(currentTime.getTime() + 1000000 * 60000);
const passedTime = new Date(currentTime.getTime() - 10 * 60000);
const epochTime = Math.floor(futureTime.getTime() / 1000);
const passedEpochTime = Math.floor(passedTime.getTime() / 1000);
const message = "My cool message";
const latitude = "117.0";
const longitude = "49.0";
const tier2 = "2";
const tier3 = "3";
const invalidTier = "0";
const tier2Price = ethers.parseEther("0.003");
const tier3Price = ethers.parseEther("0.3");
const invalidPrice = ethers.parseEther("0.0003");
const time = epochTime;


describe("WorldWideWeb3 Signatures", function () {

    async function deployMaster() {


        const [owner, validator, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners()
        const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
        const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, privateSellAmount, vestingPeriod, owner)
        const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
        const www3 = await WWW3.deploy(domain, version, validator.address, www3Shares.target);
        const chainId = await www3._getChainId()
        return { www3, www3Shares, owner, validator, chainId, otherAccount, otherAccount2, otherAccount3 };
    }

    describe("Submitting Signature", async function () {

        it("Should revert on invalid domain signature", async function () {
            const { owner, www3, validator, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(invalidDomain, version, chainId, www3.target, tier2, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await expect(www3.submitMessage(message, latitude, longitude, time, tier2, signature, validatorSignature, { value: tier2Price }))
                .to.be.rejectedWith('Invalid signature');
        });

        it("Should revert on invalid version signature", async function () {
            const { owner, www3, validator, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(domain, invalidVersion, chainId, www3.target, tier2, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await expect(www3.submitMessage(message, latitude, longitude, time, tier2, signature, validatorSignature, { value: tier2Price }))
                .to.be.rejectedWith('Invalid signature');
        });

        it("Should revert on invalid validator signature", async function () {
            const { owner, www3, validator, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(domain, version, chainId, www3.target, tier2, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await expect(www3.submitMessage(message, latitude, longitude, time, tier2, signature, signature, { value: tier2Price }))
                .to.be.rejectedWith('Invalid validator signature');
        });

        it("Should revert when the amount of ether is incorrect for tier2", async function () {
            const { owner, validator, www3, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(domain, version, chainId, www3.target, tier2, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await expect(www3.submitMessage(message, latitude, longitude, time, tier2, signature, validatorSignature, { value: invalidPrice }))
                .to.be.rejectedWith('Incorrect price for tier');
        });

        it("Should revert when an invalid tier is provided", async function () {
            const { owner, www3, validator, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(domain, version, chainId, www3.target, invalidTier, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await expect(www3.submitMessage(message, latitude, longitude, time, invalidTier, signature, validatorSignature, { value: tier2Price }))
                .to.be.rejectedWith('invalid tier');
        })

        it("Should revert when the deadline is passed", async function () {
            const { owner, www3, validator, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(domain, version, chainId, www3.target, tier2, passedEpochTime, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await expect(www3.submitMessage(message, latitude, longitude, passedEpochTime, tier2, signature, validatorSignature, { value: tier2Price }))
                .to.be.rejectedWith('Passed the deadline');
        })

        it("Should revert when the amount of ether is incorrect for tier3", async function () {
            const { owner, validator, www3, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(domain, version, chainId, www3.target, tier3, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await expect(www3.submitMessage(message, latitude, longitude, time, tier3, signature, validatorSignature, { value: invalidPrice }))
                .to.be.rejectedWith('Incorrect price for tier');
        })

        it("Should set a premium account when the tier is 3", async function () {
            const { owner, validator, www3, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(domain, version, chainId, www3.target, tier3, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await www3.submitMessage(message, latitude, longitude, time, tier3, signature, validatorSignature, { value: tier3Price })
            expect(await www3.premiumAccount(owner)).to.equal(true)
        })

        it("Should should post a tier 2 message", async function () {
            const { owner, validator, www3, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(domain, version, chainId, www3.target, tier2, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await www3.submitMessage(message, latitude, longitude, time, tier2, signature, validatorSignature, { value: tier2Price })
        })

        it("Should should not charge a premium account ", async function () {
            const { owner, validator, www3, chainId } = await loadFixture(
                deployMaster
            );

            const typedData = createTypedData(domain, version, chainId, www3.target, tier3, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await www3.submitMessage(message, latitude, longitude, time, tier3, signature, validatorSignature, { value: tier3Price })
            expect(await www3.premiumAccount(owner)).to.equal(true)
            await www3.submitMessage(message, latitude, longitude, time, tier3, signature, validatorSignature)
        })

        it("Should should revert when it failed to pay the shareholders ", async function () {
            const { owner, validator, chainId } = await loadFixture(
                deployMaster
            );

            const WWW3S = await ethers.getContractFactory("NoEthReceive", owner)
            const www3Shares = await WWW3S.deploy()

            const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
            const www3 = await WWW3.deploy(domain, version, validator.address, www3Shares.target);

            const typedData = createTypedData(domain, version, chainId, www3.target, tier2, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            await expect(www3.submitMessage(message, latitude, longitude, time, tier2, signature, validatorSignature, { value: tier2Price }))
                .to.be.rejectedWith('Failed to send Ether');
        })

        it("Should emit an signature event", async function () {
            const { owner, www3, validator, chainId } = await loadFixture(
                deployMaster
            );
            const typedData = createTypedData(domain, version, chainId, www3.target, tier3, time, message)

            const signature = await owner.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const validatorSignature = await validator.signTypedData(
                typedData.domain,
                typedData.types,
                typedData.message)

            const tx = await www3.submitMessage(message, latitude, longitude, time, tier3, signature, validatorSignature, { value: tier3Price })
            await tx.wait(1)
            expect(tx).to.emit("Signer").withArgs(owner.address, tier3, signature)

        })
    })


   

})



