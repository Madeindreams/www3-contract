// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./EIP712Message.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract WorldWideWeb3 is  Ownable, ERC20, EIP712Message{

    address public validator;
    bool public mintStarted;

    mapping(address => uint256) public frensTrust;
    mapping(uint256 => uint256) public tierPrice;

    event Signer(address account, uint256 tier);
    event Minter(address account, uint256 amount);
    event MintStarted(bool started);

    constructor(
        string memory _name,
        string memory _version,
        address _validator,
        string memory _tokenName,
        string memory _tokenSymbol
    )
        EIP712Message(_name, _version)
        ERC20(_tokenName, _tokenSymbol){

            tierPrice[1] = 3000000000000000;
            tierPrice[2] = 30000000000000000;
            tierPrice[3] = 300000000000000000;

            validator = _validator;
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
        require(validateMessage(message, latitude, longitude, deadline, tier, signature) == msg.sender, "Invalid signature");
        require(validateMessage(message, latitude, longitude, deadline, tier, validatorSignature) == validator, "Invalid validator signature");
        require(tier > 0 && tier < 4, "invalid tier");
        require(block.timestamp < deadline, "passed deadline");

        if(!mintStarted){
            require(msg.value == tierPrice[tier],"incorrect price for tier");
            frensTrust[msg.sender] += msg.value;
        } else {
            _burn(msg.sender, tierPrice[tier]);
        }

        emit Signer(msg.sender, tier);
    }

    function startMint() public onlyOwner {
        mintStarted = true;

        emit MintStarted(mintStarted);
    }


    function mintTrust() public {
        address recipient = _msgSender();
        require(mintStarted, "Mint not started yet");
        uint amountToMint = frensTrust[recipient];
        frensTrust[recipient] = 0;
        _mint(recipient, amountToMint);

        emit Minter(recipient, amountToMint);
    }

}
