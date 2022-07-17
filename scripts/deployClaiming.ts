import { ethers } from "hardhat";
// import { parseEther } from '@ethersproject/units';


const stableToken = "";
const bullToken = "";
const tokenPriceForClaim = 2; // в центах


async function main() {
  const Claiming = await ethers.getContractFactory("Claiming");
  const claiming = await Claiming.deploy(tokenPriceForClaim, stableToken, bullToken);
  await claiming.deployed();
  console.log("Claiming contract deployed to:", claiming.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});