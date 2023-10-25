require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { createTypedData, signTypedData } = require('./utils.js');

const domain = "idecentralize";
const version = "1";
const tokenName = "WWW3 Shares";
const tokenSymbol = "W3S";
const maxAmountOfShares = ethers.parseEther("500")
const privateSellAmount = ethers.parseEther("150")
const initialSharePrice = ethers.parseEther("0.0006")
const vestingPeriod = 2598800;
const currentTime = new Date();
const futureTime = new Date(currentTime.getTime() + 1000000 * 60000);
const epochTime = Math.floor(futureTime.getTime() / 1000);
const message = "My cool message";
const latitude = "117.0";
const longitude = "49.0";
const tier2 = "2";
const tier2Price = ethers.parseEther("0.003");
const time = epochTime;
const zero = ethers.parseEther("0")
const oneEth = ethers.parseEther("1")


describe("WWW3Shares calculation", function () {
    async function deployMaster() {
        const [owner, validator, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners()
        const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
        const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, domain, maxAmountOfShares, initialSharePrice, privateSellAmount, vestingPeriod, owner)
        const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
        const www3 = await WWW3.deploy(domain, version, validator.address, www3Shares.target);
        const chainId = await www3._getChainId()

        return { www3, www3Shares, owner, validator, chainId, otherAccount, otherAccount2, otherAccount3 };
    }
    describe("Share Calculation", async function () {

        it("Should return the the 0 value when no message have been signed or no share have been minted", async function () {
            const { www3Shares } = await loadFixture(
                deployMaster
            );
            expect(await www3Shares.currentShareValue(0))
                .to.equal(zero);
        });

        it("Should return the the correct value for a share when message have been signer", async function () {
            const { www3Shares, www3, chainId, owner, validator } = await loadFixture(
                deployMaster
            );
            const typedData = createTypedData(domain, version, chainId, www3.target, tier2, time, message)
            const { signature, validatorSignature } = await signTypedData(owner, validator, typedData)
            await www3.submitMessage(message, latitude, longitude, time, tier2, signature, validatorSignature, { value: tier2Price })
            expect(await ethers.provider.getBalance(www3Shares.target)).to.equal(tier2Price)
            const shareValue = BigInt(tier2Price) / (BigInt(privateSellAmount) / oneEth)
            expect(await www3Shares.currentShareValue(0))
                .to.equal(shareValue);
        });

    })
})