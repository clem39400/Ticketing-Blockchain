// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EventTicket1155.sol";

contract DeployEventTicket is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        EventTicket1155 eventContract = new EventTicket1155(
            "Super Concert Test",
            deployer
        );

        // Créer les catégories initiales
        eventContract.createCategory("Entree standard", 0.01 ether, 500, "ipfs://TODO1/");
        eventContract.createCategory("VIP",             0.1 ether,   50, "ipfs://TODO2/");

        console.log("Contrat deploye a:", address(eventContract));
        console.log("Nb categories:", eventContract.getCategoryCount());

        vm.stopBroadcast();
    }
}