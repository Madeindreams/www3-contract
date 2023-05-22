// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./EIP712Message.sol";


contract WorldWideWeb3 is EIP712Message, Ownable{


    Message[] public messages;
   
    mapping(address => uint256) public frensTrust;
    mapping(uint256 => uint256) public tierPrice;

    constructor(string memory name, string memory version) 
        EIP712Message(name, version){
            tierPrice[1] = 3000000000000000;
            tierPrice[2] = 30000000000000000;
            tierPrice[3] = 300000000000000000;
    }

    function submitMessage(
        string memory message,
        string memory latitude,
        string memory longitude,
        uint256 deadline,
        uint256 tier,
        bytes memory signature 
    ) public payable {


        require(validateMessage(message, latitude, longitude, deadline, tier, signature) == msg.sender,"Invalid signature");
        require(tier > 0 && tier < 4, "invalid tier");
        require(msg.value == tierPrice[tier],"incorect price for tier");
        require(block.timestamp < deadline, "passed deadline");

        frensTrust[msg.sender] += msg.value;
    
        messages.push( 
            Message({
                message: message,
                latitude: latitude,
                longitude: longitude,
                tier: tier,
                time: block.timestamp
            })
        );



    }

}
