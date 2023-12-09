// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Chase.sol";  // Import the Chase contract

contract ChaseFactory {
    address[] public chaseContracts;

    event ChaseContractCreated(address indexed chaseContract, address indexed owner);

    // Function to create a new Chase contract
    function createChase(uint256 _noOfClaims) external payable {
        Chase newChase = new Chase{value: msg.value}(_noOfClaims);
        newChase.deposit();  // Deposit the initial value to the new Chase contract
        chaseContracts.push(address(newChase));

        emit ChaseContractCreated(address(newChase), msg.sender);
    }

    // Function to get the count of Chase contracts created
    function getChaseContractsCount() external view returns (uint256) {
        return chaseContracts.length;
    }
}
