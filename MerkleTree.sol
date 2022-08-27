// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

contract MerkleTree {
    bytes32[] public hashes;
    bytes32 root;

    constructor(bytes32 _root) {
        root = _root;

        string[7] memory txx = [
            "zkpenguin",
            "zkpancake",
            "zkpolice",
            "zkpig",
            "zkplayground",
            "zkpigeon",
            "zkpoison"
        ];

        for (uint256 i = 0; i < txx.length; i++) {
            hashes.push(keccak256(abi.encodePacked(txx[i])));
        }
    }

    function merkleProof(bytes32[] memory proof) public view {
        // require(opening, "Exceed the Deadline!");
        bytes32 leaf = keccak256(abi.encodePacked("zkplayground"));
        require(verify(proof, root, leaf), "Your proof is incorrect!");
        // score[msg.sender].problem4 = true;
    }

    function verify(
        bytes32[] memory proof,
        bytes32 _root,
        bytes32 leaf
    ) internal pure returns (bool) {
        return processProof(proof, leaf) == _root;
    }

    function processProof(bytes32[] memory proof, bytes32 leaf)
        internal
        pure
        returns (bytes32)
    {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            computedHash = _hashPair(computedHash, proof[i]);
        }
        return computedHash;
    }

    function _hashPair(bytes32 a, bytes32 b) private pure returns (bytes32) {
        return a < b ? _efficientHash(a, b) : _efficientHash(b, a);
    }

    function _efficientHash(bytes32 a, bytes32 b)
        private
        pure
        returns (bytes32 value)
    {
        assembly {
            mstore(0x00, a)
            mstore(0x20, b)
            value := keccak256(0x00, 0x40)
        }
    }
}
