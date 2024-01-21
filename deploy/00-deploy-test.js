const { network, ethers } = require("hardhat");
const { verify } = require("../utils/verify");
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
  if (chainId != 31337 && process.env.ETHERSCAN_API_KEY) {
    log("Verifying...");
    await verify(
      CreditManager.address,
      args,
      "contracts/CreditManager.sol:CreditManager"
    );
  }
};
module.exports.tags = ["All", "CreditManager"];
