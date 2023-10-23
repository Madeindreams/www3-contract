// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IWorldWideWeb3 {


    /**
     * @dev Allow an acount to submit a message
     */
    function submitMessage(
        string memory message,
        string memory latitude,
        string memory longitude,
        uint256 deadline,
        uint256 tier,
        bytes memory signature,
        bytes memory validatorSignature
    ) external payable;
    
}