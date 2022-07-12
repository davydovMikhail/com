import { ethers } from "hardhat";
// import { parseEther } from '@ethersproject/units';

async function main() {
    const bull = await ethers.getContractAt("Bull", process.env.BULL_ADDRESS as string);

    const unlockTime = 0;
    await bull.setLockTime(unlockTime);
    console.log('Unlock time setted');

    const router = '';
    await bull.setRouter(router);
    console.log('Router address setted');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});