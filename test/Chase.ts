import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Chase", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployChasedAmount() {
    const ONE_GWEI = 1_000_000_000;
    const lockedAmount = ONE_GWEI;
    const noOfClaims = 5;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Chase = await ethers.getContractFactory("Chase");
    const chase = await Chase.deploy(noOfClaims,{ value: lockedAmount } );

    return { chase, lockedAmount, owner, otherAccount, noOfClaims };
  }

  describe("Deployment", function () {
    it("Should set the right amount", async function () {
      const { chase, lockedAmount } = await loadFixture(deployChasedAmount);

      expect(await chase.totalAmount()).to.equal(lockedAmount);
    });

    it("Should set the right number of claims", async function () {
      const { chase, noOfClaims } = await loadFixture(deployChasedAmount);

      expect(await chase.noOfClaims()).to.equal(noOfClaims);
    });

    it("Should receive and store the funds to chase", async function () {
      const { chase, lockedAmount } = await loadFixture(
        deployChasedAmount
      );

      expect(await ethers.provider.getBalance(chase.target)).to.equal(
        lockedAmount
      );
    });
  });

  describe("Claims", function () {
    describe("Transfers", function () {
      it("Should transfer the funds to the claimer", async function () {
        const { chase, lockedAmount, otherAccount, noOfClaims } = await loadFixture(
          deployChasedAmount
        );

        console.log("Amount Deducted",lockedAmount/noOfClaims);

        await expect(chase.connect(otherAccount).claim()).to.changeEtherBalances(
          [otherAccount, chase],
          [lockedAmount/noOfClaims, -lockedAmount/noOfClaims]
        );
      });
    });

    describe("TotalAmount", function () {
      it("Should decrease the total amount", async function () {
        const { chase, lockedAmount, otherAccount, noOfClaims } = await loadFixture(
          deployChasedAmount
        );

        await chase.connect(otherAccount).claim();

        console.log("Total Amount Left in Contract",await chase.totalAmount());
      
        expect(await chase.totalAmount()).to.equal(lockedAmount - lockedAmount/noOfClaims);
      });
    });

    describe("FailedWithdraw", function () {
      it("Should Fail Withdraw if someone else's withdraws", async function () {
        const { chase, lockedAmount, owner, otherAccount, noOfClaims } = await loadFixture(
          deployChasedAmount
        );
        
        await chase.connect(otherAccount).claim();

        await expect(chase.connect(otherAccount).withdrawRemaining()).to.be.revertedWith(
          "Only the owner can call this function"
        );
      });
    });
    
    describe("Withdraw", function () {
      it("Should withdraw the funds to the owner", async function () {
        const { chase, lockedAmount, owner, otherAccount, noOfClaims } = await loadFixture(
          deployChasedAmount
        );

        await chase.connect(otherAccount).claim();
        
        await expect(chase.connect(owner).withdrawRemaining()).to.changeEtherBalances(
          [owner, chase],
          [lockedAmount - lockedAmount/noOfClaims, -lockedAmount + lockedAmount/noOfClaims]
        );
      });
    });

    describe("Check Balance zero after withdraw", function () {
      it("Should check the balance of the contract is zero", async function () {
        const { chase, lockedAmount, owner, otherAccount, noOfClaims } = await loadFixture(
          deployChasedAmount
        );

        await chase.connect(otherAccount).claim();
        
        await chase.connect(owner).withdrawRemaining();

        expect(await ethers.provider.getBalance(chase.target)).to.equal(
          0
        );
      });
    });
  });

  describe("Checks", function () {
    describe("HasClaimed", function () {
      it("Should check if the account has claimed", async function () {
        const { chase, otherAccount } = await loadFixture(
          deployChasedAmount
        );

        await chase.connect(otherAccount).claim();

        expect(await chase.hasClaimed(otherAccount.address)).to.equal(true);
      });
    });

    describe("FailedClaim", function () {
      it("Should fail if the account has already claimed", async function () {
        const { chase, otherAccount } = await loadFixture(
          deployChasedAmount
        );

        await chase.connect(otherAccount).claim();

        await expect(chase.connect(otherAccount).claim()).to.be.revertedWith(
          "You have already claimed"
        );
      });
    });
  });
});
