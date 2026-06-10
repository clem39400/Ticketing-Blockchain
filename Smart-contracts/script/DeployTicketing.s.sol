// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {EventTicket1155} from "../src/EventTicket1155.sol";

contract DeployTicketing is Script {
    EventTicket1155 public ticketingContract;

    function setUp() public {}

    function run() public {
        // Récupération de la clé privée depuis le .env
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // On déduit l'adresse publique (le futur "owner") à partir de la clé privée
        address deployerAddress = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // Déploiement en passant le nom de l'événement et l'adresse du propriétaire
        ticketingContract = new EventTicket1155("Concert Paris 1", deployerAddress);

        vm.stopBroadcast();

        console2.log("Contrat deploye a l'adresse :", address(ticketingContract));
        console2.log("Proprietaire (API) :", deployerAddress);
    }
}