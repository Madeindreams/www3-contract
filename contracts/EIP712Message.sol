//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import "../node_modules/@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "../node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EIP712Message is EIP712 {
    struct Message {
        string message;
        string latitude;
        string longitude;
        uint256 tier;
        uint256 time;
    }

    struct EIP712Domain {
        string name;
        string version;
        uint256 chainId;
        address verifyingContract;
    }

    bytes32 private constant MESSAGE_TYPEHASH =
        keccak256(
            "Message(string message,string latitude,string longitude,uint256 tier,uint256 time)"
        );

    bytes32 constant EIP712DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
    bytes32 DOMAIN_SEPARATOR;

    constructor(
        string memory name,
        string memory version
    ) EIP712(name, version) {
        DOMAIN_SEPARATOR = hash(
            EIP712Domain({
                name: name,
                version: version,
                chainId: _getChainId(),
                verifyingContract: address(this)
            })
        );
    }

    function hash(
        EIP712Domain memory eip712Domain
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    EIP712DOMAIN_TYPEHASH,
                    keccak256(bytes(eip712Domain.name)),
                    keccak256(bytes(eip712Domain.version)),
                    eip712Domain.chainId,
                    eip712Domain.verifyingContract
                )
            );
    }

    function hash(Message memory message) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    MESSAGE_TYPEHASH,
                    keccak256(bytes(message.message)),
                    keccak256(bytes(message.latitude)),
                    keccak256(bytes(message.longitude)),
                    message.tier,
                    message.time
                )
            );
    }

    function validateMessage(
        string memory message,
        string memory latitude,
        string memory longitude,
        uint256 time,
        uint256 tier,
        bytes memory _signature
    ) public view returns (address) {
        Message memory _message = Message({
            message: message,
            latitude: latitude,
            longitude: longitude,
            tier: tier,
            time: time
        });

        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(_signature);

        return (verifyMessage(_message, v, r, s));
    }

    function verifyMessage(
        Message memory message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal view returns (address) {
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, hash(message))
        );
        return ecrecover(digest, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) internal pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    ///@notice get the chain id from the evm
    function _getChainId() public view returns (uint256 chainId) {
        assembly {
            chainId := chainid()
        }
        return chainId;
    }
}
