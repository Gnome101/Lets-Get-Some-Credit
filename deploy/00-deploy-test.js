const { network, ethers } = require("hardhat");
module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  console.log("Chain", chainId);

  log("------------------------------------------------------------");
  let args;

  const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;
  console.log(timeStamp);
  args = [1234];
  const Test = await deploy("Test", {
    from: deployer,
    args: args,
    log: true,
    blockConfirmations: 2,
  });
};
module.exports.tags = ["All", "Test"];
