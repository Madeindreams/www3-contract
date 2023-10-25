// utils.js
const { ethers } = require("hardhat");

function createTypedData(name, version, chainId, verifyingContract, tier, time, message) {
    const latitude = "117.0";
    const longitude = "49.0";
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
            time,
        },
    };

    return typedData;
}

async function signTypedData(signer, validator, typedData) {
    const signature = await signer.signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message)
    const validatorSignature = await validator.signTypedData(
        typedData.domain,
        typedData.types,
        typedData.message)

    return { signature, validatorSignature }
}

async function checkShareValue(contract){
    const balance = BigInt(await ethers.provider.getBalance(contract.target))
    const totalSupply = BigInt(await contract.totalSupply())
    const commonDenominator = BigInt(ethers.parseEther("1"))
    const  value = balance * commonDenominator / totalSupply

    return value
}

module.exports = { createTypedData, signTypedData, checkShareValue };