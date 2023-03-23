import { ethers } from "hardhat";
import * as fs from "fs";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers/lib/utils";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.MAINNET_RPC
  );

  const inputs = [
    {
      address: "0x31D97fdb6E31955Ad79899Eb0D28F2d0431684A0",
      quantity: 1,
    },
    {
      address: "0xa3d008b205d97892fBf937D1fA2Fc5568dB2A254",
      quantity: 2,
    },
    {
      address: "0xC5cb2013586755CCeAE6229da853d6Ef96FB26AD",
      quantity: 1,
    },
  ];

  // const leaves = inputs.map((value) =>
  //   ethers.utils.keccak256(
  //     ethers.utils.defaultAbiCoder.encode(["uint256"], [value])
  //   )
  // );

  const leaves = inputs.map((value) =>
    ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [value.address, value.quantity]
    )
  );

  console.log(`your leaves are ${leaves}`);

  const tree = new MerkleTree(leaves, ethers.utils.keccak256);
  console.log(`your tree is ${tree}`);

  const root = tree.getHexRoot();
  console.log(`Your root is ${root}`);

  const proof = tree.getProof(leaves[0]);
  console.log(`Your proof is ${proof}`);

  const [owner] = await ethers.getSigners();
  const Token = await ethers.getContractFactory("FitamaBeautyClub");
  const token = await Token.deploy(root);
  await token.deployed();
  console.log(`Contract deployed to ${token.address}`);

  const treeData = {
    leaves: leaves.map((leaf) => leaf.toString()),
    root: root.toString(),
    depth: tree.getDepth(),
  };
  fs.writeFileSync("merkle-tree.json", JSON.stringify(treeData));
  fs.writeFileSync("merkle-proof.json", JSON.stringify(proof));

  const verify = tree.verify(proof, leaves[0], root);
  console.log(`verified ${verify}`);
  const prove = [
    224, 202, 49, 135, 67, 13, 87, 29, 170, 179, 98, 29, 139, 40, 6, 80, 110,
    246, 168, 79, 180, 195, 18, 220, 71, 34, 204, 132, 154, 1, 249, 184,
  ];
  token.mint(1, prove);
  // const conRoot =  contract.setRoot(root);

  // console.log(`contract root is ${conRoot}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
