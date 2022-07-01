//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract ATM {
    // using SafeMath for uint256;

    uint256 public price;
    address private _owner;

    modifier onlyOwner() {
        require(msg.sender == _owner, 
        "Only available to the owner");
        _;
    }

    function setNewPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    // function getPrice(uint256 amount) internal view returns(uint256) {
        
    // }

    // function buyCoin() public {

    // }
}