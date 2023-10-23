// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IWWW3Shares is IERC20 {

    /**
     * @dev Allow an acount to buy shares
     */
    function buyShares(uint256 amount) external payable;

    /**
     * @dev Allow an acount to sell shares
     */

    function sellShares(uint256 amount) external;
    
}