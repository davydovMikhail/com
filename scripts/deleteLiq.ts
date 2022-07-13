import { ethers } from "hardhat";
import { parseEther } from '@ethersproject/units';

async function main() {
    const router = await ethers.getContractAt("UniswapV2Router02", process.env.ROUTER_ADDRESS as string);
    const lpToken = await ethers.getContractAt("IUniswapV2Pair", process.env.LP_ADDRESS as string);
    const owner = '';
    const amountLiquidity = await lpToken.balanceOf(owner);

    await lpToken.approve(router.address, amountLiquidity);

    const stableAddress = '';
    const bullAddress = '';
    let currentTimestamp = Math.floor(Date.now() / 1000);

    const usdRecpnt = '';
    
    await router.removeLiquidity(
        stableAddress,
        bullAddress,
        amountLiquidity,
        parseEther(""),
        parseEther(""),
        usdRecpnt,
        currentTimestamp
    );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});