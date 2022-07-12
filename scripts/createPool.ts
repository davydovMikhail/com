import { ethers } from "hardhat";
import { parseEther } from '@ethersproject/units';

async function main() {
    const router = await ethers.getContractAt("UniswapV2Router02", process.env.ROUTER_ADDRESS as string);
    const usd = await ethers.getContractAt("USD", process.env.STABLE_ADDRESS as string);
    const bull = await ethers.getContractAt("Bull", process.env.BULL_ADDRESS as string);
    

    const liqRecpnt = '';
    const initLiqUSD = parseEther("10");
    const initLiqBull = parseEther("0.1");
    let currentTimestamp = Math.floor(Date.now() / 1000);


    await usd.approve(router.address, initLiqUSD);
    await bull.approve(router.address, initLiqBull);
    await router.addLiquidity(
        usd.address,
        bull.address,
        initLiqUSD,
        initLiqBull,
        initLiqUSD,
        initLiqBull,
        liqRecpnt,
        currentTimestamp + 30
    );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});