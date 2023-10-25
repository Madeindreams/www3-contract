// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "../node_modules/@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract WWW3Shares is Ownable, ReentrancyGuard, ERC20Permit {
    address payable public developer;
    uint256 public maxAmountOfShares;
    uint256 public initialSharePrice;
    uint256 public vestingPeriodEnd;
    uint256 commonDenominator = 1e18;

    event ShareMinted(address to, uint256 amount);
    event ShareSold(address to, uint256 amount);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _domain,
        uint256 _maxAmountOfShares,
        uint256 _sharePrice,
        uint256 _privateSellAmount,
        uint256 _vestingPeriod,
        address _dev
    ) ERC20(_name, _symbol) ERC20Permit(_domain) Ownable(_dev) {
        developer = payable(_dev);
        maxAmountOfShares = _maxAmountOfShares;
        initialSharePrice = _sharePrice;
        _mint(_msgSender(), _privateSellAmount);
        vestingPeriodEnd = block.number + _vestingPeriod;
    }

    function buyShares(uint256 amount) public payable {
        if (block.number >= vestingPeriodEnd) {
            buySharesAfterVestingEnds(amount);
        } else {
            buySharesBeforeVestingEnds(amount);
        }
        emit ShareMinted(_msgSender(), amount);
    }

    function buySharesBeforeVestingEnds(uint256 amount) internal {
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
        (uint256 actualBalance, uint256 _availableShares) = availableShares();

        require(
            msg.value >= (amount * currentShareValue(msg.value) / commonDenominator),
            "Invalid amount of ether"
        );
        require(
            amount <= _availableShares,
            "Amount exceeding available supply"
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
        require(balanceOf(_msgSender()) >= amount, "Insufficient Balance");
        _transfer(_msgSender(), address(this), amount);

        uint256 returnedAmount = currentShareValue(0) * amount / commonDenominator;

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

    function currentShareValue(
        uint256 incomingEther
    ) public view returns (uint256) {
        uint256 totalSup = totalSupply();
        uint256 balance = address(this).balance - incomingEther;
        if (totalSup == 0 || balance == 0) {
            // Avoid division by zero error, return 0 in these cases
            return 0;
        }

        return balance * commonDenominator / totalSup;
    }

    receive() external payable {}
}
