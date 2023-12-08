// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Chase {
    address public owner;
    uint256 public totalAmount;
    uint256 public totalClaimedCount;
    uint256 public noOfClaims;
    mapping(address => bool) public hasClaimed;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Constructor sets initial deposit value
    constructor(uint256 _noOfClaims) payable {
        require(msg.value > 0, "Initial deposit must be greater than zero");
        owner = msg.sender;
        totalAmount = msg.value;
        noOfClaims = _noOfClaims;
    }

    // Function to deposit ETH
    function deposit() external onlyOwner payable {
        totalAmount += msg.value;
    }

    // Function to claim ETH
    function claim() external {
        uint256 availableClaims = noOfClaims - totalClaimedCount;

        require(availableClaims > 0, "No more claims available");
        require(totalAmount > 0, "No ETH available to claim");
        require(!hasClaimed[msg.sender], "You have already claimed");


        uint256 toTransfer = totalAmount / (noOfClaims - totalClaimedCount);
        totalAmount -= toTransfer;
        totalClaimedCount++;
        hasClaimed[msg.sender] = true;
        payable(msg.sender).transfer(toTransfer);
    }

    // Function to withdraw remaining ETH by the owner
    function withdrawRemaining() external onlyOwner {
        require(totalAmount > 0, "No ETH available to withdraw");
        payable(owner).transfer(totalAmount);
        totalAmount = 0;
    }
}
