// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.21;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

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

    function buyShares(uint256 amount) public payable nonReentrant(){

        if(block.number >= vestingPeriodEnd){
            buySharesAfterVestingEnds(amount);
        }else{
            buySharesBoforeVestingEnds(amount);
        }
        emit ShareMinted(_msgSender(), amount);
    }

    function buySharesBoforeVestingEnds(uint256 amount) internal{
    
        require(msg.value == amount * initialSharePrice, "Invalid amount of ether");
        require(amount + totalSupply() <= maxAmountOfShares, "Amount exceeding available supply");
        _mint(_msgSender(), amount);
        (bool sent, ) = developer.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

    }

    function buySharesAfterVestingEnds(uint256 amount) internal{

        uint256 actualBalance = balanceOf(address(this));
        require(msg.value == amount * currentShareValue(), "Invalid amount of ether");
        uint256 availableShare = actualBalance + (maxAmountOfShares - totalSupply());
        require(amount  <= availableShare, "Amount exceeding available supply");
        require(msg.value == currentShareValue() * amount, "Invalid amount of ether");
        
        if(amount <= actualBalance){
            transfer(_msgSender(), amount);
        }else if(actualBalance > 0){
            uint256 amountToMint = amount - actualBalance;
            transfer(_msgSender(), actualBalance);
            _mint(_msgSender(), amountToMint);
        }else{
            _mint(_msgSender(), amount);
        }

    }

    function sellShares(uint256 amount) public nonReentrant(){
        require(block.number >= vestingPeriodEnd, "Vesting period is not over");
        transferFrom(_msgSender(), address(this), amount);
        uint256 returnedAmount = currentShareValue() * amount;

        (bool sent, ) = _msgSender().call{value: returnedAmount}("");
        require(sent, "Failed to send Ether");

        emit ShareSold(_msgSender(), amount);
        

    }


   function currentShareValue() public view returns (uint256) {
    uint256 totalSup = totalSupply();
    uint256 balance = address(this).balance;

    if (totalSup == 0 || balance == 0) {
        // Avoid division by zero error, return 0 in this case
        return 0;
    }

    uint256 scaledBalance = balance * 1e18;
    uint256 shareValue = scaledBalance / totalSup;
    uint256 finalShareValue = shareValue / 1e18;


    return finalShareValue;
}

    receive() external payable {}

   
}
