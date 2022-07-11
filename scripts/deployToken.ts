import { ethers } from "hardhat";
import { parseEther } from '@ethersproject/units';


const name = "";
const symbol = "";
const totalSupply = parseEther("10000");

async function main() {
  const Bull = await ethers.getContractFactory("Bull");
  const bull = await Bull.deploy(name, symbol, totalSupply);
  await bull.deployed();
  console.log("Bull deployed to:", bull.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});