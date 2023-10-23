require('dotenv').config();
const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

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
const futureTime = new Date(currentTime.getTime() + 5 * 60000);
const passedTime = new Date(currentTime.getTime() - 5 * 60000);
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
const zero = ethers.parseEther("0")
const shareAmount = ethers.parseEther("100")
const shareCost = ethers.parseEther("0.06")
const shareAmountLeft = ethers.parseEther("3500000")
const oneMillionShares = ethers.parseEther("1000000")
const oneMillionSharesPrice = ethers.parseEther("600")
const halfMillionShares = ethers.parseEther("500000")
const halfMillionSharesPrice = ethers.parseEther("300")
const firstMessageShareValue = ethers.parseEther("0.000000002")

describe("WorldWideWeb3 Deployment", function () {

    async function deployMaster() {

 
        const [owner, validator, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners()
        const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
        const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, privateSellAmount, vestingPeriod)
        const WWW3 = await ethers.getContractFactory("WorldWideWeb3", owner);
        const www3 = await WWW3.deploy(domain, version, validator.address, www3Shares.target);
        const chainId = await www3._getChainId()
        return { www3, www3Shares, owner, validator, chainId, otherAccount, otherAccount2, otherAccount3 };
    }

    describe("Submit Signature", async function () {

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

           

         
        })

        describe("Share Calculation", async function () { 

            it("Should return the the 0 value when no share have been minted", async function () {
                const { www3Shares} = await loadFixture(
                    deployMaster
                );
                expect(await www3Shares.currentShareValue())
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

                expect(await www3Shares.currentShareValue())
                    .to.equal(firstMessageShareValue);

                expect(await ethers.provider.getBalance(www3Shares.target)).to.equal(tier2Price)
                    
            });

            it("Should return the the 0 value when a message is signed but no share have been minted", async function () {
                const { chainId, owner, validator } = await loadFixture(
                    deployMaster
                );

                const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
                const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, 0, vestingPeriod)
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

                expect(await www3Shares.currentShareValue())
                    .to.equal(zero);

                expect(await ethers.provider.getBalance(www3Shares.target)).to.equal(tier2Price)
                    
            });

            it("Should return the correct value when a message is signed but no share have been minted", async function () {
                const { chainId, owner, validator } = await loadFixture(
                    deployMaster
                );

                const WWW3S = await ethers.getContractFactory("WWW3Shares", owner)
                const www3Shares = await WWW3S.deploy(tokenName, tokenSymbol, maxAmountOfShares, initialSharePrice, 1, vestingPeriod)
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

                expect(await www3Shares.currentShareValue())
                    .to.equal(ethers.parseEther("1.003"));

                expect(await ethers.provider.getBalance(www3Shares.target)).to.equal(ethers.parseEther("1.003"))
                    
            });

        })

        describe("After vesting period ends", async function () { 
            it("Should be able to buy share after vesting period", async function () {
                const { www3Shares, otherAccount, owner, www3, chainId, validator } = await loadFixture(
                    deployMaster
                );
                expect(www3Shares.buyShares(shareAmount, { value: shareCost }))
                expect(await www3Shares.connect(otherAccount).buyShares(oneMillionShares, { value: oneMillionSharesPrice }))


                let i = 0;
                let amount = 10

                for(i=0; i< amount; i++){
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

                const totalSupply = await www3Shares.totalSupply()
               
                const currentPrice = await www3Shares.currentShareValue()
           
                const balance = await ethers.provider.getBalance(www3Shares.target)
                
                    
            });






        })
        describe("Testing Reentry", async function () { 
            it("Should revert on reentry", async function () {
                const {  owner, www3Shares } = await loadFixture(
                    deployMaster
                );

                const Reentry = await ethers.getContractFactory("Reentrant", owner);
                const reentry = await Reentry.deploy(www3Shares.target);


                expect(await reentry.buyShares({value: ethers.parseEther("1")}))
                expect(await reentry.approveVictim())

                let allowance = await www3Shares.allowance(reentry.target, www3Shares.target)
                console.log("=>",allowance)
                console.log("=>",reentry.target)
                
                await mine(vestingPeriod)

                await expect(await reentry.sellShares())
                .to.be.rejectedWith('Invalid amount of ether');
                    
            });

        })

    })
});



// REPEATED FUNCTIONS
function createTypedData(name, version, chainId, verifyingContract, tier, time, message) {

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
            chainId: chainId,
            verifyingContract,
        },
        message: {
            message,
            latitude,
            longitude,
            tier,
            time
        },
    };

    return typedData


}