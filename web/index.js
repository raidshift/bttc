let newDeposit;
const MERKLE_TREE_HEIGHT = 20;
let circuit;
let proving_key;
let groth16;

let token = null;
let stable = null;
let raidshift = null;
let verifier = null;

let tronGridFeedInterval = null;

let balanceToken = null;
let allowanceToken = null;

const DECIMALS_6 = 6;
const DECIMALS_2 = 2;
const DECIMALS_0 = 0;

// Ethereum
let web3;

const TOKEN_ABI = [
  // balanceOf
  { constant: true, inputs: [{ name: "owner", type: "address" }], name: "balanceOf", outputs: [{ name: "balance", type: "uint256" }], type: "function" },
  // allowance
  {
    constant: true,
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "allowance", type: "uint256" }],
    type: "function",
  },
  // approve
  {
    constant: false,
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "approved", type: "bool" }],
    type: "function",
  },
];

const RS_ABI = [
  // isKnownRoot
  {
    inputs: [
      {
        name: "root",
        type: "bytes32",
      },
    ],
    name: "isKnownRoot",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    type: "function",
  },
  // isSpent
  {
    inputs: [
      {
        name: "nullifierHash",
        type: "bytes32",
      },
    ],
    name: "isSpent",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    type: "function",
  },
  // deposit
  { constant: false, inputs: [{ name: "commitment", type: "bytes32" }], name: "deposit", outputs: [], type: "function" },
  // event deposit
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "commitment",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint32",
        name: "leafIndex",
        type: "uint32",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  // event Withdrawal
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "nullifierHash",
        type: "bytes32",
      },
    ],
    name: "Withdrawal",
    type: "event",
  },
  // withdraw
  {
    inputs: [
      {
        name: "_proof",
        type: "bytes",
      },
      {
        name: "_root",
        type: "bytes32",
      },
      {
        name: "_nullifierHash",
        type: "bytes32",
      },
      {
        name: "_recipient",
        type: "address",
      },
      {
        name: "_relayer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_fee",
        type: "uint256",
      },
      {
        name: "_refund",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const VERIFIER_ABI = [
  {
    inputs: [
      {
        name: "proof",
        type: "bytes",
      },
      {
        name: "input",
        type: "uint256[6]",
      },
    ],
    name: "verifyProof",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    type: "function",
  },
];

let CHAIN_ID;
let CHAIN_NAME;
let CHAIN_RPC_URL;
let BTTSCAN_URL_PREFIX;
let CONTRACT_VERIFIER;
let CONTRACT_TOKEN;

let CONTRACT_1;
let CONTRACT_10;
let CONTRACT_100;
let CONTRACT_1K;
let CONTRACT_10K;
let CONTRACT_100K;

let DECIMALS_TOKEN;
let NAME_TOKEN;
let RS_USD = "RS_USDD";

// BTTC TEST

if ($("istest").text() == "1") {
  DECIMALS_TOKEN = 6;
  NAME_TOKEN = "USDT_t";
  $("#swap_from_img").prop("src", "USDT_128.png");
  CHAIN_ID = 1029;
  CHAIN_NAME = "Bittorrent Chain (Test)";
  CHAIN_RPC_URL = "https://pre-rpc.bt.io/";
  BTTSCAN_URL_PREFIX = "https://testnet.bttcscan.com";
  CONTRACT_VERIFIER = "0xB04627e863601Aa9283684aAda0B437B4A5C0f73";
  CONTRACT_TOKEN = "0x7b906030735435422675e0679bc02dae7dfc71da";
  CONTRACT_1 = "0x39a95b5bbb52F1C52B863c78aF774950D9C7C645";
  CONTRACT_10 = "0xB9CBEf6e3CC883EF83C7F769bD479F479eC4BB58";
  CONTRACT_100 = "0xD8ad88AC0496dc514DaAbad7ccF68190BC54AaA2";
  CONTRACT_1K = "0x0487745cCe1125875666FbAB3e6984507FbB41B8";
  CONTRACT_10K = "0xD896bb043C8364fC2D165436efBD2764d518602e";
  CONTRACT_100K = "0x60330aEF4216cB1Fe0843e35c3F62E386c9A9B42";
  $(".rs_link").attr("href", "/");
  $(".rs_link").html(`<i class="bi bi-boxes"></i>&nbsp;Main Net`);

  $(".contractRSCodeURL").prop("href", `${BTTSCAN_URL_PREFIX}/address/${CONTRACT_10}#code`);
  $(".contractTokenURL").prop("href", `${BTTSCAN_URL_PREFIX}/token/${CONTRACT_TOKEN}#code`);
}

//BTTC PROD
if ($("istest").text() == "0") {
  DECIMALS_TOKEN = 18;
  NAME_TOKEN = "USDD_t";
  $("#swap_from_img").prop("src", "USDD.png");
  CHAIN_ID = 199;
  CHAIN_NAME = "Bittorrent Chain";
  CHAIN_RPC_URL = "https://rpc.bt.io";
  BTTSCAN_URL_PREFIX = "https://bttcscan.com";
  CONTRACT_VERIFIER = "0x4D20beC03dCDA796E66cc4D9DCCE7c710B68471C";
  CONTRACT_TOKEN = "0x17F235FD5974318E4E2a5e37919a209f7c37A6d1";
  CONTRACT_1 = "0xB04627e863601Aa9283684aAda0B437B4A5C0f73";
  CONTRACT_10 = "0x315CAF38e98E53eE0D8A5F69056CA4688D8d6730";
  CONTRACT_100 = "0x01fb366A3b3d1281A243c798B2Fb9Cc43B2F3985";
  CONTRACT_1K = "0x86E77Da8AE959B7f4fc23d67Df1eF28d634b0B26";
  CONTRACT_10K = "0xBa64d8e4fc336680D8C06EB78e3E4E1779C0B77b";
  CONTRACT_100K = "0x618d8FCb77F0bA854343beE93179292aac0B4cD5";
  $(".rs_link").attr("href", "/test");
  $(".rs_link").html(`<i class="bi bi-boxes"></i>&nbsp;Test Net`);

  $(".contractRSCodeURL").prop("href", `${BTTSCAN_URL_PREFIX}/address/${CONTRACT_10}#code`);
  $(".contractTokenURL").prop("href", `${BTTSCAN_URL_PREFIX}/token/${CONTRACT_TOKEN}#code`);
}

const CHAIN_SYMBOL = "BTT";

const RS_USDT_TRON_1 = RS_USD + "_TRON_1";
const RS_USDT_TRON_10 = RS_USD + "_TRON_10";
const RS_USDT_TRON_100 = RS_USD + "_TRON_100";
const RS_USDT_TRON_1K = RS_USD + "_TRON_1K";
const RS_USDT_TRON_10K = RS_USD + "_TRON_10K";
const RS_USDT_TRON_100K = RS_USD + "_TRON_100K";

let currentAccount;
let currentRSAddress;
let currentDepositStr;
let d_amount;

let feedInterval = null;

const TRANSACTION_URL = BTTSCAN_URL_PREFIX + "/tx/";

cropZerosRegEx = /(\.[0-9]*[1-9])0+$|\.0*$/;

function shortenString(str,by,start,sep) {
  if(!by) {by=5}
  if(!start) {start=0}
  if(!sep) {sep="..."}
  let short = str;
  return short.substr(start, by) + sep + short.substr(short.length - by, short.length);
}

function valueMoveCommaLeft(value, decimals) {
  return BigNumber(value).div(10 ** decimals);
}

function adjustDecimals(strPrice) {
  let decimals;
  let bn = BigNumber(strPrice);

  if (bn.isLessThan(1)) {
    decimals = DECIMALS_6;
  } else if (bn.isLessThan(10000)) {
    decimals = DECIMALS_2;
  } else {
    decimals = DECIMALS_0;
  }
  return bn.toFixed(decimals).replace(cropZerosRegEx, "$1");
}

function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function noteToClipBoard() {
  var copyText = document.getElementById("deposit_note");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
}

function setDeposit(depositStr) {
  $(".numDeposits").html(`<div class="spinner-grow spinner-border-xxs" role="status"><span class="visually-hidden">Loading...</span></div><span>&nbsp;Deposits&nbsp;|&nbsp;</span>`);
  $(".numWithdrawals").html(`<div class="spinner-grow spinner-border-xxs" role="status"><span class="visually-hidden">Loading...</span></div><span>&nbsp;Withdrawals</span>`);
  $(".latestDeposits").html(`<span class="fw-bold">Latest deposits:</span><br><div class="spinner-grow spinner-border-xxs" role="status"><span class="visually-hidden">Loading...</span></div>`);
  $(".latestWithdrawals").html(`<span class="fw-bold">Latest withdrawals:</span><br><div class="spinner-grow spinner-border-xxs" role="status"><span class="visually-hidden">Loading...</span></div>`);
  switch (depositStr) {
    case RS_USDT_TRON_1:
      currentRSAddress = CONTRACT_1;
      d_amount = 1 * 10 ** DECIMALS_TOKEN;
      break;
    case RS_USDT_TRON_10:
      currentRSAddress = CONTRACT_10;
      d_amount = 10 * 10 ** DECIMALS_TOKEN;
      break;
    case RS_USDT_TRON_100:
      currentRSAddress = CONTRACT_100;
      d_amount = 100 * 10 ** DECIMALS_TOKEN;
      break;
    case RS_USDT_TRON_1K:
      currentRSAddress = CONTRACT_1K;
      d_amount = 1000 * 10 ** DECIMALS_TOKEN;
      break;
    case RS_USDT_TRON_10K:
      currentRSAddress = CONTRACT_10K;
      d_amount = 10000 * 10 ** DECIMALS_TOKEN;
      break;
    case RS_USDT_TRON_100K:
      currentRSAddress = CONTRACT_100K;
      d_amount = 100000 * 10 ** DECIMALS_TOKEN;
      break;
    default:
      throw "Invalid Deposit Contract";
  }
  currentDepositStr = depositStr;
  resetDepositNote(currentDepositStr);

  $(".d_amount").text(`${numberWithCommas(BigNumber(d_amount).div(10 ** DECIMALS_TOKEN))} ${NAME_TOKEN}`);

  $(".d_validationMsg").html("");
  $(".d_validationMsg2").html("");
  $(".w_validationMsg").html("");

  $(".contractRSCodeURL").prop("href", `${BTTSCAN_URL_PREFIX}/address/${currentRSAddress}#code`);

  raidshift = new web3.eth.Contract(RS_ABI, currentRSAddress);

  readBalanceAndAllowance();
}

async function readBalanceAndAllowance() {
  try {
    const depositEvents = await raidshift.getPastEvents("Deposit", { fromBlock: 0, toBlock: "latest" });
    await new Promise((r) => setTimeout(r, 100));
    const withdrawalEvents = await raidshift.getPastEvents("Withdrawal", { fromBlock: 0, toBlock: "latest" });
    await new Promise((r) => setTimeout(r, 100));
    await token.methods
      .balanceOf(currentAccount)
      .call({ from: currentAccount })
      .then(function (result) {
        balanceToken = result;
      });

    await new Promise((r) => setTimeout(r, 100));
    await token.methods
      .allowance(currentAccount, currentRSAddress)
      .call({ from: currentAccount })
      .then(function (result) {
        allowanceToken = result;
      });

    $(".balanceToken").text(numberWithCommas(valueMoveCommaLeft(balanceToken, DECIMALS_TOKEN).toFixed(DECIMALS_2).replace(cropZerosRegEx, "$1")));
    $(".numDeposits").html(`<span>${depositEvents.length}&nbsp;Deposits&nbsp;|&nbsp;</span>`);
    $(".numWithdrawals").html(`<span>${withdrawalEvents.length}&nbsp;Withdrawals</span>`);

    let now = Date.now();

    latestDepositEvents = depositEvents.slice(-5).reverse();
    latestWithdrawalEvents = withdrawalEvents.slice(-5).reverse();

    let latestDepositsHTML = `<span class="fw-bold">Latest deposits:</span><span>`
    let latestWithdrawalsHTML = `<span class="fw-bold">Latest withdrawals:</span><span>`

    for (const event of latestDepositEvents) {
      let shortTransactionHash = event.transactionHash.substr(0,6)+"..";
      let a = `<a class="link-light" href="${BTTSCAN_URL_PREFIX}/tx/${event.transactionHash}" target="_blank">`

      let delta = now - (await web3.eth.getBlock(event.blockNumber)).timestamp * 1000;
      let days = Math.floor(delta / (1000 * 3600 * 24));
      let hours = Math.floor(delta / (1000 * 3600));
      let minutes = Math.floor(delta / (1000 * 60));
      let s = ""
      if (days > 0) {
        if (days != 1) { s = "s" }
        latestDepositsHTML = latestDepositsHTML.concat(`<br>${a}${shortTransactionHash}</a> ${days} day${s} ago`)
      }
      else if (hours > 0) {
        if (hours != 1) { s = "s" }
        latestDepositsHTML = latestDepositsHTML.concat(`<br>${a}${shortTransactionHash}</a> ${hours} hour${s} ago`)
      }
      else {
        if (minutes != 1) { s = "s" }
        latestDepositsHTML = latestDepositsHTML.concat(`<br>${a}${shortTransactionHash}</a> ${minutes} minute${s} ago`)
      }
    }
    if (latestDepositEvents.length == 0) {
      latestDepositsHTML = latestDepositsHTML.concat(`<br>none`);
    }
    latestDepositsHTML = latestDepositsHTML.concat(`</span>`);

    for (const event of latestWithdrawalEvents) {
      let shortTransactionHash = event.transactionHash.substr(0,6)+"..";
      let a = `<a class="link-light" href="${BTTSCAN_URL_PREFIX}/tx/${event.transactionHash}" target="_blank">`

      let delta = now - (await web3.eth.getBlock(event.blockNumber)).timestamp * 1000;
      let days = Math.floor(delta / (1000 * 3600 * 24));
      let hours = Math.floor(delta / (1000 * 3600));
      let minutes = Math.floor(delta / (1000 * 60));
      let s = ""
      if (days > 0) {
        if (days != 1) { s = "s" }
        latestWithdrawalsHTML = latestWithdrawalsHTML.concat(`<br>${a}${shortTransactionHash}</a> ${days} day${s} ago`)
      }
      else if (hours > 0) {
        if (hours != 1) { s = "s" }
        latestWithdrawalsHTML = latestWithdrawalsHTML.concat(`<br>${a}${shortTransactionHash}</a> ${hours} hour${s} ago`)
      }
      else {
        if (minutes != 1) { s = "s" }
        latestWithdrawalsHTML = latestWithdrawalsHTML.concat(`<br>${a}${shortTransactionHash}</a> ${minutes} minute${s} ago`)
      }
    }
    if (latestDepositEvents.length == 0) {
      latestWithdrawalsHTML = latestWithdrawalsHTML.concat(`<br>none`);
    }
    latestWithdrawalsHTML = latestWithdrawalsHTML.concat(`</span>`);

    $(".latestDeposits").html(latestDepositsHTML);
    $(".latestWithdrawals").html(latestWithdrawalsHTML);

  } catch (err) {
    console.log("readBalanceAndAllowance: " + err);
    throw err;
  }
}

async function startFeed() {
  try {
    if (feedInterval == null) {
      console.log("STARTING FEED ");
      await readBalanceAndAllowance();
      feedInterval = setInterval(async function () {
        await readBalanceAndAllowance();
      }, 10000);
    }
  } catch (err) {
    console.log(err);
  }
}

function stopFeed() {
  console.log("STOPPING FEED ");
  if (feedInterval != null) {
    clearInterval(feedInterval);
    feedInterval = null;
    console.log("balanceFeedInterval cleared");
  }
}

function showConnectionMsg(showMsg) {
  $(".connect-msg").prop("hidden", !showMsg);
}
function enableControls(enable) {
  $("#deposit_btn").prop("disabled", !enable);
  $("#withdraw_btn").prop("disabled", !enable);
  $(".btn-check").prop("disabled", !enable);
  $(".nav-link").prop("disabled", !enable);
}

function resetDepositNote(prefix) {
  newDeposit = createDeposit({ nullifier: rbigint(31), secret: rbigint(31) });
  const note = prefix + "_" + toHex(newDeposit.preimage, 62);
  $("#deposit_note").val(note);
  $("#withdraw_note").val("");
}
let INIT_ERROR = false;

$(document).ready(async function () {
  try {
    showConnectionMsg(true);
    $(".tokenName").text(NAME_TOKEN);
    await setChain();
    await startFeed();
    enableControls(true);
  } catch (err) {
    INIT_ERROR = true;
    console.log(`Initialization: ${err}`);
    showConnectionMsg(true);
    enableControls(false);
    stopFeed();
  }
});

ethereum.on("chainChanged", handleChainChanged);
ethereum.on("accountsChanged", handleAccountsChanged);

async function setChain() {
  if (window.ethereum.networkVersion !== CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + CHAIN_ID.toString(16) }],
      });
    } catch (err) {
      // if (err.code === 4902) { // does not work on mobile
      console.log("add chain");
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainName: CHAIN_NAME,
            chainId: "0x" + CHAIN_ID.toString(16),
            nativeCurrency: { name: CHAIN_SYMBOL, decimals: 18, symbol: CHAIN_SYMBOL },
            rpcUrls: [CHAIN_RPC_URL],
          },
        ],
      });
      // } else throw err;
    }
  }

  await connect();
  web3 = new Web3(Web3.givenProvider);

  token = new web3.eth.Contract(TOKEN_ABI, CONTRACT_TOKEN);
  verifier = new web3.eth.Contract(VERIFIER_ABI, CONTRACT_VERIFIER);
  setDeposit(RS_USDT_TRON_10);
  // resetDepositNote(RS_USDT_TRON_10);
}

function handleChainChanged(_chainId) {
  window.location.reload();
}

function handleAccountsChanged(accounts) {
  console.log("handleAccountsChanged");
  if (INIT_ERROR || accounts.length === 0) {
    window.location.reload();
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    console.log("Account = " + accounts[0]);
    showConnectionMsg(false);
    $(".account").html(`<img src="bttc.svg" height="20px" width="20px" alt="" /><span>${shortenString(accounts[0])}</span>`);
  }
}

async function connect() {
  console.log("connect");

  await ethereum
    .request({ method: "eth_requestAccounts" })
    .then(handleAccountsChanged)
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

async function sendTransaction(transactionName, transactionFN, valMsg) {
  console.log("SEND TRANSACTION (" + transactionName + ") START");
  let transactionError = false;

  $(valMsg).html(`<div class="spinner-border spinner-border-xs text-warning" role="status"><span class="visually-hidden">Waiting for signature ...</span></div><span class="text-warning">&nbsp;${transactionName}: Waiting for signature ...</span>`);
  try {
    let transactionId;
    await transactionFN()
      .send({ from: currentAccount })
      .on("transactionHash", function (transactionHash) {
        transactionId = transactionHash;
        $(valMsg).html(
          `<div class="spinner-border spinner-border-xs text-warning" role="status"><span class="visually-hidden">Waiting for confirmation ...</span></div><span class="text-warning">&nbsp;${transactionName}: Waiting for confirmation of transaction <a href="${TRANSACTION_URL}${transactionId}" target="_blank" class="text-warning">${shortenString(
            transactionId
          )}</a> ...</span>`
        );
      })
      .on("confirmation", function (transactionHash) {
        $(valMsg).html(`<span class="text-warning">${transactionName}: Transaction <a href="${TRANSACTION_URL}${transactionId}" target="_blank" class="text-warning">${shortenString(transactionId)}</a> confirmed.</span>`);
      });
  } catch (err) {
    let msg = err.message;
    $(valMsg).html('<span class="text-warning">' + msg + "</span>");
    return [true, true];
  }
  console.log("SEND TRANSACTION (" + transactionName + ") END");
  return [false, transactionError];
}

$(function () {
  "use strict";
  var depositForm = document.querySelectorAll("#deposit_form");
  Array.prototype.slice.call(depositForm).forEach(function (form) {
    form.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();
        event.stopPropagation();

        let validationError = false;
        let transactionError = false;

        enableControls(false);

        $(".d_validationMsg").html("");
        $(".d_validationMsg2").html("");

        console.log("approve");

        if (BigNumber(d_amount).isGreaterThan(balanceToken)) {
          $(".d_validationMsg").html(`<span class="text-warning">Your ${NAME_TOKEN} balance is too low</span>`);
          validationError = true;
        }

        if (validationError == false) {
          // approve TOKEN
          if (BigNumber(d_amount).isGreaterThan(allowanceToken)) {
            [validationError, transactionError] = await sendTransaction(
              `<span class="fw-bold">Deposit Approval for ${NAME_TOKEN}</span>`,
              function () {
                return token.methods.approve(currentRSAddress, "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
              },
              ".d_validationMsg"
            );
          }
        }

        console.log("deposit");
        if (validationError == false && transactionError == false) {
          // deposit TOKEN
          [validationError, transactionError] = await sendTransaction(
            `<span class="fw-bold">Deposit ${numberWithCommas(BigNumber(d_amount).div(10 ** DECIMALS_TOKEN))} ${NAME_TOKEN}</span>`,
            function () {
              return raidshift.methods.deposit(newDeposit.commitmentHex);
            },
            ".d_validationMsg2"
          );
        }

        enableControls(true);
      },
      false
    );
  });
});

async function fetchSNARKdata() {
  if (!circuit) {
    circuit = await (await fetch("withdraw.json")).json();
  }
  if (!proving_key) {
    proving_key = await (await fetch("withdraw_proving_key.bin")).arrayBuffer();
  }
  if (!groth16) {
    groth16 = await buildGroth16();
  }
}

$(function () {
  "use strict";
  var withdrawForm = document.querySelectorAll("#withdraw_form");
  Array.prototype.slice.call(withdrawForm).forEach(function (form) {
    form.addEventListener(
      "submit",
      async function (event) {
        event.preventDefault();
        event.stopPropagation();

        let validationError = false;
        let transactionError = false;

        enableControls(false);

        let deposit;
        const noteString = $("#withdraw_note").val();

        let withdrawRSAddress;

        if (noteString.startsWith(RS_USDT_TRON_1 + "_0x")) {
          withdrawRSAddress = CONTRACT_1;
        } else if (noteString.startsWith(RS_USDT_TRON_10 + "_0x")) {
          withdrawRSAddress = CONTRACT_10;
        } else if (noteString.startsWith(RS_USDT_TRON_100 + "_0x")) {
          withdrawRSAddress = CONTRACT_100;
        } else if (noteString.startsWith(RS_USDT_TRON_1K + "_0x")) {
          withdrawRSAddress = CONTRACT_1K;
        } else if (noteString.startsWith(RS_USDT_TRON_10K + "_0x")) {
          withdrawRSAddress = CONTRACT_10K;
        } else if (noteString.startsWith(RS_USDT_TRON_100K + "_0x")) {
          withdrawRSAddress = CONTRACT_100K;
        } else if (!noteString) {
          validationError = true;
          $(".w_validationMsg").html(`<span class="text-warning">Please provide a note</span>`);
        } else {
          validationError = true;
          $(".w_validationMsg").html(`<span class="text-warning">The note starts with an invalid prefix</span>`);
        }

        console.log(withdrawRSAddress);

        if (validationError == false) {
          let noteStringTrimmed = noteString.replace(/(.*)(0x.*)/, "$2");

          try {
            deposit = parseNote(noteStringTrimmed);
          } catch (err) {
            $(".w_validationMsg").html(`<span class="text-warning">${err.message}</span>`);
            validationError = true;
          }
        }

        let w_raidshift;
        if (validationError == false) {
          try {
            w_raidshift = new web3.eth.Contract(RS_ABI, withdrawRSAddress);
          } catch (err) {
            $(".w_validationMsg").html(`<span class="text-warning">${err.message}</span>`);
            f;
          }
        }

        let tree;
        let leafIndex;
        if (validationError == false) {
          $(".w_validationMsg").html(
            `<div class="spinner-border spinner-border-xs text-warning" role="status"><span class="visually-hidden">Generating zk-SNARK proof ...</span></div><span class="text-warning">&nbsp;Generating zk-SNARK proof ...</span>`
          );

          // build merkle tree
          const events = await w_raidshift.getPastEvents("Deposit", { fromBlock: 0, toBlock: "latest" });
          const leaves = events
            .sort((a, b) => a.returnValues.leafIndex - b.returnValues.leafIndex) // Sort events in chronological order
            .map((e) => e.returnValues.commitment);
          tree = new merkleTree(MERKLE_TREE_HEIGHT, leaves);

          let depositEvent = events.find((e) => e.returnValues.commitment === toHex(deposit.commitment));
          let foundLeafIdx = depositEvent ? depositEvent.returnValues.leafIndex : -1;

          if (foundLeafIdx < 0) {
            $(".w_validationMsg").html(`<span class="text-warning">There is no deposit for this note</span>`);
            validationError = true;
          } else {
            leafIndex = foundLeafIdx;
          }
        }

        // validate Merkle Tree Root
        if (validationError == false && transactionError == false) {
          try {
            let isKnownRoot;
            await w_raidshift.methods
              .isKnownRoot(toHex(tree.root()))
              .call()
              .then(function (result) {
                isKnownRoot = result;
              });
            if (isKnownRoot == false) {
              $(".w_validationMsg").html(`<span class="text-warning">Merkle tree is corrupted</span>`);
              validationError = true;
            }
          } catch (err) {
            $(".w_validationMsg").html(`<span class="text-warning">${err.message}</span>`);
            validationError = true;
          }
        }

        // check if not is already spent
        if (validationError == false && transactionError == false) {
          try {
            let isSpent;
            await w_raidshift.methods
              .isSpent(deposit.nullifierHex)
              .call()
              .then(function (result) {
                isSpent = result;
              });
            if (isSpent == true) {
              $(".w_validationMsg").html(`<span class="text-warning">The note is already spent</span>`);
              validationError = true;
            }
          } catch (err) {
            $(".w_validationMsg").html(`<span class="text-warning">${err.message}</span>`);
            validationError = true;
          }
        }

        // Create zk-SNARK proof
        let snarkProof;
        let args;
        if (validationError == false && transactionError == false) {
          const { pathElements, pathIndices } = tree.path(leafIndex);

          const input = {
            // Public snark inputs
            root: tree.root(),
            nullifierHash: deposit.nullifierHash,
            recipient: bigInt(currentAccount),
            relayer: 0,
            fee: 0,
            refund: 0,

            // Private snark inputs
            nullifier: deposit.nullifier,
            secret: deposit.secret,
            pathElements: pathElements,
            pathIndices: pathIndices,
          };
          try {
            console.log("zk-SNARK proof begin");
            await fetchSNARKdata();
            const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, proving_key);
            const { proof } = websnarkUtils.toSolidityInput(proofData);
            snarkProof = proof;
            console.log("zk-SNARK proof end");
            args = [toHex(input.root), toHex(input.nullifierHash), toHex(input.recipient, 20), toHex(input.relayer, 20), input.fee, input.refund];
          } catch (err) {
            $(".w_validationMsg").html(`<span class="text-warning">${err.message}</span>`);
            console.log(err);
            validationError = true;
          }
        }
        if (validationError == false && transactionError == false) {
          console.log("snarkProof = " + snarkProof);
          console.log("args = " + args);

          let validProof = false;
          await verifier.methods
            .verifyProof(snarkProof, args)
            .call()
            .then(function (result) {
              validProof = result;
            });

          console.log("validProof: " + validProof);
          if (!validProof) {
            $(".w_validationMsg").html(`<span class="text-warning">Invalid zk-SNARK proof</span>`);
            validationError = true;
          }
        }

        if (validationError == false && transactionError == false) {
          // withdraw TOKEN

          [validationError, transactionError] = await sendTransaction(
            `<span class="fw-bold">Withdraw ${NAME_TOKEN}</span>`,
            function () {
              return w_raidshift.methods.withdraw(snarkProof, ...args);
            },
            ".w_validationMsg"
          );
        }

        resetDepositNote(currentDepositStr);

        enableControls(true);
      },
      false
    );
  });
});
