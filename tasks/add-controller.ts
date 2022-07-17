const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
// import { parseEther } from '@ethersproject/units';

task("addController", "Adding address for controlling")
    .addParam("address", "potential token's controller")
    .setAction(async function (taskArgs: any, hre: any) {
        const contract = await hre.ethers.getContractAt("Bull", process.env.BULL_ADDRESS);
        try {
            await contract.addController(taskArgs.address);
            console.log(`Controller added: ${taskArgs.address}`);
        } catch (e) {
            console.log('error',e)
        }
    });