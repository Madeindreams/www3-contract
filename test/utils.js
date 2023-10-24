// utils.js




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

module.exports = { createTypedData };