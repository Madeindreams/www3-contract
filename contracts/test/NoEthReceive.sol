// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IWorldWideWeb3.sol";
import "../interfaces/IWWW3Shares.sol";

contract NoEthReceive is Ownable  {


   
    constructor() Ownable(msg.sender){
     
    }


 
    receive() external payable {
        revert();
    }

    }