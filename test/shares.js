require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { createTypedData } = require('./utils.js');

const domain = "idecentralize";
const version = "1";
const tokenName = "WWW3 Shares";
const tokenSymbol = "W3S";
const maxAmountOfShares = ethers.parseEther("5000000")
const privateSellAmount = ethers.parseEther("1500000")
const initialSharePrice = ethers.parseEther("0.0006")
const vestingPeriod = 2598800;
const currentTime = new Date();
const futureTime = new Date(currentTime.getTime() + 100000 * 60000);
const passedTime = new Date(currentTime.getTime() - 10 * 60000);
const epochTime = Math.floor(futureTime.getTime() / 1000);
const message = "My cool message";
const latitude = "117.0";
const longitude = "49.0";
const tier2 = "2";
const tier2Price = ethers.parseEther("0.003");
const time = epochTime;
const zero = ethers.parseEther("0")
const firstMessageShareValue = ethers.parseEther("0.000000002")

describe("WWW3Shares calculation", function () {

    async function deployMaster() {

 
        const [owner, validator, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners()
        const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
        const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, privateSellAmount, vestingPeriod, owner)
        const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
        const www3 = await WWW3.deploy(domain, version, validator.address, www3Shares.target);
        const chainId = await www3._getChainId()
        return { www3, www3Shares, owner, validator, chainId, otherAccount, otherAccount2, otherAccount3 };
    }
    describe("Share Calculation", async function () { 

        it("Should return the the 0 value when no share have been minted", async function () {
            const { www3Shares} = await loadFixture(
                deployMaster
            );
            expect(await www3Shares.currentShareValue(0))
                .to.equal(zero);
                
        });

        it("Should return the the correct value when a message is signed", async function () {
            const { www3Shares, www3, chainId, owner, validator } = await loadFixture(
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

            expect(await www3Shares.currentShareValue(0))
                .to.equal(firstMessageShareValue);

            expect(await ethers.provider.getBalance(www3Shares.target)).to.equal(tier2Price)
                
        });

        it("Should return the the 0 value when a message is signed but no share have been minted", async function () {
            const { chainId, owner, validator } = await loadFixture(
                deployMaster
            );

            const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
            const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, 0, vestingPeriod, owner)
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

            await www3.submitMessage(message, latitude, longitude, time, tier2, signature, validatorSignature, { value: tier2Price })

            expect(await www3Shares.currentShareValue(0))
                .to.equal(zero);

            expect(await ethers.provider.getBalance(www3Shares.target)).to.equal(tier2Price)
                
        });

        it("Should return the correct value when a message is signed but no share have been minted", async function () {
            const { chainId, owner, validator } = await loadFixture(
                deployMaster
            );

            const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
            const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, 1, vestingPeriod, owner)
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

            await www3.submitMessage(message, latitude, longitude, time, tier2, signature, validatorSignature, { value: tier2Price })
            await owner.sendTransaction({
                to: www3Shares.target,
                value: ethers.parseEther("1")
            })

            expect(await www3Shares.currentShareValue(0))
                .to.equal(ethers.parseEther("1.003"));

            expect(await ethers.provider.getBalance(www3Shares.target)).to.equal(ethers.parseEther("1.003"))
                
        });

    })


})