# Backend environment additions for Admin BWT control

Add these values to the existing `backend/.env` file. Do not place either value in `NEXT_PUBLIC_*` variables or commit the file.

```env
# Must exactly match the email of the BlockWallet user who may open /admin
ADMIN_EMAIL=admin@example.com

# Testnet-only deployer signing key: 0x followed by exactly 64 hex characters
DEPLOYER_PRIVATE_KEY=0x...
```

`DEPLOYER_PRIVATE_KEY` must be the same Sepolia account that deployed BWT (and therefore received the initial supply). It requires Sepolia ETH for gas. The API validates both values at startup and never returns the private key to a client.
