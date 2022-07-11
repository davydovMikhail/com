import { ethers } from "hardhat";
import { parseEther } from '@ethersproject/units';

async function main() {
    const atm = await ethers.getContractAt("ATM", process.env.ATM_ADDRESS as string);

    const tokenPrice = 1; // 0.01 $
    await atm.setPrice(tokenPrice);
    console.log('Price fot token setted');
    
    const minPrice = parseEther("1");
    await atm.setMinPrice(minPrice);
    console.log('Min price setted');

    const maxPrice = parseEther("3000");
    await atm.setMaxPrice(maxPrice);
    console.log('Max price setted');

    const router = '';
    await atm.setRouter(router);
    console.log('Router setted');

    const usdAddress = '';
    await atm.setStableToken(usdAddress);
    console.log('Stable address setted');

    const bullAddress = '';
    await atm.setSaleToken(bullAddress);
    console.log('Bull token address setted');

    const commission = 3; // %
    await atm.setCommission(commission);
    console.log('Commission setted');

    const threshold = parseEther("100");
    await atm.setThreshold(threshold);
    console.log('Threshold setted');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});