import { ethers } from "hardhat";

async function main() {
  const ATM = await ethers.getContractFactory("ATM");
  const atm = await ATM.deploy();
  await atm.deployed();
  console.log("ATM deployed to:", atm.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});