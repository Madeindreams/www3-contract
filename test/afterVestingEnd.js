require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");
const { parseEther } = require('ethers');

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
const futureTime = new Date(currentTime.getTime() + 1000 * 60000);
const epochTime = Math.floor(futureTime.getTime() / 1000);
const message = "My cool message";
const latitude = "117.0";
const longitude = "49.0";
const tier2 = "2";
const tier2Price = ethers.parseEther("0.003");
const time = epochTime;
const shareAmount = ethers.parseEther("100")
const shareCost = ethers.parseEther("0.06")
const oneMillionShares = ethers.parseEther("1000000")
const oneMillionSharesPrice = ethers.parseEther("600")


describe("WWW3Shares", function () {

    async function deployMaster() {


        const [owner, validator, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners()
        const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
        const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, privateSellAmount, vestingPeriod, owner)
        const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
        const www3 = await WWW3.deploy(domain, version, validator.address, www3Shares.target);
        const chainId = await www3._getChainId()
        return { www3, www3Shares, owner, validator, chainId, otherAccount, otherAccount2, otherAccount3 };
    }

    describe("Buy/Sell Share", async function () {


        describe("After vesting period ends", async function () {
            it("Should be able to buy share after vesting period", async function () {
                const { www3Shares, otherAccount, owner, www3, chainId, validator } = await loadFixture(
                    deployMaster
                );
                expect(www3Shares.buyShares(shareAmount, { value: shareCost }))
                expect(await www3Shares.connect(otherAccount).buyShares(oneMillionShares, { value: oneMillionSharesPrice }))


                let i = 0;
                let amount = 10

                for (i = 0; i < amount; i++) {
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
                }

                await mine(vestingPeriod)
                const currentPrice = await www3Shares.currentShareValue(0)
                expect(await www3Shares.buyShares(parseEther("1"), { value: currentPrice }))
            });

            it("Should be release existing shares instead of minting", async function () {
                const { www3Shares, otherAccount, owner, www3, chainId, validator } = await loadFixture(
                    deployMaster
                );
                expect(www3Shares.buyShares(shareAmount, { value: shareCost }))
                expect(await www3Shares.connect(otherAccount).buyShares(oneMillionShares, { value: oneMillionSharesPrice }))


                let i = 0;
                let amount = 10

                for (i = 0; i < amount; i++) {
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
                }

                await mine(vestingPeriod)

                await owner.sendTransaction({
                    to: www3Shares.target,
                    value: ethers.parseEther("200")
                })

                const currentPrice0 = await www3Shares.currentShareValue(0)
                const balance = await www3Shares.balanceOf(owner)
                console.log(balance)

                const token = await www3Shares.connect(owner)
                await token.connect(owner).approve(www3Shares.target,ethers.parseEther("25"), {from:owner})
                const allowance = await token.allowance(owner, www3Shares.target)

                console.log(allowance)
                expect(await token.connect(owner).sellShares(ethers.parseEther("25")))

                const currentPrice = await www3Shares.currentShareValue(0)
                expect(await www3Shares.buyShares(parseEther("1"), { value: currentPrice }))
            });


        })

    })
})