import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import * as mocha from "mocha-steps";
import { parseEther } from '@ethersproject/units';
import { UniswapV2Router02, UniswapV2Factory, ATM, USD, Bull, UniswapV2Pair, Claiming } from '../typechain'

describe("ATM test", async () => {
    let atm: ATM;
    let owner: SignerWithAddress;
    let account1: SignerWithAddress;
    let account2: SignerWithAddress;
    let account3: SignerWithAddress;
    let account4: SignerWithAddress;
    let account5: SignerWithAddress;
    let remainder: SignerWithAddress;
    let router: UniswapV2Router02;
    let factory: UniswapV2Factory;
    let usd: USD;
    let bull: Bull;
    let lpToken: UniswapV2Pair;
    let claiming: Claiming;
    const tokenPrice = 1; // в центах
    const tokenPriceForClaim = 2; // в центах
    const minPrice = parseEther("1");

    const commission = 3; // коммиссия в процентах 
    const commissionForClaiming = 27;
    const threshold = parseEther("100");

    function toWei(amount: number): BigNumber {
        return ethers.utils.parseUnits(amount.toString(), 18);
    }
    
    beforeEach(async () => {
        [owner, account1, account2, account3, account4, account5, remainder] = await ethers.getSigners();
    });
    
    mocha.step("STEP 1. Deploying", async function () {
        const ATM = await ethers.getContractFactory("ATM");
        atm = await ATM.deploy(
            tokenPrice,
            minPrice,
            commission,
            commissionForClaiming,
            threshold
        );
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
        totalSupply = parseEther("1000000000");
        bull = await Bull.deploy(name, symbol, totalSupply);
        const Claiming = await ethers.getContractFactory("Claiming");
        claiming = await Claiming.deploy(tokenPriceForClaim, usd.address, bull.address);
    });

    mocha.step("STEP 2. Sets funcs", async function () {
        // await atm.connect(owner).setPrice(tokenPrice);
        // await atm.connect(owner).setMinPrice(minPrice);
        // await atm.connect(owner).setMaxPrice(maxPrice);
        await atm.connect(owner).setRouter(router.address);
        await atm.connect(owner).setStableToken(usd.address);
        await atm.connect(owner).setSaleToken(bull.address);
        await expect(atm.connect(account1).setSaleToken(bull.address)).to.be.revertedWith('Only available to the owner');

        // await atm.connect(owner).setCommission(commission);
        // await atm.connect(owner).setThreshold(threshold);
        await atm.connect(owner).setClaimer(claiming.address);
    });

    mocha.step("STEP 3. Gets funcs", async function () {
        expect(await atm.price()).to.equal(tokenPrice);
        expect(await atm.minPrice()).to.equal(minPrice);
        expect(await atm.router()).to.equal(router.address);
        expect(await atm.stableToken()).to.equal(usd.address);
        expect(await atm.saleToken()).to.equal(bull.address);
        expect(await atm.liqRecpnt()).to.equal(owner.address);
        expect(await atm.commissionATM()).to.equal(commission);
        expect(await atm.threshold()).to.equal(threshold);

        expect(await claiming.price()).to.equal(tokenPriceForClaim);
        expect(await claiming.stableToken()).to.equal(usd.address);
        expect(await claiming.saleToken()).to.equal(bull.address);
        expect(await atm.claimer()).to.equal(claiming.address);
    });

    mocha.step("STEP 4. Creating liquidity", async function () {
        const initLiqUSD = parseEther("10");
        const initLiqBull = parseEther("0.1");
        let currentTimestamp = Math.floor(Date.now() / 1000);
        await usd.connect(owner).approve(router.address, initLiqUSD);
        await bull.connect(owner).approve(router.address, initLiqBull);
        await router.addLiquidity(
            usd.address,
            bull.address,
            initLiqUSD,
            initLiqBull,
            initLiqUSD,
            initLiqBull,
            owner.address,
            currentTimestamp + 30
        )
    });

    mocha.step("STEP 5. Checking LP balance", async function () {
        const pairAddress = await factory.getPair(usd.address, bull.address);
        const PankakePair = await ethers.getContractFactory("UniswapV2Pair");
        lpToken = PankakePair.attach(pairAddress);
        const balanceOwner = await lpToken.balanceOf(owner.address);
        const theoryBalance = parseEther(Math.sqrt(1).toString());
        console.log(balanceOwner, '~=', theoryBalance);
    });

    mocha.step("STEP 6. Approving USD and Bull for ATM", async function() {
        const bullAmountForApprove = parseEther("1000");
        const stableAmountForApprove = parseEther("100000");
        await atm.connect(owner).approve(bull.address, router.address, bullAmountForApprove);
        await atm.connect(owner).approve(usd.address, router.address, stableAmountForApprove);
    });

    mocha.step("STEP 7. Preparation before buying Bull Tokens for USD", async function () {
        await usd.connect(owner).transfer(account1.address, parseEther('1000000'));
        await usd.connect(account1).approve(atm.address, parseEther('400000'));
        await usd.connect(owner).transfer(account2.address, parseEther('10000'));
        await usd.connect(account2).approve(atm.address, parseEther('400000'));
        await usd.connect(owner).transfer(account3.address, parseEther('10000'));
        await usd.connect(account3).approve(atm.address, parseEther('400000'));
        await usd.connect(owner).transfer(account4.address, parseEther('10000'));
        await usd.connect(account4).approve(atm.address, parseEther('400000'));
        await usd.connect(owner).transfer(account5.address, parseEther('10000'));
        await usd.connect(account5).approve(atm.address, parseEther('400000'));
        await bull.connect(owner).transfer(atm.address, parseEther('1000000'));
        expect(await usd.balanceOf(atm.address)).to.equal(0);
        await expect(atm.connect(account1).buyCoin(parseEther("99"))).to.be.revertedWith('The offer must be greater');
        // await expect(atm.connect(account1).buyCoin(parseEther("300001"))).to.be.revertedWith('The offer must be less');
    });

    mocha.step("STEP 8. Buying Bull Tokens for USD", async function() {
        await atm.connect(account1).buyCoin(parseEther("40000"));
        // expect(await usd.balanceOf(atm.address)).to.equal(parseEther("300"));
        await atm.connect(account2).buyCoin(parseEther("10000"));
        await atm.connect(account3).buyCoin(parseEther("15000"));
        await atm.connect(account4).buyCoin(parseEther("11000"));
        await atm.connect(account5).buyCoin(parseEther("1000"));
    });

    mocha.step("STEP 9. Checking balances after buying", async function() {
        expect(await bull.balanceOf(account1.address)).to.equal(parseEther("40000"));
        expect(await bull.balanceOf(account2.address)).to.equal(parseEther("10000"));
        expect(await bull.balanceOf(account3.address)).to.equal(parseEther("15000"));
        expect(await bull.balanceOf(account4.address)).to.equal(parseEther("11000"));
        expect(await bull.balanceOf(account5.address)).to.equal(parseEther("1000"));
    });

    mocha.step("STEP 10. Checking LP balances after all buying", async function() {
        const balanceOwner = await lpToken.balanceOf(owner.address);
        console.log("Must be ~ 51", balanceOwner);
    });

    mocha.step("STEP 11. Removing liquidity", async function() {
        const amountLiquidity = await lpToken.balanceOf(owner.address);
        let currentTimestamp = Math.floor(Date.now() / 1000);
        await lpToken.connect(owner).approve(router.address, amountLiquidity);
        const balanceUSDBefore = await usd.balanceOf(owner.address);
        await router.removeLiquidity(
            usd.address,
            bull.address,
            amountLiquidity,
            parseEther("200"),
            parseEther("1"),
            owner.address,
            currentTimestamp
        );
        const balanceUSDAfter = await usd.balanceOf(owner.address);
        console.log("Before: ", balanceUSDBefore, ", after: ", balanceUSDAfter);
        
    });

    mocha.step("STEP 12. Transfer USD from ATM to somebody", async function() {
        const remainderATM = await usd.balanceOf(atm.address);
        console.log('remainderATM', remainderATM);
        await atm.connect(owner).transfer(usd.address, remainder.address, remainderATM);
        expect(await usd.balanceOf(remainder.address)).to.equal(remainderATM);

    });

    mocha.step("Calculation view funcs", async function () {
        const amountToken = 20;
        const priceToken = await atm.getPrice(parseEther(amountToken.toString()));
        expect(priceToken).to.equal(toWei(amountToken * tokenPrice / 100));

        // const commissionHere = await atm.getCommisson(priceToken);
        // console.log(commissionHere);

        // expect(commissionHere).to.equal(toWei(amountToken * tokenPrice * commission / (100 * 100)));

        const steps = 30; 
        const totalWithdrawed = await atm.getTotalWithdrawed(steps)
        console.log('totalWithdrawed', totalWithdrawed);
    });
});