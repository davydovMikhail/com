const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
// import { parseEther } from '@ethersproject/units';

task("setLock", "Lock / unlock")
    .setAction(async function (taskArgs: any, hre: any) {
        const contract = await hre.ethers.getContractAt("Bull", process.env.BULL_ADDRESS);
        try {
            await contract.setLock();
            console.log('Lock / unlock');
        } catch (e) {
            console.log('error',e)
        }
    });