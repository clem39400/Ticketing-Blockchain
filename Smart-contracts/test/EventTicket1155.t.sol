// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EventTicket1155.sol";

contract EventTicket1155Test is Test {
    EventTicket1155 ticket;

    address owner  = address(0x1);
    address buyer  = address(0x2);
    address buyer2 = address(0x3);

    uint256 constant PRICE_STD = 0.01 ether;
    uint256 constant PRICE_VIP = 0.1 ether;

    function setUp() public {
        vm.prank(owner);
        ticket = new EventTicket1155("Super Concert", owner);

        // Créer 2 catégories
        vm.startPrank(owner);
        ticket.createCategory("Entree standard", PRICE_STD, 100, "ipfs://hash1/");
        ticket.createCategory("VIP",             PRICE_VIP,  10, "ipfs://hash2/");
        vm.stopPrank();

        vm.deal(buyer,  1 ether);
        vm.deal(buyer2, 1 ether);
    }

    //  Les catégories sont bien créées
    function test_CategoriesCreated() public view {
        (string memory name, uint256 price, uint256 max,,,) = ticket.categories(1);
        assertEq(name, "Entree standard");
        assertEq(price, PRICE_STD);
        assertEq(max, 100);

        assertEq(ticket.getCategoryCount(), 2);
    }

    //  Mint ETH catégorie standard
    function test_MintForETH_Standard() public {
        vm.prank(buyer);
        ticket.mintForETH{value: PRICE_STD}(1);

        assertEq(ticket.balanceOf(buyer, 1), 1);
        assertEq(address(ticket).balance, PRICE_STD);
    }

    //  Mint ETH catégorie VIP
    function test_MintForETH_VIP() public {
        vm.prank(buyer);
        ticket.mintForETH{value: PRICE_VIP}(2);

        assertEq(ticket.balanceOf(buyer, 2), 1);
    }

    // Mint par l'API (owner mint pour un acheteur euros)
    function test_MintForAddress() public {
        vm.prank(owner);
        ticket.mintForAddress(1, buyer);

        assertEq(ticket.balanceOf(buyer, 1), 1);
    }

    //  Mauvais prix
    function test_RevertIf_WrongPrice() public {
        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(
                EventTicket1155.IncorrectPrice.selector, 1, 0.005 ether, PRICE_STD
            )
        );
        ticket.mintForETH{value: 0.005 ether}(1);
    }

    //  Catégorie inexistante
    function test_RevertIf_CategoryNotFound() public {
        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(EventTicket1155.CategoryNotFound.selector, 99)
        );
        ticket.mintForETH{value: 0.01 ether}(99);
    }

    //  Sold out
    function test_RevertIf_SoldOut() public {
        // Créer une catégorie avec stock = 1
        vm.prank(owner);
        ticket.createCategory("Ultra rare", 0.5 ether, 1, "ipfs://rare/");
        uint256 rareId = ticket.getCategoryCount();

        vm.deal(buyer, 2 ether);
        vm.prank(buyer);
        ticket.mintForETH{value: 0.5 ether}(rareId);

        vm.prank(buyer2);
        vm.deal(buyer2, 2 ether);
        vm.expectRevert(
            abi.encodeWithSelector(EventTicket1155.SoldOut.selector, rareId)
        );
        ticket.mintForETH{value: 0.5 ether}(rareId);
    }

    //  mintForAddress par non-owner
    function test_RevertIf_NotOwner_Mint() public {
        vm.prank(buyer);
        vm.expectRevert();
        ticket.mintForAddress(1, buyer2);
    }

    //  Withdraw
    function test_Withdraw() public {
        vm.prank(buyer);
        ticket.mintForETH{value: PRICE_STD}(1);

        uint256 balBefore = owner.balance;
        vm.prank(owner);
        ticket.withdraw();

        assertEq(owner.balance, balBefore + PRICE_STD);
        assertEq(address(ticket).balance, 0);
    }

    //  remainingTickets décrémente correctement
    function test_RemainingTickets() public {
        assertEq(ticket.remainingTickets(1), 100);
        vm.prank(buyer);
        ticket.mintForETH{value: PRICE_STD}(1);
        assertEq(ticket.remainingTickets(1), 99);
    }

    //  URI par catégorie
    function test_URI() public view {
        assertEq(ticket.uri(1), "ipfs://hash1/");
        assertEq(ticket.uri(2), "ipfs://hash2/");
    }

    //  Ajout d'une catégorie après déploiement (use case roadmap étape 7)
    function test_AddCategoryAfterDeploy() public {
        vm.prank(owner);
        uint256 newId = ticket.createCategory("Backstage", 0.5 ether, 5, "ipfs://back/");

        assertEq(newId, 3);
        assertEq(ticket.getCategoryCount(), 3);
        assertEq(ticket.remainingTickets(3), 5);
    }
}