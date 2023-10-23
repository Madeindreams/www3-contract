// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract WWW3Shares is Ownable, ReentrancyGuard, ERC20 {
    address payable public developer;
    uint256 public maxAmountOfShares;
    uint256 public initialSharePrice;
    uint256 public vestingPeriodEnd;

    event ShareMinted(address to, uint256 amount);
    event ShareSold(address to, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxAmountOfShares,
        uint256 _sharePrice,
        uint256 _privateSellAmount,
        uint256 _vestingPeriod
    ) ERC20(_name, _symbol) {
        developer = payable(_msgSender());
        maxAmountOfShares = _maxAmountOfShares;
        initialSharePrice = _sharePrice;
        _mint(_msgSender(), _privateSellAmount);
        vestingPeriodEnd = block.number + _vestingPeriod;
    }

    function buyShares(uint256 amount) public payable {
        if (block.number >= vestingPeriodEnd) {
            buySharesAfterVestingEnds(amount);
        } else {
            buySharesBoforeVestingEnds(amount);
        }
        emit ShareMinted(_msgSender(), amount);
    }

    function buySharesBoforeVestingEnds(uint256 amount) internal {
        require(
            msg.value == (amount * initialSharePrice) / 1e18,
            "Invalid amount of ether"
        );
        require(
            amount + totalSupply() <= maxAmountOfShares,
            "Amount exceeding available supply"
        );
        _mint(_msgSender(), amount);
        (bool sent, ) = developer.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
    }

    function buySharesAfterVestingEnds(uint256 amount) internal {
        (uint256 actualBalance, uint256 availableShare) = availableShares();
        require(
            msg.value == (amount * currentShareValue()) / 1e18,
            "Invalid amount of ether"
        );
        require(amount <= availableShare, "Amount exceeding available supply");
        require(
            msg.value == currentShareValue() * amount,
            "Invalid amount of ether"
        );

        if (amount <= actualBalance) {
            transfer(_msgSender(), amount);
        } else if (actualBalance > 0) {
            uint256 amountToMint = amount - actualBalance;
            transfer(_msgSender(), actualBalance);
            _mint(_msgSender(), amountToMint);
        } else {
            _mint(_msgSender(), amount);
        }
    }

    function sellShares(uint256 amount) public nonReentrant {
        require(block.number >= vestingPeriodEnd, "Vesting period is not over");
        require(amount >= 1 ether, "Amount must be at least 1 share");
        console.log(allowance(msg.sender, address(this)));
        console.log(msg.sender);
        transferFrom(_msgSender(), address(this), amount);

        if (address(this).balance < totalSupply()) {
            amount = amount / 1e18;
        }
        uint256 returnedAmount = currentShareValue() * amount;

        if (address(this).balance < returnedAmount) {
            returnedAmount = address(this).balance;
        }

        (bool sent, ) = _msgSender().call{value: returnedAmount}("");
        require(sent, "Failed to send Ether");

        emit ShareSold(_msgSender(), amount);
    }

    function availableShares() public view returns (uint256, uint256) {
        uint256 actualBalance = balanceOf(address(this));
        uint256 availableShare = actualBalance +
            (maxAmountOfShares - totalSupply());

        return (actualBalance, availableShare);
    }

    function currentShareValue() public view returns (uint256) {
        uint256 totalSup = totalSupply();
        uint256 balance = address(this).balance;

        if (totalSup == 0 || balance == 0) {
            // Avoid division by zero error, return 0 in these cases
            return 0;
        }

        // If balance is smaller than total supply, use appropriate scaling
        if (balance < totalSup) {
            // Scale the balance to match the 18 decimals of shares
            uint256 scaledBalance = balance * (1e18);
            return scaledBalance / totalSup;
        } else {
            // Balance is greater than or equal to total supply
            return balance / totalSup;
        }
    }

    receive() external payable {}
}
