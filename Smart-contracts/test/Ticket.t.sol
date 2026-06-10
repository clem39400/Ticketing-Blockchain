// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/Ticket.sol";

contract TicketTest is Test {

    Ticket ticket;
    address owner   = address(1);
    address buyer   = address(2);
    address buyer2  = address(3);

    uint256 constant TOKEN_ID   = 0;
    uint256 constant PRICE      = 0.01 ether;
    uint256 constant MAX_SUPPLY = 10;
    string  constant URI        = "ipfs://QmTest";

    function setUp() public {
        vm.prank(owner);
        ticket = new Ticket("ipfs://");

        vm.prank(owner);
        ticket.createCategory(TOKEN_ID, PRICE, MAX_SUPPLY, URI);

        vm.deal(buyer,  10 ether);
        vm.deal(buyer2, 10 ether);
    }

    // ------------------------------------------------------------------
    // createCategory
    // ------------------------------------------------------------------

    function test_createCategory_ok() public view {
        (uint256 price, uint256 maxSupply, uint256 minted, string memory u) =
                            ticket.getCategory(TOKEN_ID);

        assertEq(price,     PRICE);
        assertEq(maxSupply, MAX_SUPPLY);
        assertEq(minted,    0);
        assertEq(u,         URI);
    }

    function test_createCategory_alreadyExists() public {
        vm.prank(owner);
        vm.expectRevert("Category already exists");
        ticket.createCategory(TOKEN_ID, PRICE, MAX_SUPPLY, URI);
    }

    function test_createCategory_zeroSupply() public {
        vm.prank(owner);
        vm.expectRevert("Max supply must be positive");
        ticket.createCategory(1, PRICE, 0, URI);
    }

    function test_createCategory_onlyOwner() public {
        vm.prank(buyer);
        vm.expectRevert();
        ticket.createCategory(99, PRICE, MAX_SUPPLY, URI);
    }

    // ------------------------------------------------------------------
    // buy
    // ------------------------------------------------------------------

    function test_buy_ok() public {
        vm.prank(buyer);
        ticket.buy{value: PRICE}(TOKEN_ID, 1);

        assertEq(ticket.balanceOf(buyer, TOKEN_ID), 1);
    }

    function test_buy_multipleQuantity() public {
        vm.prank(buyer);
        ticket.buy{value: PRICE * 3}(TOKEN_ID, 3);

        assertEq(ticket.balanceOf(buyer, TOKEN_ID), 3);
    }

    function test_buy_incorrectETH() public {
        vm.prank(buyer);
        vm.expectRevert("Incorrect ETH amount");
        ticket.buy{value: 0.005 ether}(TOKEN_ID, 1);
    }

    function test_buy_soldOut() public {
        vm.prank(buyer);
        ticket.buy{value: PRICE * MAX_SUPPLY}(TOKEN_ID, MAX_SUPPLY);

        vm.prank(buyer2);
        vm.expectRevert("Sold out");
        ticket.buy{value: PRICE}(TOKEN_ID, 1);
    }

    function test_buy_unknownCategory() public {
        vm.prank(buyer);
        vm.expectRevert("Unknown category");
        ticket.buy{value: PRICE}(999, 1);
    }

    function test_buy_ethStaysInContract() public {
        vm.prank(buyer);
        ticket.buy{value: PRICE * 2}(TOKEN_ID, 2);

        assertEq(address(ticket).balance, PRICE * 2);
    }

    // ------------------------------------------------------------------
    // mint
    // ------------------------------------------------------------------

    function test_mint_ok() public {
        vm.prank(owner);
        ticket.mint(buyer, TOKEN_ID, 2);

        assertEq(ticket.balanceOf(buyer, TOKEN_ID), 2);
    }

    function test_mint_soldOut() public {
        vm.prank(owner);
        ticket.mint(buyer, TOKEN_ID, MAX_SUPPLY);

        vm.prank(owner);
        vm.expectRevert("Sold out");
        ticket.mint(buyer2, TOKEN_ID, 1);
    }

    function test_mint_unknownCategory() public {
        vm.prank(owner);
        vm.expectRevert("Unknown category");
        ticket.mint(buyer, 999, 1);
    }

    function test_mint_onlyOwner() public {
        vm.prank(buyer);
        vm.expectRevert();
        ticket.mint(buyer, TOKEN_ID, 1);
    }

    // ------------------------------------------------------------------
    // withdraw
    // ------------------------------------------------------------------

    function test_withdraw_ok() public {
        vm.prank(buyer);
        ticket.buy{value: PRICE * 2}(TOKEN_ID, 2);

        uint256 balanceBefore = owner.balance;

        vm.prank(owner);
        ticket.withdraw();

        assertEq(owner.balance, balanceBefore + PRICE * 2);
        assertEq(address(ticket).balance, 0);
    }

    function test_withdraw_onlyOwner() public {
        vm.prank(buyer);
        vm.expectRevert();
        ticket.withdraw();
    }

    function test_withdraw_emptyBalance() public {
        uint256 balanceBefore = owner.balance;

        vm.prank(owner);
        ticket.withdraw();

        assertEq(owner.balance, balanceBefore);
    }

    // ------------------------------------------------------------------
    // ticketsOf
    // ------------------------------------------------------------------

    function test_ticketsOf_empty() public view {
        (uint256[] memory ids, uint256[] memory bals) = ticket.ticketsOf(buyer);

        assertEq(ids.length,  1);
        assertEq(bals.length, 1);
        assertEq(bals[0],     0);
    }

    function test_ticketsOf_afterBuy() public {
        vm.prank(owner);
        ticket.createCategory(1, 0.1 ether, 50, "ipfs://QmVIP");

        vm.prank(buyer);
        ticket.buy{value: PRICE}(TOKEN_ID, 1);

        vm.prank(buyer);
        ticket.buy{value: 0.1 ether * 2}(1, 2);

        (uint256[] memory ids, uint256[] memory bals) = ticket.ticketsOf(buyer);

        assertEq(ids.length,  2);
        assertEq(bals[0],     1);  // TOKEN_ID = 0 → 1 ticket
        assertEq(bals[1],     2);  // TOKEN_ID = 1 → 2 tickets
    }

    // ------------------------------------------------------------------
    // uri
    // ------------------------------------------------------------------

    function test_uri_ok() public view {
        assertEq(ticket.uri(TOKEN_ID), URI);
    }

    function test_uri_unknownCategory() public {
        vm.expectRevert("Unknown category");
        ticket.uri(999);
    }

    // ------------------------------------------------------------------
    // allTokenIds
    // ------------------------------------------------------------------

    function test_allTokenIds() public {
        vm.prank(owner);
        ticket.createCategory(1, 0.1 ether, 50, "ipfs://QmVIP");

        uint256[] memory ids = ticket.allTokenIds();

        assertEq(ids.length, 2);
        assertEq(ids[0], 0);
        assertEq(ids[1], 1);
    }
}