// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
contract BlockWalletToken is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1_000_000;
    constructor() ERC20("ERC BlockWallet Token", "ERCBWT") {
        _mint(msg.sender, INITIAL_SUPPLY * 10 ** decimals());
    }
}
