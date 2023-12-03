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

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Chase = await ethers.getContractFactory("Chase");
    const chase = await Chase.deploy({ value: lockedAmount } );

    return { chase, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right amount", async function () {
      const { chase, lockedAmount } = await loadFixture(deployChasedAmount);

      expect(await chase.amount()).to.equal(lockedAmount);
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
        const { chase, lockedAmount, otherAccount } = await loadFixture(
          deployChasedAmount
        );

        await expect(chase.connect(otherAccount).claim()).to.changeEtherBalances(
          [otherAccount, chase],
          [lockedAmount, -lockedAmount]
        );
      });
    });
  });
});
