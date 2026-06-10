// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TicketNFT.sol";

contract TicketNFTTest is Test {
    TicketNFT ticket;

    address owner = address(0x1);
    address buyer = address(0x2);
    address buyer2 = address(0x3);

    uint256 constant PRICE = 0.01 ether;
    uint256 constant MAX_SUPPLY = 3;

    function setUp() public {
        vm.prank(owner);
        ticket = new TicketNFT(
            "Super Concert",
            "TKT",
            PRICE,
            MAX_SUPPLY,
            "ipfs://fakehash/",
            owner
        );
        // On donne des ETH aux acheteurs
        vm.deal(buyer, 1 ether);
        vm.deal(buyer2, 1 ether);
    }

    // Mint on-chain avec le bon prix
    function test_MintForETH() public {
        vm.prank(buyer);
        uint256 tokenId = ticket.mintForETH{value: PRICE}();

        assertEq(tokenId, 1);
        assertEq(ticket.ownerOf(1), buyer);
        assertEq(ticket.totalMinted(), 1);
        assertEq(address(ticket).balance, PRICE);
    }

    // Mint par l'API (owner mint pour quelqu'un)
    function test_MintForAddress() public {
        vm.prank(owner);
        uint256 tokenId = ticket.mintForAddress(buyer);

        assertEq(tokenId, 1);
        assertEq(ticket.ownerOf(1), buyer);
    }

    // Mauvais prix
    function test_RevertIf_WrongPrice() public {
        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(TicketNFT.IncorrectPrice.selector, 0.005 ether, PRICE)
        );
        ticket.mintForETH{value: 0.005 ether}();
    }

    // Sold out
    function test_RevertIf_SoldOut() public {
        vm.prank(buyer);
        ticket.mintForETH{value: PRICE}();
        vm.prank(buyer);
        ticket.mintForETH{value: PRICE}();
        vm.prank(buyer);
        ticket.mintForETH{value: PRICE}();

        // Le 4ème doit échouer
        vm.prank(buyer2);
        vm.expectRevert(TicketNFT.SoldOut.selector);
        ticket.mintForETH{value: PRICE}();
    }

    // mintForAddress par quelqu'un qui n'est pas owner
    function test_RevertIf_NotOwner_MintForAddress() public {
        vm.prank(buyer);
        vm.expectRevert();
        ticket.mintForAddress(buyer2);
    }

    // Withdraw : l'owner récupère les ETH
    function test_Withdraw() public {
        vm.prank(buyer);
        ticket.mintForETH{value: PRICE}();

        uint256 balanceBefore = owner.balance;

        vm.prank(owner);
        ticket.withdraw();

        assertEq(owner.balance, balanceBefore + PRICE);
        assertEq(address(ticket).balance, 0);
    }

    // Withdraw par quelqu'un qui n'est pas owner
    function test_RevertIf_NotOwner_Withdraw() public {
        vm.prank(buyer);
        ticket.mintForETH{value: PRICE}();

        vm.prank(buyer);
        vm.expectRevert();
        ticket.withdraw();
    }

    // remainingTickets décrémente bien
    function test_RemainingTickets() public {
        assertEq(ticket.remainingTickets(), MAX_SUPPLY);

        vm.prank(buyer);
        ticket.mintForETH{value: PRICE}();

        assertEq(ticket.remainingTickets(), MAX_SUPPLY - 1);
    }
}