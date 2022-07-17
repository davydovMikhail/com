//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./libraries/SafeMath.sol";


contract Claiming {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public price;
    address public stableToken;
    address public saleToken;
    address private _owner;

    constructor(uint256 _price, address _stableToken, address _saleToken) {
        price = _price;
        stableToken = _stableToken;
        saleToken = _saleToken;
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, 
        "Only available to the owner");
        _;
    }

    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    function setStableToken(address _stableToken) external onlyOwner {
        stableToken = _stableToken;
    }

    function setSaleToken(address _saleToken) external onlyOwner {
        saleToken = _saleToken;
    }

    function getPrice(uint256 _amount) internal view returns(uint256) { // price in $
        return _amount.mul(price).div(100);
    }

    function transfer(address _token, address _recipient, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(_recipient, _amount);
    }

    function claim(uint256 _amount) public {
        require(_amount >= 0, "Must be greater than zero");
        uint256 tokenPrice = getPrice(_amount); // вычисление суммы стейблов, которые будут переведены за токены
        IERC20(saleToken).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(stableToken).safeTransfer(msg.sender, tokenPrice);
    }
}