require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const domain = "idecentralize";
const version = "1";
const tokenName = "WWW3 Shares";
const tokenSymbol = "W3S";
const maxAmountOfShares = ethers.parseEther("500")
const privateSellAmount = ethers.parseEther("150")
const initialSharePrice = ethers.parseEther("0.0006")
const vestingPeriod = 2598800;
const zero = ethers.parseEther("0")
const shareAmount = ethers.parseEther("100")
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
        describe("Before vesting period ends", async function () {

            it("Should mint the correct amount to the owner for private sell", async function () {
                const { www3Shares, owner } = await loadFixture(
                    deployMaster
                );
                expect(await www3Shares.balanceOf(owner)).to.equal(privateSellAmount)
            });

            it("Should keep track of available shares", async function () {
                const { www3Shares } = await loadFixture(
                    deployMaster
                );
                const shareLeft = BigInt(maxAmountOfShares) - BigInt(privateSellAmount)
                expect(await www3Shares.availableShares()).deep.equal([zero, shareLeft])
            });

            it("Should be able to buy all the share left before vesting end", async function () {
                const { www3Shares, otherAccount } = await loadFixture(
                    deployMaster
                );
                const sharesLeft = BigInt(maxAmountOfShares) - BigInt(privateSellAmount)
                const value = BigInt(sharesLeft) * BigInt(initialSharePrice) / BigInt(ethers.parseEther("1"))
                expect(await www3Shares.connect(otherAccount).buyShares(sharesLeft, { value: value }))
                expect(await www3Shares.availableShares()).deep.equal([zero, zero])
            });

            it("Should revert when minting more than the mas supply", async function () {
                const { www3Shares, owner } = await loadFixture(
                    deployMaster
                );
                const sharesLeft = BigInt(maxAmountOfShares) - BigInt(privateSellAmount)
                const value = (BigInt(sharesLeft) * BigInt(initialSharePrice)) / BigInt(ethers.parseEther("1"))
                expect(await www3Shares.buyShares(sharesLeft, { value: value }))
                await expect(www3Shares.connect(owner).buyShares(one, { value: initialSharePrice }))
                    .to.be.revertedWith('Amount exceeding available supply');
            });

            it("Should revert if the ether provided is incorrect", async function () {
                const { www3Shares } = await loadFixture(
                    deployMaster
                );
                await expect(www3Shares.buyShares(shareAmount, { value: zero }))
                    .to.be.rejectedWith('Invalid amount of ether');
            });

            it("Should revert if it fails to send eth to the developer", async function () {
                const { owner } = await loadFixture(
                    deployMaster
                );
                const DEV = await ethers.getContractFactory("NoEthReceive", owner)
                const dev = await DEV.deploy()
                const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
                const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, domain, maxAmountOfShares, initialSharePrice, privateSellAmount, vestingPeriod, dev.target)
                await expect(www3Shares.buyShares(one, { value: initialSharePrice }))
                    .to.be.rejectedWith('Failed to send Ether');
            });

            it("Should revert when selling shares before the end of the vesting period", async function () {
                const { www3Shares } = await loadFixture(
                    deployMaster
                );
                await expect(www3Shares.sellShares(ethers.parseEther("1")))
                    .to.be.rejectedWith("Vesting period is not over")
            });
        })
    })
})