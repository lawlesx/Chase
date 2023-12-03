import { ethers } from "hardhat";

async function main() {
  const lockedAmount = ethers.parseEther("0.001");

  const chase = await ethers.deployContract("Chase", [], {
    value: lockedAmount,
  });

  await chase.waitForDeployment();

  console.log(
    `Chase with ${ethers.formatEther(
      lockedAmount
    )}ETH deployed to ${chase.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
