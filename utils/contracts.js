var DefaultPassword = 'foobar123';

function unlockAccount(addr) {
  personal.unlockAccount(addr, DefaultPassword);
}

function padGas(estimatedGas) {
  return Math.floor(1.2 * estimatedGas);
}

function deployAndWatch(addr, contract) {
  unlockAccount(addr);

  var deployTxn = { from: addr, data: contract.bin };
  deployTxn.gas = padGas( eth.estimateGas(deployTxn) );

  var ethContract = eth.contract(contract.abi);
  var contractInstance = ethContract.new(deployTxn);

  var receipt = eth.getTransactionReceipt(contractInstance.transactionHash);
  while (receipt === null) {
    admin.sleep(1);
    receipt = eth.getTransactionReceipt(contractInstance.transactionHash);
  }

  inspect('Contract Deployed to: ' + receipt.contractAddress);

  var deployedContract = ethContract.at(receipt.contractAddress);
  deployedContract.allEvents().watch(function(error, evt) {
    var header = '[' + receipt.contractAddress + '] ';
    if (error) {
      inspect(header + 'Error Detected:', error);
    } else {
      inspect(header + 'Event emitted:', evt);
    }
  });

  return receipt;
}

function contractAt(addr, contract) {
  var ethContract = eth.contract(contract.abi);

  return ethContract.at(addr);
}

function callContract(identity, deployedContract, method, args) {
  unlockAccount(identity);

  var metadata = { from: identity };
  var callArgs = args.slice();
  callArgs.push(metadata);

  var estimatedGas = deployedContract[method].estimateGas.apply(this, callArgs);

  inspect('Estimated Gas: ' + estimatedGas);

  metadata.gas = padGas( estimatedGas );
  callArgs.pop();
  callArgs.push(metadata);

  inspect("Calling with", callArgs);

  return deployedContract[method].sendTransaction.apply(this, callArgs);
}
