
var express = require('express');
var Web3 = require('web3');
const keccak256 = require('keccak256')
const ethers = require('ethers')
const abi = require('./build/MerkleTree.json')
const Provider = require('@truffle/hdwallet-provider');

var app = express();
var port = process.env.PORT || 3000;

var SmartContractAddress = "0x847FB490b9255758738c1DBddD9E3049E9bC86c8";
var SmartContractABI = abi;
var ADDRESS = ""
var privatekey = "";
var RPC_URL = "";

function hashPair (h1,h2){
  if(!h1 || !h2) return ''
  const targetHashArray = h1<h2 ?[h1,h2]:[h2,h1]
  return keccak256(ethers.utils.solidityPack(['bytes32','bytes32'], targetHashArray)).toString('hex')
}

function add0x(hash){
  var str = hash
  if(!hash.startsWith('0x')){
    str = "0x" + str;
  }
  
  return str;
}


const getLevelLeaves = (hashes)=>{
  const jumpValue = 2;
  const nextLevelHash = [];

  for (let i =0; i< hashes.length; i++) {
    if (i % jumpValue === 0) {
      if(!!hashes[i+1]){
        const hResult = hashPair(hashes[i],hashes[i+1])
        nextLevelHash.push(add0x(hResult))
      }else{
        nextLevelHash.push(add0x(hashes[i]))
      }
    }
  }
  
  return nextLevelHash;
}
const sendData = async () => {

  console.log("in function");
  var provider = new Provider(privatekey, RPC_URL);
  var web3 = new Web3(provider);
  var myContract = new web3.eth.Contract(SmartContractABI, SmartContractAddress);

  var allHashes = [
      '0x760785a457f46af4582b62962c4d96be98c68df9619556fa20af3c286343bf81',
      '0x2098ddd01d6035049de112333af26442bb3009ea06b6df66fccfadf8adee9914',
      '0x4648dfc788d015b20cb30bd312820680fe7f126a5211202b924ea67fe8cc3cfe',
      '0xb592fdc51ce49d7670e27b3a500873a78d0f29b39d1f368cf73e7b38a6c206d7',
      '0xb3c8b2632ac575ad8f94d4adc98aeeba6f87ca0b01c85f2faac2271cf67787ca',
      '0x395655712d1d58a4a7e3f01fd78482cba8477f8cfbf7a08202477c1baa15a335',
      '0x777726d7bfa53f1c91ec1485ed098db792c3e326b98ece6bd9761a43315b7cf3'
  ]

  const L2Hashes = getLevelLeaves(allHashes)
  console.log('L2Hashes :', L2Hashes);

  const L3Hashes = getLevelLeaves(L2Hashes)
  console.log('L3Hashes :', L3Hashes);
 
  const root = getLevelLeaves(L3Hashes)
  console.log('root :', root);
  
  function getProof (targetHash) {
    const proofPath = [];
    const targetIndex = allHashes.indexOf(targetHash)
    
    const getPathPairHash = (targetIndex,hashes)=> {
      if(targetIndex===0) return add0x(hashes[1]);
      return add0x(
        hashes[ targetIndex % 2 === 0 ? targetIndex-1 : targetIndex+1]
      )
    }
    
    // L1
    proofPath.push(getPathPairHash(targetIndex,allHashes))

    const L2TargetLeave = add0x(getLevelLeaves([targetHash,proofPath[0]])[0])
    const L2PairLeave = getPathPairHash(L2Hashes.indexOf(L2TargetLeave),L2Hashes)
    proofPath.push(L2PairLeave)

    const L3TargetLeave = add0x(getLevelLeaves([L2TargetLeave,L2PairLeave])[0])
    const L3PairLeave =  getPathPairHash(L3Hashes.indexOf(L3TargetLeave),L3Hashes)
    proofPath.push(L3PairLeave)

    return proofPath
  }

  // proof ans 
  // '0x2098ddd01d6035049de112333af26442bb3009ea06b6df66fccfadf8adee9914',
  // '0xb4435d3d2bb4863bffe2dd7c4a217641efe9da99b177cef8693fe26910a2bf04',
  // '0x7c8d8e6486e95d2eaff942ec8eb9b732d53596cb06548b62ff4841438a25a5d4'
  const proof = getProof('0x760785a457f46af4582b62962c4d96be98c68df9619556fa20af3c286343bf81')
  try {
  const result = await myContract.methods.merkleProof(proof).send({
    from: ADDRESS
  });
  
  } catch (error) {
    console.log(error);
  }
}

sendData();

app.listen(port);
console.log('listening on', port);

