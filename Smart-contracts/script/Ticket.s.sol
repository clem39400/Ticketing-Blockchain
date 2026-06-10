// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Ticket.sol";

contract TicketScript is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        Ticket ticket = new Ticket("ipfs://");

        console.log("Ticket deployed at:", address(ticket));

        vm.stopBroadcast();
    }
}