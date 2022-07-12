import { ethers } from "hardhat";
import { parseEther } from '@ethersproject/units';

async function main() {
    const tokenPrice = 1; // 0.01 $
    const minPrice = parseEther("1");
    const maxPrice = parseEther("3000");
    const commission = 3; // %
    const threshold = parseEther("100");
    const ATM = await ethers.getContractFactory("ATM");
    const atm = await ATM.deploy(
      tokenPrice,
      minPrice,
      maxPrice,
      commission,
      threshold
    );
    await atm.deployed();
    console.log("ATM deployed to:", atm.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});