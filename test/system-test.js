const { ethers } = require("hardhat");
const Big = require("big.js");
const contracts = require("../Addresses");

describe("Lets Get Some Credit", function () {
  let creditManager;
  let imposter; //sus
  let aavePool;
  let aavePoolAddressRegister;

  beforeEach(async () => {
    accounts = await ethers.getSigners(); // could also do with getNamedAccounts
    deployer = accounts[0];
    user = accounts[1];
    imposter = await ethers.getImpersonatedSigner(
      "0x19d96301865fdD07427db3c445508A051BC6D352"
    );
    console.log("Deploying everthing");
    await deployments.fixture(["All"]);
    creditManager = await ethers.getContract("CreditManager");
    creditMangerImposter = await ethers.getContract("CreditManager", imposter);

    const sepoliaPoolAddy = contracts.Sepolia.Pool;
    //const arbGoerlPoolAddy = "0x20fa38a4f8Af2E36f1Cc14caad2E603fbA5C535c";
    //const scrollPoolAddy = "0x48914C788295b5db23aF2b5F0B3BE775C4eA9440";

    aavePool = await ethers.getContractAt("IPool", sepoliaPoolAddy);
  });

  describe("Deployment", function () {
    it("can do aave stuff with aave", async () => {
      //const scrollPoolAddy = "0x48914C788295b5db23aF2b5F0B3BE775C4eA9440";

      console.log("Here");
      // console.log(`The contract ${test.target}was just born!`);
      //const num = await test.getNumber();
      //const daiAddyScroll = "0x7984E363c38b590bB4CA35aEd5133Ef2c6619C40";
      const DAI = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        contracts.Sepolia.DAI
      );
      //0x94Bb76d2420C1F083c53061CA862619D6056fdFE is address for dai debt tokens

      //0x19d96301865fdD07427db3c445508A051BC6D352
      console.log("Person", deployer.address);
      //const balance = await DAI.balanceOf(deployer.address);
      //console.log(balance);
      //const tx = await DAI.approve(aavePool.target, "10000000000000000");
      //await tx.wait();

      const impersonatedAccount = await ethers.getImpersonatedSigner(
        "0x19d96301865fdD07427db3c445508A051BC6D352"
      );
      // Impersonate the account
      console.log("Here");
      const impDAI = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        contracts.Sepolia.DAI,
        impersonatedAccount
      );

      const aaveImpersonatedPool = await ethers.getContractAt(
        "IPool",
        contracts.Sepolia.Pool,
        impersonatedAccount
      );
      console.log("Trying to read balance");
      let balance = await impDAI.balanceOf(impersonatedAccount.address);
      console.log(balance);
      const ghoVDebtToken = await ethers.getContractAt(
        "VariableDebtToken",
        contracts.Sepolia.VGHODebt,
        impersonatedAccount
      );
      const ghoSDebtToken = await ethers.getContractAt(
        "StableDebtToken",
        contracts.Sepolia.SGHODebt,
        impersonatedAccount
      );
      await impDAI.approve(aavePool.target, "100000000000000000");

      await aaveImpersonatedPool.supply(
        contracts.Sepolia.DAI,
        "100000000000000000",
        impersonatedAccount.address,
        0
      );
      await ghoVDebtToken.approveDelegation(deployer.address, "90000000000000");
      await ghoSDebtToken.approveDelegation(deployer.address, "90000000000000");
      const VGho = await ethers.getContractAt(
        "VariableDebtToken",
        contracts.Sepolia.VGHODebt,
        impersonatedAccount
      );
      balance = await VGho.balanceOf(deployer.address);
      console.log(balance);
      console.log("Here!");

      await aavePool.borrow(
        contracts.Sepolia.GHO,
        "1000000",
        2,
        0,
        impersonatedAccount.address
      );

      balance = await VGho.balanceOf(deployer.address);
      console.log(balance);

      //console.log(num);
    });
    it("can add users cupud", async () => {
      //Can add users
      //Need to verify user
      await creditManager.verifyUser("0x", deployer.address);
      const imposterDai = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        contracts.Sepolia.DAI,
        imposter
      );
      let treefiddy = new Big("3.5").pow(18);
      treefiddy = treefiddy.round();

      await imposterDai.approve(creditManager.target, treefiddy.toFixed());

      await creditMangerImposter.depositCollateral(
        contracts.Sepolia.DAI,
        treefiddy.toFixed()
      );
      let twoo = new Big("2").pow(18);
      twoo = treefiddy.round();
      //
      twee = new Big("3").pow(18);
      twee = treefiddy.round();
      //Deployer creates loan offer
      const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;

      await creditManager.createLoanOffer(
        twoo.toFixed(),
        twee.toFixed(),
        timeStamp + 86400 * 10
      );

      //Lender approves the loan
    });
  });
});
