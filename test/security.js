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
const maxAmountOfShares = ethers.parseEther("5000000")
const privateSellAmount = ethers.parseEther("1500000")
const initialSharePrice = ethers.parseEther("0.0006")
const vestingPeriod = 2598800;
const currentTime = new Date();
const futureTime = new Date(currentTime.getTime() + 5 * 60000);
const passedTime = new Date(currentTime.getTime() - 5 * 60000);
const epochTime = Math.floor(futureTime.getTime() / 1000);


describe("WWW3Shares security", function () {

    async function deployMaster() {


        const [owner, validator, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners()
        const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
        const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, privateSellAmount, vestingPeriod, owner)
        const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
        const www3 = await WWW3.deploy(domain, version, validator.address, www3Shares.target);
        const chainId = await www3._getChainId()
        return { www3, www3Shares, owner, validator, chainId, otherAccount, otherAccount2, otherAccount3 };
    }

    describe("Testing Reentry", async function () {
        it("Should revert on reentry", async function () {
            // const {  owner, www3Shares } = await loadFixture(
            //     deployMaster
            // );

            // const Reentry = await ethers.getContractFactory("Reentrant", owner);
            // const reentry = await Reentry.deploy(www3Shares.target);


            // expect(await reentry.buyShares({value: ethers.parseEther("1")}))
            // expect(await reentry.approveVictim())

            // let allowance = await www3Shares.allowance(reentry.target, www3Shares.target)
            // console.log("=>",allowance)
            // console.log("=>",reentry.target)

            // await mine(vestingPeriod)

            // await expect(await reentry.sellShares())
            // .to.be.rejectedWith('Invalid amount of ether');

        });

    })

})