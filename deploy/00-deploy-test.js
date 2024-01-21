const { network, ethers } = require("hardhat");
module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  console.log("Chain", chainId);
  const contracts = require("../Addresses");

  log("------------------------------------------------------------");
  let args;

  const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;
  console.log(timeStamp);
  args = [
    contracts.Sepolia.GHO,
    contracts.Sepolia.Pool,
    contracts.Sepolia.SGHODebt,
    contracts.Sepolia.VGHODebt,
  ];
  const CreditManager = await deploy("CreditManager", {
    from: deployer,
    args: args,
    log: true,
    blockConfirmations: 2,
  });
};
module.exports.tags = ["All", "CreditManager"];
