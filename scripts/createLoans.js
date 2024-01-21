const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { network, ethers } = require("hardhat");

async function main() {
  creditManager = await ethers.getContractAt("CreditManager", diamondAddress);

  let num1 = new Big("200000000");
  num1 = num1.round();
  //
  num2 = new Big("300000000");
  num2 = num2.round();
  //Deployer creates loan offer
  const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;

  let tx = await creditManager.createLoanOffer(num1, num2, timeStamp + 1000);
  await tx.wait();
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
