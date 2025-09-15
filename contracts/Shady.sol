// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {LSP8IdentifiableDigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {_LSP4_TOKEN_TYPE_TOKEN, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_METADATA_KEY} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./counters.sol";

contract Shady is LSP8IdentifiableDigitalAsset("Shady", "SHA", msg.sender, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_TOKEN_TYPE_TOKEN) {
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;
    
    uint256 public constant MAXSUPPLY = 3333;
    uint256 public mintPrice = 1 ether;
    string failedMessage = "Failed to send Ether!";

    event MintPriceUpdated(uint256 price, address owner);
    error InsufficientBalance(uint256);


    constructor() {}

    function updateMintPrice(uint256 amount) public onlyOwner {
        mintPrice = amount;
        emit MintPriceUpdated(amount, msg.sender);
    }

    function getMetadata(string memory metadata) public pure returns (bytes memory) {
        bytes memory verfiableURI = bytes.concat(hex"00006f357c6a0020", keccak256(bytes(metadata)), abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(metadata))));
        return verfiableURI;
    }

    function mintShady(string memory metadata) public payable returns (bool) {
        require(MAXSUPPLY > totalSupply(), "Max supply exceeded.");

        if (mintPrice > 0) {
            if (msg.value < mintPrice) revert InsufficientBalance(msg.value);
        }

        _tokenIdCounter.increment();
        bytes32 newTokenId = bytes32(_tokenIdCounter.current());
        _mint({to: msg.sender, tokenId: newTokenId, force: true, data: ""});

        _setDataForTokenId(newTokenId, _LSP4_METADATA_KEY, getMetadata(metadata));

        return true;
    }

    function transferBalance(address payable _to, uint256 _amount) public onlyOwner {
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed");
    }
}
