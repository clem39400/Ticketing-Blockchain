// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EventTicket1155.sol";

contract DeployTicketing is Script {
    function run() external {
        vm.startBroadcast();  // ← plus de private key ici, Forge la prend du --private-key

        address deployer = msg.sender;

        EventTicket1155 eventContract = new EventTicket1155(
            "Super Concert Test",
            deployer
        );

        eventContract.createCategory("Entree standard", 0.01 ether, 500, "ipfs://TODO1/");
        eventContract.createCategory("VIP",             0.1 ether,   50, "ipfs://TODO2/");

        console.log("Contrat deploye a:", address(eventContract));

        vm.stopBroadcast();
    }
}