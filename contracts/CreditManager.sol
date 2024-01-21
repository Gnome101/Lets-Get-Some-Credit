// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {IPool} from "aave/contracts/interfaces/IPool.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {VariableDebtToken} from "aave/contracts/protocol/tokenization/VariableDebtToken.sol";
import {StableDebtToken} from "aave/contracts/protocol/tokenization/StableDebtToken.sol";
import {ICreditManager} from "./ICreditManager.sol";
import {TransferHelper} from "./TransferHelper.sol";

contract CreditManager {
    address public immutable ghoToken;
    address public immutable poolAave;
    address public immutable ghoStableDebt;
    address public immutable ghoVarDebt;

    uint256 public lenderID;
    mapping(address => ICreditManager.LenderInfo) public addyToInfo;
    mapping(uint256 => ICreditManager.LoanOffer) public idToOffer;
    mapping(uint256 => ICreditManager.LoanInfo) public idToLoan;
    mapping(address => ICreditManager.borrowerInfo) public addyToBorrower;

    mapping(bytes => address) public verifiedUserData;
    mapping(address => bool) public verifiedUser;
    mapping(address => uint256[]) public lenderToLoans;

    mapping(address => bool) public validators;

    constructor(
        address _ghoToken,
        address _poolAave,
        address _ghoStableDebt,
        address _ghoVarDebt
    ) {
        ghoToken = _ghoToken;
        poolAave = _poolAave;
        ghoStableDebt = _ghoStableDebt;
        ghoVarDebt = _ghoVarDebt;
        validators[msg.sender] = true;
    }

    function depositCollateral(address asset, uint256 amount) public {
        TransferHelper.safeTransferFrom(
            asset,
            msg.sender,
            address(this),
            amount
        );
        IERC20(asset).approve(poolAave, amount);
        IPool(poolAave).supply(asset, amount, address(this), 0);
        if (addyToInfo[msg.sender].lender == address(0)) {
            //New lender
            addyToInfo[msg.sender] = ICreditManager.LenderInfo({
                lender: msg.sender,
                balance: amount,
                amountBorrowed: 0,
                numberOfLoans: 0,
                timeCreated: block.timestamp
            });
        } else {
            //Existing Lender
            addyToInfo[msg.sender].balance += amount;
        }
    }

    function createLoanOffer(
        uint256 amountWanted,
        uint256 coverAmount,
        uint256 promisedPayDate
    ) public {
        idToOffer[lenderID] = ICreditManager.LoanOffer({
            loanID: lenderID,
            borrower: msg.sender,
            amountWanted: amountWanted,
            amountToBePayed: coverAmount,
            promisedPayDate: promisedPayDate,
            timeCreated: block.timestamp,
            taken: false
        });
        require(verifiedUser[msg.sender]);

        lenderID++;
    }

    function acceptLoan(uint256 loanID) public {
        require(
            addyToInfo[msg.sender].balance -
                addyToInfo[msg.sender].amountBorrowed >=
                idToOffer[loanID].amountWanted,
            "NELC" //Not enough lent capital
        );
        address borrower = idToOffer[loanID].borrower;
        StableDebtToken(ghoStableDebt).approveDelegation(
            borrower,
            idToOffer[loanID].amountWanted
        );
        VariableDebtToken(ghoVarDebt).approveDelegation(
            borrower,
            idToOffer[loanID].amountWanted
        );
        idToOffer[loanID].taken = true;
        lenderToLoans[msg.sender].push(loanID);
        idToLoan[loanID] = ICreditManager.LoanInfo({
            loanID: loanID,
            lender: msg.sender,
            borrower: borrower,
            amountGiven: idToOffer[loanID].amountWanted,
            amountTaken: 0,
            amountOwed: idToOffer[loanID].amountToBePayed,
            timeCreated: block.timestamp,
            promisedPayDate: idToOffer[loanID].promisedPayDate
        });
    }

    function borrowFromLoan(uint256 loanID) public {
        IPool(poolAave).borrow(
            ghoToken,
            idToLoan[loanID].amountGiven,
            2,
            0,
            idToLoan[loanID].lender
        );

        addyToInfo[idToLoan[loanID].lender].amountBorrowed += idToLoan[loanID]
            .amountGiven;
        addyToInfo[idToLoan[loanID].lender].numberOfLoans++;

        idToLoan[loanID].amountTaken += idToLoan[loanID].amountGiven;
        addyToBorrower[msg.sender].numberOfLoans++;
        addyToBorrower[msg.sender].activeLoans++;
        addyToBorrower[msg.sender].totalDebt += idToLoan[loanID].amountOwed;
    }

    function payOffLoan(uint256 loanID, uint256 amount) public {
        TransferHelper.safeTransferFrom(
            ghoToken,
            msg.sender,
            address(this),
            amount
        );
        IERC20(ghoToken).approve(poolAave, amount);
        IPool(poolAave).repay(ghoToken, amount, 2, idToLoan[loanID].lender);
        addyToBorrower[msg.sender].numberOfLoans++;
        addyToBorrower[msg.sender].activeLoans--;
        addyToBorrower[msg.sender].totalDebt -= amount;
        addyToBorrower[msg.sender].totalAmountPaid += amount;
    }

    function stopLending() public {
        TransferHelper.safeTransfer(
            ghoToken,
            msg.sender,
            addyToInfo[msg.sender].balance -
                addyToInfo[msg.sender].amountBorrowed
        );

        addyToInfo[msg.sender].balance -=
            addyToInfo[msg.sender].balance -
            addyToInfo[msg.sender].amountBorrowed;
    }

    function verifyUser(bytes memory data, address user) public {
        require(validators[msg.sender]);
        if (verifiedUserData[data] != address(0)) {
            revert();
        }
        verifiedUserData[data] = user;
        verifiedUser[user] = true;
    }
}
