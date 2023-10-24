require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");


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
const epochTime = Math.floor(futureTime.getTime() / 1000);
const message = "My cool message";
const latitude = "117.0";
const longitude = "49.0";
const tier2 = "2";
const tier2Price = ethers.parseEther("0.003");
const time = epochTime;
const zero = ethers.parseEther("0")
const shareAmount = ethers.parseEther("100")
const shareCost = ethers.parseEther("0.06")
const shareAmountLeft = ethers.parseEther("3500000")
const oneMillionShares = ethers.parseEther("1000000")
const oneMillionSharesPrice = ethers.parseEther("600")
const halfMillionShares = ethers.parseEther("500000")
const halfMillionSharesPrice = ethers.parseEther("300")


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

        describe("Before vesting period ends", async function () {

            it("Should mint the correct amount to the owner for private sell", async function () {
                const { www3Shares, owner} = await loadFixture(
                    deployMaster
                );
                expect(await www3Shares.balanceOf(owner)).to.equal(privateSellAmount)
            });

            it("Should keep track of available shares", async function () {
                const { www3Shares} = await loadFixture(
                    deployMaster
                );
              
                expect(await www3Shares.availableShares()).deep.equal([zero,shareAmountLeft])
                
            });

            it("Should be able to buy share before vesting end", async function () {
                const { www3Shares, otherAccount} = await loadFixture(
                    deployMaster
                );
            
                expect(await www3Shares.connect(otherAccount).buyShares(oneMillionShares, { value: oneMillionSharesPrice }))
           
            });

            it("Should mint the available supply and fail to mint more", async function () {
                const { www3Shares, owner, otherAccount, otherAccount2, otherAccount3} = await loadFixture(
                    deployMaster
                );
                expect(await www3Shares.connect(owner).buyShares(halfMillionShares, { value: halfMillionSharesPrice }))
                expect(await www3Shares.connect(otherAccount).buyShares(oneMillionShares, { value: oneMillionSharesPrice }))
                expect(await www3Shares.connect(otherAccount2).buyShares(oneMillionShares, { value: oneMillionSharesPrice }))
                expect(await www3Shares.connect(otherAccount3).buyShares(oneMillionShares, { value: oneMillionSharesPrice }))

                await expect(www3Shares.connect(owner).buyShares(shareAmount, { value: shareCost }))
                .to.be.rejectedWith('Amount exceeding available supply');
          
            });

            it("Should revert if the ether provided is incorrect", async function () {
                const { www3Shares } = await loadFixture(
                    deployMaster
                );
                await expect(www3Shares.buyShares(shareAmount, { value: zero }))
                    .to.be.rejectedWith('Invalid amount of ether');
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
                const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, privateSellAmount, vestingPeriod, dev.target)


                await expect(www3Shares.buyShares(shareAmount, { value: shareCost}))
                    .to.be.rejectedWith('Failed to send Ether');
            });

            it("Should return a correct value when the share are worth a small amount", async function () {
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
                
                await mine(vestingPeriod)

                await expect(www3Shares.buyShares(shareAmount, { value: shareCost }))
                    
            });

            // it("Should return a correct value when the share are worth a big amount", async function () {
            //     const { www3Shares, www3, chainId, owner, validator } = await loadFixture(
            //         deployMaster
            //     );

 
            //     expect(await www3Shares.buyShares(ethers.parseEther("1"), { value: initialSharePrice }))

            //     await owner.sendTransaction({
            //         to: www3Shares.target,
            //         value: ethers.parseEther("9")
            //     })
                
            //     await mine(vestingPeriod)
                
            //     const currentPrice = await www3Shares.currentShareValue(0)


            //     expect(await www3Shares.buyShares(ethers.parseEther("1"), { value: currentPrice }))
                    
            // });


         
        })

    })

})