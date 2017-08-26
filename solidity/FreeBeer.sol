pragma solidity ^0.4.16;

contract FreeBeer {
  event MoneySent(address sender, address recipient, uint256 amount);

  address recipient;

  function FreeBeer() {
    recipient = msg.sender;
  }

  function send_amount(address sender, address dest, uint256 amount) private returns (bool) {
    if (dest.send(amount)) {
      MoneySent(sender, dest, amount);
      return true;
    }

    return false;
  }

  function gimme_money() payable {
    send_amount(msg.sender, recipient, msg.value);
  }

  function () payable {
    send_amount(msg.sender, recipient, msg.value);
  }
}
