// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, Ownable {
    uint256 public ticketPrice;
    uint256 public maxSupply;
    uint256 public totalMinted;
    string public eventName;
    string private _baseTokenURI;

    // tokenId => ticket metadata URI (IPFS)
    mapping(uint256 => string) private _tokenURIs;

    error SoldOut();
    error IncorrectPrice(uint256 sent, uint256 required);
    error WithdrawFailed();

    constructor(
        string memory _eventName,
        string memory _symbol,
        uint256 _ticketPrice,
        uint256 _maxSupply,
        string memory baseURI,
        address _owner
    ) ERC721(_eventName, _symbol) Ownable(_owner) {
        eventName = _eventName;
        ticketPrice = _ticketPrice;
        maxSupply = _maxSupply;
        _baseTokenURI = baseURI;
    }

    /// @notice Achat direct on-chain (paiement en ETH)
    function mintForETH() external payable returns (uint256) {
        if (totalMinted >= maxSupply) revert SoldOut();
        if (msg.value != ticketPrice) revert IncorrectPrice(msg.value, ticketPrice);

        uint256 tokenId = totalMinted + 1;
        totalMinted++;
        _safeMint(msg.sender, tokenId);
        return tokenId;
    }

    /// @notice Mint par l'API après paiement en euros (owner only)
    function mintForAddress(address to) external onlyOwner returns (uint256) {
        if (totalMinted >= maxSupply) revert SoldOut();

        uint256 tokenId = totalMinted + 1;
        totalMinted++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    /// @notice Le vendeur récupère les ETH collectés
    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        if (!success) revert WithdrawFailed();
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function remainingTickets() external view returns (uint256) {
        return maxSupply - totalMinted;
    }
}