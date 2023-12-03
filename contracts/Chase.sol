// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Chase {
    uint256 public amount;

    // Constructor sets initial deposit value
    constructor() payable {
        require(msg.value > 0, "Initial deposit must be greater than zero");
        amount = msg.value;
    }

    // Function to deposit ETH
    function deposit() external payable {
        amount += msg.value;
    }

    // Function to claim ETH
    function claim() external {
        require(amount > 0, "No ETH available to claim");

        uint256 toTransfer = amount;
        amount = 0;
        payable(msg.sender).transfer(toTransfer);
    }
}
