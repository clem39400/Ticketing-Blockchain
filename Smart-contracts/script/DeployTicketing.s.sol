// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console2} from "forge-std/Script.sol";
import {EventTicketing} from "../src/EventTicketing.sol"; // Notre futur contrat

contract DeployTicketing is Script {
    EventTicketing public ticketingContract;

    function setUp() public {}

    function run() public {
        // On récupère la clé privée depuis le fichier .env
        // Assurez-vous d'avoir une variable PRIVATE_KEY définie !
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Déploiement du Master Contract ERC1155
        ticketingContract = new EventTicketing();

        vm.stopBroadcast();

        console2.log("Contrat de billetterie deploye a l'adresse :", address(ticketingContract));
    }
}