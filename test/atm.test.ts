import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import * as mocha from "mocha-steps";
import { parseEther } from '@ethersproject/units';
// import { IPancakeRouter } from '../typechain'

describe("ATM test", async () => {
    let atm: Contract;
    let owner: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let router: Contract;
    let stableToken: SignerWithAddress;
    let saleToken: SignerWithAddress;

    const tokenPrice = 5; // в центах
    const minPrice = parseEther("1");
    const denominator = 1000;
    const commission = 3; // коммиссия в процентах

    function toWei(amount: number): BigNumber {
        return ethers.utils.parseUnits(amount.toString(), 18);
    }
    
    
    // const router = await ethers.getContractAt("IPancakeRouter", process.env.ROUTER_ADDRESS as string);
    // factory = <IUniswapV2Factory>(await ethers.getContractAt("IUniswapV2Factory", process.env.FACTORY_ADDRESS as string));
    

    beforeEach(async () => {
        [owner, account1, account2, stableToken, saleToken] = await ethers.getSigners();
    });
    
    mocha.step("STEP 1. Deploying", async function () {
        const ATM = await ethers.getContractFactory("ATM");
        atm = await ATM.deploy();
        // const PankakeRouter = await ethers.getContractFactory("MyContract");
        // const router = await PankakeRouter.attach(process.env.ROUTER_ADDRESS as string);
        // console.log(router);
        
        
    });

    mocha.step("STEP 2. Sets funcs", async function () {
        await atm.connect(owner).setPrice(tokenPrice);
        await atm.connect(owner).setMinPrice(minPrice);
        await atm.connect(owner).setDenominator(denominator);
        // await atm.connect(owner).setRouter(router.address);
        await atm.connect(owner).setStableToken(stableToken.address);
        await atm.connect(owner).setSaleToken(saleToken.address);
        await atm.connect(owner).setLiqRecpnt(owner.address);
        await atm.connect(owner).setCommission(commission);
    });

    mocha.step("STEP 3. Gets funcs", async function () {
        expect(await atm.price()).to.equal(tokenPrice);
        expect(await atm.minPrice()).to.equal(minPrice);
        expect(await atm.denominator()).to.equal(denominator);
        // expect(await atm.router()).to.equal(router.address);
        expect(await atm.stableToken()).to.equal(stableToken.address);
        expect(await atm.saleToken()).to.equal(saleToken.address);
        expect(await atm.liqRecpnt()).to.equal(owner.address);
        expect(await atm.commission()).to.equal(commission);
        // console.log(router.address);
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
