// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicket1155 is ERC1155, Ownable {

    // --- Structures ---

    struct TicketCategory {
        string name;
        uint256 price;       // en wei
        uint256 maxSupply;
        uint256 totalMinted;
        string metadataURI;  // URI IPFS pour cette catégorie
        bool exists;
    }

    // --- Storage ---

    string public eventName;
    uint256 public nextTokenId;   // commence à 1, auto-incrémenté

    mapping(uint256 => TicketCategory) public categories;

    // --- Errors ---

    error CategoryNotFound(uint256 tokenId);
    error SoldOut(uint256 tokenId);
    error IncorrectPrice(uint256 tokenId, uint256 sent, uint256 required);
    error WithdrawFailed();

    // --- Events ---

    event CategoryCreated(uint256 indexed tokenId, string name, uint256 price, uint256 maxSupply);
    event TicketMinted(uint256 indexed tokenId, address indexed buyer, bool onChain);

    // --- Constructor ---

    constructor(
        string memory _eventName,
        address _owner
    ) ERC1155("") Ownable(_owner) {
        eventName = _eventName;
        nextTokenId = 1;
    }

    // --- Owner: gestion des catégories ---

    /// @notice Crée une nouvelle catégorie de ticket (appelé par l'API lors du déploiement ou après)
    function createCategory(
        string calldata name,
        uint256 price,
        uint256 maxSupply,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextTokenId++;
        categories[tokenId] = TicketCategory({
            name: name,
            price: price,
            maxSupply: maxSupply,
            totalMinted: 0,
            metadataURI: metadataURI,
            exists: true
        });
        emit CategoryCreated(tokenId, name, price, maxSupply);
    }

    // --- Mint on-chain (acheteur paie en ETH via MetaMask) ---

    function mintForETH(uint256 tokenId) external payable returns (uint256) {
        TicketCategory storage cat = _getCategory(tokenId);
        if (cat.totalMinted >= cat.maxSupply) revert SoldOut(tokenId);
        if (msg.value != cat.price) revert IncorrectPrice(tokenId, msg.value, cat.price);

        cat.totalMinted++;
        _mint(msg.sender, tokenId, 1, "");
        emit TicketMinted(tokenId, msg.sender, true);
        return tokenId;
    }

    // --- Mint off-chain (API mint après paiement euros) ---

    function mintForAddress(uint256 tokenId, address to) external onlyOwner {
        TicketCategory storage cat = _getCategory(tokenId);
        if (cat.totalMinted >= cat.maxSupply) revert SoldOut(tokenId);

        cat.totalMinted++;
        _mint(to, tokenId, 1, "");
        emit TicketMinted(tokenId, to, false);
    }

    // --- Withdraw ---

    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        if (!success) revert WithdrawFailed();
    }

    // --- Views ---

    /// @notice Renvoie l'URI IPFS d'une catégorie (utilisé par les marketplaces)
    function uri(uint256 tokenId) public view override returns (string memory) {
        if (!categories[tokenId].exists) revert CategoryNotFound(tokenId);
        return categories[tokenId].metadataURI;
    }

    function remainingTickets(uint256 tokenId) external view returns (uint256) {
        TicketCategory storage cat = _getCategory(tokenId);
        return cat.maxSupply - cat.totalMinted;
    }

    function getCategoryCount() external view returns (uint256) {
        return nextTokenId - 1;
    }

    // --- Internal ---

    function _getCategory(uint256 tokenId) internal view returns (TicketCategory storage) {
        if (!categories[tokenId].exists) revert CategoryNotFound(tokenId);
        return categories[tokenId];
    }
}