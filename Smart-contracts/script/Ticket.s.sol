// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/Ticket.sol";

contract TicketScript is Script {
    function run() external {
        vm.startBroadcast();

        address deployer = msg.sender;

        Ticket ticket = new Ticket("ipfs://");

        ticket.createCategory(0, 0.01 ether, 100, "ipfs://TODO_ENTREE/");
        ticket.createCategory(1, 0.1 ether,   50, "ipfs://TODO_VIP/");

        console.log("Contrat deploye a:", address(ticket));
        console.log("Deployer:", deployer);

        vm.stopBroadcast();
    }
}