// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

interface ICreditManager {
    // Interface contents go here
    struct LenderInfo {
        address lender;
        uint256 balance;
        uint256 amountBorrowed;
        uint256 numberOfLoans;
        uint256 timeCreated;
    }
    struct LoanOffer {
        uint256 loanID;
        address borrower;
        uint256 amountWanted;
        uint256 amountToBePayed;
        uint256 promisedPayDate;
        uint256 timeCreated;
        bool taken;
    }
    struct LoanInfo {
        uint256 loanID;
        address lender;
        address borrower;
        uint256 amountGiven;
        uint256 amountTaken;
        uint256 amountOwed;
        uint256 timeCreated;
        uint256 promisedPayDate;
    }
    struct borrowerInfo {
        uint256 totalDebt;
        uint256 totalAmountPaid;
        uint256 numberOfLoans;
        uint256 activeLoans;
    }
}
