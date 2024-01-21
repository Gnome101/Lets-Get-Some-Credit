const { ethers } = require("hardhat");
const Big = require("big.js");
const contracts = require("../Addresses");
require("dotenv").config();

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
      const DAI = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        contracts.Sepolia.DAI
      );
      const GHO = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        contracts.Sepolia.GHO
      );
      const imposterGHO = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        contracts.Sepolia.GHO,
        imposter
      );
      await creditManager.verifyUser("0x", deployer.address);
      const imposterDai = await ethers.getContractAt(
        "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20",
        contracts.Sepolia.DAI,
        imposter
      );
      let treefiddy = new Big("350000000");
      treefiddy = treefiddy.round();

      await imposterDai.approve(creditManager.target, treefiddy.toFixed());

      await creditMangerImposter.depositCollateral(
        contracts.Sepolia.DAI,
        treefiddy.toFixed()
      );
      let twoo = new Big("200000000");
      twoo = twoo.round();
      //
      one = new Big("300000000");
      one = one.round();
      //Deployer creates loan offer
      const timeStamp = (await ethers.provider.getBlock("latest")).timestamp;

      await creditManager.createLoanOffer(
        twoo.toFixed(),
        one.toFixed(),
        timeStamp + 86400 * 10
      );

      const ghoVDebtToken = await ethers.getContractAt(
        "VariableDebtToken",
        contracts.Sepolia.VGHODebt,
        imposter
      );
      // const ghoSDebtToken = await ethers.getContractAt(
      //   "StableDebtToken",
      //   contracts.Sepolia.SGHODebt,
      //   imposter
      // );

      await ghoVDebtToken.approveDelegation(creditManager.target, "200000000");
      await creditMangerImposter.acceptLoan(0);
      //await ghoSDebtToken.approveDelegation(creditManager.target, "200000000");

      await creditManager.borrowFromLoan(0);
      bal1 = await GHO.balanceOf(deployer.address);
      console.log(bal1);
      //Deployer needs more dai
      await imposterGHO.transfer(deployer.address, "100000000");
      bal2 = await GHO.balanceOf(deployer.address);
      console.log(bal2);
      await GHO.approve(creditManager.target, "300000000");
      //This failed
      console.log("Here");
      await creditManager.payOffLoan(0, 300000000);
      const aaveImpersonatedPool = await ethers.getContractAt(
        "IPool",
        contracts.Sepolia.Pool,
        imposter
      );
      await aaveImpersonatedPool.withdraw(
        DAI.target,
        treefiddy.toFixed(),
        imposter.address
      );
      // await creditMangerImposter.stopLending(DAI.target);

      const score = await creditManager.getCreditScore(deployer.address);
      console.log("Score", score);
    });
    async function createSignature() {
      const nonce = await getNonce(delegator);
      const DOMAIN_SEPARATOR = await contract.DOMAIN_SEPARATOR();
      const DELEGATION_WITH_SIG_TYPEHASH =
        await contract.DELEGATION_WITH_SIG_TYPEHASH();

      // EIP-712 Typed Data
      const typedData = {
        domain: {
          name: "YourContractName",
          version: "1",
          chainId: await wallet.getChainId(),
          verifyingContract: contractAddress,
        },
        types: {
          Delegation: [
            { name: "delegatee", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Delegation",
        message: {
          delegatee: delegatee,
          value: value.toString(),
          nonce: nonce.toNumber(),
          deadline: deadline,
        },
      };

      const signature = await wallet._signTypedData(
        typedData.domain,
        { Delegation: typedData.types.Delegation },
        typedData.message
      );

      return ethers.utils.splitSignature(signature);
    }
  });
});
