require("@nomicfoundation/hardhat-toolbox");
const contract = require('../artifacts/contracts/WorldWideWeb3.sol/WorldWideWeb3.json')
const {ethers} = require("ethers");
const {expect} = require("chai");
const name = "idecentralize";
const version = "1";

const contractAddress = "0x687bB6c57915aa2529EfC7D2a26668855e022fAE"
task(
    "sign-www3",
    "Deploy The contract",
    async (_, {network }) => {
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        const owner = await new ethers.Wallet(process.env.PRIVATE_KEY, provider);
        const www3 = await new  ethers.Contract(contractAddress, contract.abi, owner);

        const currentTime = new Date();
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
        console.log(txReceipt)



    })
