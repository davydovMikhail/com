const { task } = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
import { parseEther } from '@ethersproject/units';

task("transfer", "transfer of some token")
    .addParam("token", "token's address")
    .addParam("address", "recipient's address")
    .addParam("amount", "transfer's amount")
    .setAction(async function (taskArgs: any, hre: any) {
        const contract = await hre.ethers.getContractAt("ATM", process.env.ATM_ADDRESS);
        try {
            const amount = parseEther(taskArgs.amount.toString());
            await contract.transfer(taskArgs.token, taskArgs.address, amount);
            console.log(`Transfered. Token: ${taskArgs.token}. Recipient: ${taskArgs.address}. Amount: ${amount}.`);
        } catch (e) {
            console.log('error',e)
        }
    });