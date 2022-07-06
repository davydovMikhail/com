import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import * as mocha from "mocha-steps";
import { parseEther } from '@ethersproject/units';
import { UniswapV2Router02, UniswapV2Factory, ATM, USD, Bull } from '../typechain'

describe("ATM test", async () => {
    let atm: ATM;
    let owner: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let router: UniswapV2Router02;
    let factory: UniswapV2Factory;
    let usd: USD;
    let bull: Bull;
    const tokenPrice = 5; // в центах
    const minPrice = parseEther("1");
    const denominator = 1000;
    const commission = 3; // коммиссия в процентах

    function toWei(amount: number): BigNumber {
        return ethers.utils.parseUnits(amount.toString(), 18);
    }
    
    
    beforeEach(async () => {
        [owner, account1, account2] = await ethers.getSigners();
    });
    
    mocha.step("STEP 1. Deploying", async function () {
        const ATM = await ethers.getContractFactory("ATM");
        atm = await ATM.deploy();
        const PankakeRouter = await ethers.getContractFactory("UniswapV2Router02");
        router = PankakeRouter.attach(process.env.ROUTER_ADDRESS as string);
        const addressFactory = await router.factory();
        const PankakeFactory = await ethers.getContractFactory("UniswapV2Factory");
        factory = PankakeFactory.attach(addressFactory);
        const USD = await ethers.getContractFactory("USD");
        let name = "Dollar Binance";
        let symbol = "BUSD";
        let totalSupply = parseEther("100000000");
        usd = await USD.deploy(name, symbol, totalSupply);
        const Bull = await ethers.getContractFactory("Bull");
        name = "Bull Token";
        symbol = "BULL";
        totalSupply = parseEther("1000000");
        bull = await Bull.deploy(name, symbol, totalSupply);
    });

    mocha.step("STEP 2. Sets funcs", async function () {
        await atm.connect(owner).setPrice(tokenPrice);
        await atm.connect(owner).setMinPrice(minPrice);
        await atm.connect(owner).setDenominator(denominator);
        await atm.connect(owner).setRouter(router.address);
        await atm.connect(owner).setStableToken(usd.address);
        await atm.connect(owner).setSaleToken(bull.address);
        await atm.connect(owner).setLiqRecpnt(owner.address);
        await atm.connect(owner).setCommission(commission);
    });

    mocha.step("STEP 3. Gets funcs", async function () {
        expect(await atm.price()).to.equal(tokenPrice);
        expect(await atm.minPrice()).to.equal(minPrice);
        expect(await atm.denominator()).to.equal(denominator);
        expect(await atm.router()).to.equal(router.address);
        expect(await atm.stableToken()).to.equal(usd.address);
        expect(await atm.saleToken()).to.equal(bull.address);
        expect(await atm.liqRecpnt()).to.equal(owner.address);
        expect(await atm.commission()).to.equal(commission);
    });

    // mocha.step("Calculation view funcs", async function () {
    //     const amountToken = 20;
    //     const priceToken = await atm.getPrice(parseEther(amountToken.toString()));
    //     expect(priceToken).to.equal(toWei(amountToken * tokenPrice / 100));

    //     expect(await atm.getAmountForPool(priceToken)).to.equal(priceToken / denominator);

    //     const percents = await atm.getAmountsByPercent(priceToken);
    //     console.log(percents._main, percents._commission);

    //     expect(percents._commission).to.equal(toWei(amountToken * tokenPrice * commission / (100 * 100)));
    //     expect(percents._main).to.equal(toWei(amountToken * tokenPrice * (100 - commission) / (100 * 100)));

    // });
});
