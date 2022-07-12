const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
import { parseEther } from '@ethersproject/units';

task("approve", "approve of some token")
    .addParam("token", "token's address")
    .addParam("address", "recipient's address")
    .addParam("amount", "approve's amount")
    .setAction(async function (taskArgs: any, hre: any) {
        const contract = await hre.ethers.getContractAt("ATM", process.env.ATM_ADDRESS);
        try {
            const amount = parseEther(taskArgs.amount.toString());
            await contract.approve(taskArgs.token, taskArgs.address, amount);
            console.log(`Approved. Token: ${taskArgs.token}. Recipient: ${taskArgs.address}. Amount: ${amount}.`);
        } catch (e) {
            console.log('error',e)
        }
    });