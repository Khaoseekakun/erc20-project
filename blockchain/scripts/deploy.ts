import { ethers, network } from "hardhat";
async function main() {
  if (network.config.chainId !== 11155111)
    throw new Error("Deployment is restricted to Sepolia (chain ID 11155111).");
  const [deployer] = await ethers.getSigners();
  const token = await ethers.deployContract("BlockWalletToken");
  await token.waitForDeployment();
  const tx = token.deploymentTransaction();
  console.log(
    `\n========================================\nERC BlockWallet Token Deployment Complete\n========================================\nNetwork: Sepolia\nChain ID: 11155111\nToken Name: ERC BlockWallet Token\nToken Symbol: ERCBWT\nContract Address: ${await token.getAddress()}\nDeployer Address: ${deployer.address}\nTransaction Hash: ${tx?.hash}\n========================================`,
  );
}
main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Deployment failed");
  process.exitCode = 1;
});
