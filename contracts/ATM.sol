//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./libraries/SafeMath.sol";
import "./interfaces/IPancakeRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "hardhat/console.sol";

contract ATM {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public price; // цена одного токена в центах стейблах, например, если передано 5, то цена будет 0.05
    uint256 public minPrice; // минимальная цена в стейблах, например 1$, тогда надо купить минимум 20 токенов(20 * 0.05 = 1$)
    uint256 public maxPrice; // максимальня цена в стейблах
    address private _owner; // владелец контракта, которому доступны некоторые функции (private)
    address public router; // адрес pancakeswap
    address public stableToken; // адрес стейблтокена, например usdt
    address public saleToken; // адрес продаваемого токена
    address public liqRecpnt; // адрес получателя ликвидности (private)
    address public claimer;
    uint256 public commissionATM; // комиссия банкомата в процентах
    uint256 public commissionClaiming;
    uint256 public threshold;

    constructor(uint256 _price, 
        uint256 _minPrice, 
        uint256 _maxPrice, 
        uint256 _commissionATM,
        uint256 _commissionClaiming, 
        uint256 _threshold) {
        _owner = msg.sender;
        liqRecpnt = msg.sender;
        price = _price;
        minPrice = _minPrice;
        maxPrice = _maxPrice;
        commissionATM = _commissionATM;
        commissionClaiming = _commissionClaiming;
        threshold = _threshold;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, 
        "Only available to the owner");
        _;
    }

    // SETTERS
    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    function setMinPrice(uint256 _minPrice) external onlyOwner {
        minPrice = _minPrice;
    }

    function setMaxPrice(uint256 _maxPrice) external onlyOwner {
        maxPrice = _maxPrice;
    }

    function setThreshold(uint256 _threshold) external onlyOwner {
        threshold = _threshold;
    }

    function setRouter(address _router) external onlyOwner {
        router = _router;
    }

    function setStableToken(address _stableToken) external onlyOwner {
        stableToken = _stableToken;
    }

    function setSaleToken(address _saleToken) external onlyOwner {
        saleToken = _saleToken;
    }

    function setLiqRecpnt(address _liqRecpnt) external onlyOwner {
        liqRecpnt = _liqRecpnt;
    }

    function setCommission(uint256 _commissionATM, uint256 _commissionClaiming) external onlyOwner {
        commissionATM = _commissionATM;
        commissionClaiming = _commissionClaiming;
    }

    function setClaimer(address _claimer) external onlyOwner {
        claimer = _claimer;
    }

    // GETTERS
    // _amount -- желаемое количество токенов, которые хотят приобрести
    function getPrice(uint256 _amount) public view returns(uint256) { // price in $
        return _amount.mul(price).div(100);
    }

    // function getCommisson(uint256 _amount) public view returns(uint256) {
    //     return _amount.div(100).mul(commission);
    // }

    function getByPercent(uint256 _amount, uint256 _percent) public pure returns(uint256) {
        return _amount.div(100).mul(_percent);
    }

    function getTotalWithdrawed(uint256 _steps) public view returns(uint256) { 
        return _steps.mul(threshold).mul(100).div(100 - commissionATM - commissionClaiming);
    }

    // OTHERS

    function approve(address _token, address _recipient, uint256 _amount) external onlyOwner {
        IERC20(_token).safeApprove(_recipient, _amount);
    }

    function transfer(address _token, address _recipient, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(_recipient, _amount);
    }

    function buyCoin(uint256 _amount) external returns(bool) { // _amount -- количество токенов, которые хотят приобрести
        require(_amount >= 0, "Must be greater than zero");
        uint256 tokenPrice = getPrice(_amount); // вычисление суммы стейблов, которые будут переведены за токены
        require(tokenPrice >= minPrice, "The offer must be greater"); 
        require(tokenPrice <= maxPrice, "The offer must be less"); 
        IERC20(stableToken).safeTransferFrom(msg.sender, address(this), tokenPrice);
        uint256 balanceATM = IERC20(stableToken).balanceOf(address(this));
        uint256 steps = balanceATM / threshold;
        uint256 totalWithdrawed = getTotalWithdrawed(steps);
        while(totalWithdrawed > balanceATM) {
            steps--;
            totalWithdrawed = getTotalWithdrawed(steps);
        }
        if(steps > 0) {
            IERC20(stableToken).safeTransfer(liqRecpnt, getByPercent(totalWithdrawed, commissionATM));
            IERC20(stableToken).safeTransfer(claimer, getByPercent(totalWithdrawed, commissionClaiming));
            uint256 stableForPool = steps.mul(threshold);
            uint256 tokenForPool = steps.mul(10**18);
            IPancakeRouter(router).addLiquidity(
                stableToken,
                saleToken,
                stableForPool,
                tokenForPool,
                stableForPool,
                tokenForPool,
                liqRecpnt,
                block.timestamp + 30
            );     
        }
        IERC20(saleToken).safeTransfer(msg.sender, _amount); // перевод пользовательских токенов покупателю
        return true;
    }
}