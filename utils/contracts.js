var DefaultPassword = 'foobar123';

function unlockAccount(addr) {
  personal.unlockAccount(addr, DefaultPassword);
}

function padGas(estimatedGas) {
  return Math.floor(1.2 * estimatedGas);
}

function deployAndWatch(addr, contract, args, value) {
  unlockAccount(addr);

  var ethContract = eth.contract(contract.abi);

  var deployTxn = args || [];
  var metadata = { from: addr, data: contract.bin };
  if (value) {
    metadata.value = value;
  }

  deployTxn.push(metadata);

  var contractData = ethContract.new.getData.apply(ethContract, deployTxn);
  metadata.gas = padGas( eth.estimateGas({ data: contractData }) );

  inspect('Deploying contract with data:', deployTxn);
  var contractInstance = ethContract.new.apply(ethContract, deployTxn);

  // var deployTxn = { from: addr, data: contract.bin };
  // deployTxn.gas = padGas( eth.estimateGas(deployTxn) );
  //
  // var contractInstance = ethContract.new(deployTxn);

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
  metadata.gas = padGas( estimatedGas );

  inspect("Calling with", callArgs);

  return deployedContract[method].sendTransaction.apply(this, callArgs);
}
