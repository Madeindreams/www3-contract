// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./EIP712Message.sol";

contract WorldWideWeb3 is Ownable, EIP712Message {
    address public validator;

    mapping(address => uint256) public trust;
    mapping(uint256 => uint256) public tierPrice;
    mapping(address => bool) public premiumAccount;
    address payable shareHoldingContract;

    event Signer(address account, uint256 tier, bytes signature);
    event Mint(address account, uint256 id);

    constructor(
        string memory _name,
        string memory _version,
        address _validator,
        address _shareHoldingContract
    ) EIP712Message(_name, _version) {
        tierPrice[1] = 0;
        tierPrice[2] = 3000000000000000;
        tierPrice[3] = 300000000000000000;

        validator = _validator;

        shareHoldingContract = payable(_shareHoldingContract);
    }

    function submitMessage(
        string memory message,
        string memory latitude,
        string memory longitude,
        uint256 deadline,
        uint256 tier,
        bytes memory signature,
        bytes memory validatorSignature
    ) public payable {
        require(
            validateMessage(
                message,
                latitude,
                longitude,
                deadline,
                tier,
                signature
            ) == msg.sender,
            "Invalid signature"
        );
        require(
            validateMessage(
                message,
                latitude,
                longitude,
                deadline,
                tier,
                validatorSignature
            ) == validator,
            "Invalid validator signature"
        );
        require(tier > 0 && tier < 4, "invalid tier");
        require(block.timestamp < deadline, "Passed the deadline");

        if (premiumAccount[msg.sender]) {
            // the account is premium
        } else {
            require(msg.value == tierPrice[tier], "Incorrect price for tier");
            trust[msg.sender] += msg.value;
            if (tier == 3) {
                premiumAccount[msg.sender] = true;
            }
        }

        (bool sent, ) = shareHoldingContract.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit Signer(msg.sender, tier, signature);
    }
}
