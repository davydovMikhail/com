import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import * as mocha from "mocha-steps";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { Bull } from '../typechain'






describe("Bull token test", async () => {

    let owner: SignerWithAddress;
    let controller: SignerWithAddress;
    let controller2: SignerWithAddress;
    let user1: SignerWithAddress;
    let user2: SignerWithAddress;
    let user3: SignerWithAddress;
    let user4: SignerWithAddress;

    let bull: Bull;



    mocha.step('1. Contract creation and users', async function () {
        [owner, controller, controller2, user1, user2, user3, user4] = await ethers.getSigners()
        const BullF = await ethers.getContractFactory("Bull");
        bull = await BullF.connect(owner).deploy("Token", "TKN", parseEther("10000"));
        await bull.deployed();
    })

    mocha.step('2. Transfer without lock', async function () {
        await bull.connect(owner).transfer(user1.address, parseEther("2000"));
        await bull.connect(user1).transfer(user2.address, parseEther("500"))
        expect(await bull.balanceOf(user1.address)).to.equal(parseEther("1500"));
        await bull.connect(user1).approve(user3.address, parseEther("500"));
        await bull.connect(user3).transferFrom(user1.address, user3.address, parseEther("250"));
        expect(await bull.balanceOf(user3.address)).to.equal(parseEther("250"));
    });

    mocha.step('3. Setting lock', async function () {
        await bull.connect(owner).addController(controller.address);
        await bull.connect(controller).setLock();
        await expect(bull.connect(user1).transfer(user2.address, parseEther("500"))).to.be.revertedWith("Transfer is temporarily locked");
        await expect(bull.connect(user1).approve(user2.address, parseEther("500"))).to.be.revertedWith("Transfer is temporarily locked");
        await expect(bull.connect(user3).transferFrom(user1.address, user3.address, parseEther("250"))).to.be.revertedWith("Transfer is temporarily locked");
        await bull.connect(owner).addController(controller2.address);
        await bull.connect(owner).transfer(controller2.address, parseEther("2000"));
    });

    mocha.step('4. Setting controller', async function() {
        await bull.connect(controller2).transfer(user2.address, parseEther("500"));
        expect(await bull.balanceOf(controller2.address)).to.equal(parseEther("1500"));
        await bull.connect(controller2).approve(user2.address, parseEther("500"));
        await bull.connect(owner).addController(user2.address);
        await bull.connect(user2).transferFrom(controller2.address, user3.address, parseEther("250"));
        expect(await bull.balanceOf(user3.address)).to.equal(parseEther("500"));
    });

    mocha.step('5. Unsetting lock', async function () {
        await bull.connect(controller).setLock();
        await bull.connect(owner).transfer(user4.address, parseEther("2000"));
        await bull.connect(user4).transfer(user2.address, parseEther("500"))
        expect(await bull.balanceOf(user4.address)).to.equal(parseEther("1500"));
        await bull.connect(user4).approve(user3.address, parseEther("500"));
        await bull.connect(user3).transferFrom(user4.address, user3.address, parseEther("250"));
        expect(await bull.balanceOf(user3.address)).to.equal(parseEther("750"));
    });
});