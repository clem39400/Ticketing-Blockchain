// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Un contrat par événement.
 * Chaque tokenId représente une catégorie de ticket (0 = Entrée, 1 = VIP, …).
 */
contract Ticket is ERC1155, Ownable {

    struct Category {
        uint256 price;       // prix en wei
        uint256 maxSupply;   // stock maximum
        uint256 minted;      // nombre déjà minté
        string  uri;         // ipfs://… propre à cette catégorie
    }

    /// tokenId → Category
    mapping(uint256 => Category) private _categories;
    /// liste des tokenIds enregistrés (pour pouvoir itérer)
    uint256[] private _tokenIds;

    // ------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------

    event CategoryCreated(uint256 indexed tokenId, uint256 price, uint256 maxSupply);
    event TicketsBought(uint256 indexed tokenId, address indexed buyer, uint256 quantity);
    event TicketsMinted(uint256 indexed tokenId, address indexed to,  uint256 quantity);

    // ------------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------------

    /**
     * @param baseURI_  URI de fallback (peut être vide "").
     *                  Chaque catégorie surcharge avec son propre URI.
     */
    constructor(string memory baseURI_) ERC1155(baseURI_) Ownable(msg.sender) {}

    // ------------------------------------------------------------------
    // EXERCISE 1 — Créer une catégorie
    //
    // Enregistre un nouveau tokenId avec son prix, son stock max et son URI.
    //  - revert "Category already exists" si le tokenId est déjà enregistré
    //  - revert "Max supply must be positive" si maxSupply_ == 0
    //  - émet CategoryCreated
    // ------------------------------------------------------------------

    function createCategory(
        uint256 tokenId,
        uint256 price_,
        uint256 maxSupply_,
        string  calldata uri_
    ) external onlyOwner {
        require(_categories[tokenId].maxSupply == 0, "Category already exists");
        require(maxSupply_ > 0, "Max supply must be positive");

        _categories[tokenId] = Category({
            price:     price_,
            maxSupply: maxSupply_,
            minted:    0,
            uri:       uri_
        });
        _tokenIds.push(tokenId);

        emit CategoryCreated(tokenId, price_, maxSupply_);
    }

    // ------------------------------------------------------------------
    // EXERCISE 2 — Achat public
    //
    // N'importe qui peut acheter `quantity` tickets de la catégorie `tokenId`
    // en payant exactement `quantity × price` wei.
    //  - revert "Unknown category"      si le tokenId n'existe pas
    //  - revert "Incorrect ETH amount"  si msg.value incorrect
    //  - revert "Sold out"              si le stock est dépassé
    //  - émet TicketsBought
    // ------------------------------------------------------------------

    function buy(uint256 tokenId, uint256 quantity)
    external
    payable
    {
        Category storage cat = _categories[tokenId];
        require(cat.maxSupply > 0,                          "Unknown category");
        require(msg.value == quantity * cat.price,          "Incorrect ETH amount");
        require(cat.minted + quantity <= cat.maxSupply,     "Sold out");

        cat.minted += quantity;
        _mint(msg.sender, tokenId, quantity, "");

        emit TicketsBought(tokenId, msg.sender, quantity);
    }

    // ------------------------------------------------------------------
    // EXERCISE 3 — Mint plateforme (paiement carte)
    //
    // Le owner (la plateforme) peut minter `quantity` tickets d'une catégorie
    // vers n'importe quelle adresse, sans ETH (après paiement carte off-chain).
    //  - revert "Unknown category" si le tokenId n'existe pas
    //  - revert "Sold out"         si le stock est dépassé
    //  - émet TicketsMinted
    // ------------------------------------------------------------------

    function mint(address to, uint256 tokenId, uint256 quantity)
    external
    onlyOwner
    {
        Category storage cat = _categories[tokenId];
        require(cat.maxSupply > 0,                      "Unknown category");
        require(cat.minted + quantity <= cat.maxSupply, "Sold out");

        cat.minted += quantity;
        _mint(to, tokenId, quantity, "");

        emit TicketsMinted(tokenId, to, quantity);
    }

    // ------------------------------------------------------------------
    // EXERCISE 4 — Withdraw
    //
    // Envoie tout l'ETH du contrat au owner.
    //  - revert "Withdraw failed" si le transfert échoue
    // ------------------------------------------------------------------

    function withdraw() external onlyOwner {
        (bool ok, ) = payable(owner()).call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }

    // ------------------------------------------------------------------
    // EXERCISE 5 — Tickets d'une adresse
    //
    // Retourne les balances de toutes les catégories pour `account`.
    // Utilise balanceOfBatch : un seul appel pour tous les tokenIds connus.
    // ------------------------------------------------------------------

    function ticketsOf(address account)
    external
    view
    returns (uint256[] memory tokenIds, uint256[] memory balances)
    {
        uint256 len = _tokenIds.length;
        tokenIds = _tokenIds;

        address[] memory accounts = new address[](len);
        for (uint256 i = 0; i < len; i++) {
            accounts[i] = account;
        }

        balances = balanceOfBatch(accounts, tokenIds);
    }

    // ------------------------------------------------------------------
    // EXERCISE 6 — URI par catégorie
    //
    // ERC1155 standard : surcharge uri() pour retourner l'URI
    // propre à chaque tokenId (stocké dans la Category).
    // ------------------------------------------------------------------

    function uri(uint256 tokenId)
    public
    view
    override
    returns (string memory)
    {
        require(_categories[tokenId].maxSupply > 0, "Unknown category");
        return _categories[tokenId].uri;
    }

    // ------------------------------------------------------------------
    // Getters
    // ------------------------------------------------------------------

    function getCategory(uint256 tokenId)
    external
    view
    returns (uint256 price, uint256 maxSupply, uint256 minted, string memory uri_)
    {
        Category storage cat = _categories[tokenId];
        require(cat.maxSupply > 0, "Unknown category");
        return (cat.price, cat.maxSupply, cat.minted, cat.uri);
    }

    function allTokenIds() external view returns (uint256[] memory) {
        return _tokenIds;
    }
}