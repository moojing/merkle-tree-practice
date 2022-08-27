
var solc = require('solc');
var fs = require('fs-extra');
var path = require('path');

var input = {
  language: 'Solidity',
  sources: {
    'MerkleTree.sol': {
      content: fs.readFileSync(path.resolve(__dirname, 'MerkleTree.sol'), 'utf8')
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};


/**
 * Writes the contracts from the compiled sources into JSON files, which you will later be able to
 * use in combination with web3.
 * @param compiled - Object containing the compiled contracts.
 * @param buildPath - Path of the build folder.
 */
 function writeOutput(compiled, buildPath) {
  fs.ensureDirSync(buildPath);

  for (let contractFileName in compiled.contracts) {
      const contractName = contractFileName.replace('.sol', '');
      console.log('Writing: ', contractName + '.json');
      fs.outputJsonSync(
          path.resolve(buildPath, contractName + '.json'),
          compiled.contracts[contractFileName][contractName].abi
      );
  }
}

function compilingPreperations() {
  const buildPath = path.resolve(__dirname, 'build');
  return buildPath;
}


var output = JSON.parse(solc.compile(JSON.stringify(input)));
console.log('output :', output);

writeOutput(output, compilingPreperations())


