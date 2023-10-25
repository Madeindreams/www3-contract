// SPDX-License-Identifier: MIT
pragma solidity 0.8.21;

import "../../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IWWW3Shares.sol";

contract Reentrant is Ownable {
    IWWW3Shares victim;

    constructor(IWWW3Shares _victim) Ownable(msg.sender) {
        victim = _victim;
    }

    function buyShares() public payable {
        victim.buyShares{value: 1200000000000000}(2000000000000000000);
    }

    function sellShares() public payable {
        victim.sellShares(1 ether);
    }

    receive() external payable {
        victim.sellShares(1 ether);
    }

    fallback() external payable {
        victim.sellShares(1 ether);
    }
}
