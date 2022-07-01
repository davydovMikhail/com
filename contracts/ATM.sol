//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./libraries/SafeMath.sol";
import "./interfaces/IPancakeRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract ATM {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public price;
    uint256 public minPrice;
    uint256 public denominator;
    address private _owner;
    address public router;
    address public stableToken;
    address public saleToken;
    address private liqRecpnt;

    

    constructor(address _router, address _stableToken, address _saleToken) {
        _owner = msg.sender;
        router = _router;
        stableToken = _stableToken;
        saleToken = _saleToken;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, 
        "Only available to the owner");
        _;
    }

    function setPrice(uint256 _price) external onlyOwner {
        price = _price;
    }

    function setMinPrice(uint256 _minPrice) external onlyOwner {
        minPrice = _minPrice;
    }

    // _amount -- желаемое количество токенов, которые хотят приобрести
    function getPrice(uint256 _amount) internal view returns(uint256) { // price in $
        return _amount.mul(price);
    }

    function getAmountForPool(uint256 _amount) internal view returns(uint256) { // price in $
        return _amount.div(denominator);
    }

    function approve(address _token, address _recipient, uint256 _amount) external onlyOwner {
        IERC20(_token).safeApprove(_recipient, _amount);
    }

    function transfer(address _token, address _recipient, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(_recipient, _amount);
    }

    function buyCoin(uint256 _amount) external returns(bool) {
        uint256 tokenPrice = getPrice(_amount); // вычисление суммы стейблов, которые будут переведены за токены
        uint256 amountForPool = getAmountForPool(tokenPrice);
        require(tokenPrice >= minPrice, "The offer must be greater");
        IERC20(stableToken).safeTransferFrom(msg.sender, address(this), tokenPrice); // перевод стейблов на текущий контракт
        IERC20(saleToken).safeTransfer(msg.sender, tokenPrice); // перевод пользовательских токенов покупателю
        IERC20(stableToken).safeApprove(router, tokenPrice); // апрув стейблов для дальнейшего внесения в пул ликвидности на панкейке
        IERC20(saleToken).safeApprove(router, amountForPool); // апрув продаваемого токена, для дальнейшего внесения в пулл



        // (amountA, amountB, liquidity) = IUniswapV2Router02(router).addLiquidity(
        //     _tokenA,
        //     _tokenB,
        //     _amountA,
        //     _amountB,
        //     (_amountA * 9) / 10,
        //     (_amountB * 9) / 10,
        //     msg.sender,
        //     block.timestamp + 30
        // );
        return true;
    }
}