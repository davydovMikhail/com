//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./libraries/SafeMath.sol";
import "./interfaces/IPancakeRouter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract ATM {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public price; // цена одного токена в стейблах, например 0.05$
    uint256 public minPrice; // минимальная цена в стейблах, например 1$, тогда надо купить минимум 20 токенов(20 * 0.05 = 1$)
    uint256 public denominator; // делитель, для вычисления суммы токена, которая будет положена в пулл
    address private _owner; // владелец контракта, которому доступны некоторые функции
    address public router; // адрес pancakeswap
    address public stableToken; // адрес стейблтокена, например usdt
    address public saleToken; // адрес продаваемого токена
    address private liqRecpnt; // адрес получателя ликвидности

    constructor() {
        _owner = msg.sender;
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

    function setDenominator(uint256 _denominator) external onlyOwner {
        denominator = _denominator;
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


    // GETTERS
    // _amount -- желаемое количество токенов, которые хотят приобрести
    function getPrice(uint256 _amount) internal view returns(uint256) { // price in $
        return _amount.mul(price);
    }

    function getAmountForPool(uint256 _amount) internal view returns(uint256) { // price in $
        return _amount.div(denominator);
    }

    // OTHERS

    function approve(address _token, address _recipient, uint256 _amount) external onlyOwner {
        IERC20(_token).safeApprove(_recipient, _amount);
    }

    function transfer(address _token, address _recipient, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(_recipient, _amount);
    }

    function buyCoin(uint256 _amount) external returns(bool) { // _amount -- количество токенов, которые хотят приобрести
        uint256 tokenPrice = getPrice(_amount); // вычисление суммы стейблов, которые будут переведены за токены
        uint256 amountForPool = getAmountForPool(tokenPrice); // значение для пула
        require(tokenPrice >= minPrice, "The offer must be greater");
        IERC20(stableToken).safeTransferFrom(msg.sender, address(this), tokenPrice); // перевод стейблов на текущий контракт
        
        IERC20(stableToken).safeApprove(router, tokenPrice); // апрув стейблов для дальнейшего внесения в пул ликвидности на панкейке
        IERC20(saleToken).safeApprove(router, amountForPool); // апрув продаваемого токена, для дальнейшего внесения в пулл

        IPancakeRouter(router).addLiquidity(
            stableToken,
            saleToken,
            tokenPrice,
            amountForPool,
            tokenPrice,
            amountForPool,
            liqRecpnt,
            block.timestamp + 30
        );


        IERC20(saleToken).safeTransfer(msg.sender, tokenPrice); // перевод пользовательских токенов покупателю
        return true;
    }
}