require('dotenv').config();
const { ethers } = require('ethers');
const { expect } = require("chai");
const {
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const contract = require('../artifacts/contracts/WorldWideWeb3.sol/WorldWideWeb3.json')

const name = "idecentralize";
const version = "1";

describe("WorldWideWeb3 Deployment", function () {

    async function deployMaster() {
        // Contracts are deployed using the first signer/account by default
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        const owner = await new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const WWW3 = await new  ethers.ContractFactory(contract.abi, contract.bytecode,owner);
        const www3 = await WWW3.deploy(name, version);
        return { www3, owner, provider};
    }

    describe("Deployment", async function () {
        it("Should set the right owner in www3", async function () {
            const {owner, www3} = await loadFixture(
                deployMaster
            );
            expect(await www3.owner()).to.equal(owner.address);
        })

        it("Should sign a valid message", async function () {
            const {owner, www3, provider} = await loadFixture(
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
            const tier = "1"
            const time = epochTime
            const valueT1 = "3000000000000000"

            const chainID = await www3._getChainId()
            // console.log(chainID)

            // sign the message data
            const typedData = {
                types: {
                    Message: [
                        {name: "message", type: "string"},
                        {name: "latitude", type: "string"},
                        {name: "longitude", type: "string"},
                        {name: "tier", type: "uint256"},
                        {name: "time", type: "uint256"},
                    ],
                },
                primaryType: "Message",
                domain: {
                    name: name,
                    version: version,
                    chainId: 31337,
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

            let recovered = ethers.verifyTypedData(typedData.domain, typedData.types, typedData.message, signature)
            expect(recovered).to.equal(owner.address)

            // Estimate the gas cost
            // const gasLimit = await provider.estimateGas({
            //     to: www3.target,
            //     data: www3.interface.encodeFunctionData("submitMessage", [message, latitude, longitude, time, tier, signature]),
            //     value: valueT1
            // });

            //console.log("Gas Estimate:", gasLimit.toString());

            const tx = await www3.submitMessage(message, latitude, longitude, time, tier, signature, {value: valueT1})
            const txReceipt = await tx.wait(1)
            expect(txReceipt.status).to.equal(1)

        });
    })
});
