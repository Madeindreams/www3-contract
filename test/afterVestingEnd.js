require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");
const { parseEther } = require('ethers');
const { checkShareValue } = require('./utils.js');
const domain = "idecentralize";
const version = "1";
const tokenName = "WWW3 Shares";
const tokenSymbol = "W3S";
const maxAmountOfShares = ethers.parseEther("500")
const privateSellAmount = ethers.parseEther("150")
const initialSharePrice = ethers.parseEther("0.0006")
const vestingPeriod = 2598800;
const one = ethers.parseEther("1")

describe("WWW3Shares", function () {
    async function deployMaster() {
        const [owner, validator, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners()
        const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
        const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, domain, maxAmountOfShares, initialSharePrice, privateSellAmount, vestingPeriod, owner)
        const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
        const www3 = await WWW3.deploy(domain, version, validator.address, www3Shares.target);
        const chainId = await www3._getChainId()

        return { www3, www3Shares, owner, validator, chainId, otherAccount, otherAccount2, otherAccount3 };
    }

    describe("Buy/Sell Share", async function () {
        describe("After vesting period ends", async function () {
            it("Should be able to buy share after vesting period", async function () {
                const { www3Shares, owner } = await loadFixture(
                    deployMaster
                );
                await owner.sendTransaction({
                    to: www3Shares.target,
                    value: ethers.parseEther("5")
                })
                await mine(vestingPeriod)
                const currentPrice = await www3Shares.currentShareValue(0)
                expect(await www3Shares.buyShares(parseEther("1"), { value: currentPrice }))
            });

            it("Should be release existing shares instead of minting", async function () {
                const { www3Shares, owner } = await loadFixture(
                    deployMaster
                );
                await owner.sendTransaction({
                    to: www3Shares.target,
                    value: ethers.parseEther("5")
                })
                await mine(vestingPeriod)
                expect(await www3Shares.sellShares(ethers.parseEther("25")))
                const currentPrice = await www3Shares.currentShareValue(0)
                expect(await www3Shares.buyShares(parseEther("1"), { value: currentPrice }))
            });

            it("Should be release existing shares and mint missing shares", async function () {
                const { www3Shares, owner } = await loadFixture(
                    deployMaster
                );
                await owner.sendTransaction({
                    to: www3Shares.target,
                    value: ethers.parseEther("5")
                })
                await mine(vestingPeriod)
                expect(await www3Shares.sellShares(ethers.parseEther("25")))
                const currentPrice = await www3Shares.currentShareValue(0)
                const sixty = parseEther("60")
                const value = (BigInt(60) * BigInt(currentPrice))
                expect(await www3Shares.buyShares(sixty, { value: value }))
            });

            it("Should revert when the amount of ether provided is insufficient", async function () {
                const { www3Shares, owner } = await loadFixture(
                    deployMaster
                );
                await owner.sendTransaction({
                    to: www3Shares.target,
                    value: ethers.parseEther("5")
                })
                await mine(vestingPeriod)
                await expect(www3Shares.buyShares(parseEther("60"), { value: 0 }))
                    .to.be.revertedWith("Invalid amount of ether")
            });

            it("Should return a correct value when the share are worth a big amount", async function () {
                const { www3Shares, owner } = await loadFixture(
                    deployMaster
                );
                await owner.sendTransaction({
                    to: www3Shares.target,
                    value: ethers.parseEther("5")
                })
                await mine(vestingPeriod)
                const currentPrice = await www3Shares.currentShareValue(0)
                expect(await www3Shares.buyShares(ethers.parseEther("1"), { value: currentPrice }))

            });

            it("Should revert when the share balance of an account is insufficient when selling", async function () {
                const { www3Shares, otherAccount, owner, www3, chainId, validator } = await loadFixture(
                    deployMaster
                );
                await mine(vestingPeriod)
                await expect(www3Shares.connect(otherAccount).sellShares(parseEther("1"))).to.be.revertedWith("Insufficient Balance")
            });

            it("Should return a correct value when the amount of ether is < than the supply", async function () {
                const { www3Shares, owner } = await loadFixture(
                    deployMaster
                );
                await owner.sendTransaction({
                    to: www3Shares.target,
                    value: ethers.parseEther("100")
                })
                await mine(vestingPeriod)
                const currentPriceJS = await checkShareValue(www3Shares)
                const currentPriceSol = await www3Shares.currentShareValue(0)
                expect(currentPriceJS).to.be.equal(currentPriceSol)
            });

            it("Should return a correct value when the amount of ether is > than the supply", async function () {
                const { www3Shares, owner } = await loadFixture(
                    deployMaster
                );
                await owner.sendTransaction({
                    to: www3Shares.target,
                    value: ethers.parseEther("200")
                })
                await mine(vestingPeriod)
                const currentPriceJS = await checkShareValue(www3Shares)
                const currentPriceSol = await www3Shares.currentShareValue(0)
                expect(currentPriceJS).to.be.equal(currentPriceSol)
            });

            it("Should allow selling shares if the vesting period is over", async function () {
                const { www3Shares, owner} = await loadFixture(
                    deployMaster
                );
                expect(await www3Shares.buyShares(one, { value: initialSharePrice }))
                await owner.sendTransaction({
                    to: www3Shares.target,
                    value: ethers.parseEther("200")
                })
                await mine(vestingPeriod)
                const currentValueJS = await checkShareValue(www3Shares)
                const currentValueSol = await www3Shares.currentShareValue(0)
                expect(currentValueJS).to.be.equal(currentValueSol)
                expect(www3Shares.sellShares(one)) 
            });

            it("Should revert when selling more share then we own", async function () {
                const { www3Shares, otherAccount} = await loadFixture(
                    deployMaster
                );
                expect(await www3Shares.connect(otherAccount).buyShares(ethers.parseEther("1"), { value: initialSharePrice }))
                await mine(vestingPeriod)
                await expect(www3Shares.connect(otherAccount).sellShares(ethers.parseEther("2")))
                .to.be.revertedWith("Insufficient Balance")
            });
        })
    })
})