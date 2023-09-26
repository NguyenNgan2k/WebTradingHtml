const apiUrl = "http://10.0.230.208:9999/TraditionalService";
const priceUrl = "https://board-api.apec.com.vn";
const d = new Date();
d.setDate(d.getDate() - 90);
var IndayOrder = true;
let tokenStorage = JSON.parse(window.localStorage.getItem("token"));
let allStockStorage = JSON.parse(window.localStorage.getItem("allStock"));

// js login
const rootImgLogin = document.getElementById("icon-login");
const btnLogin = document.getElementById("btn-login");
const userName = document.getElementById("username");
const numberAcc = document.getElementById("number-acc");
const changeOrder = document.getElementById("change-order");

document.onclose = function Close() {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("allStock");
};

rootImgLogin.onclick = function OpenLogin() {
  if (window.localStorage.getItem("login") !== "true") {
    document.getElementById("form-login").style.display = "block";
  }
};

btnLogin.onclick = function Login() {
  let username = document.forms["formLogin"]["username"].value;
  let password = document.forms["formLogin"]["password"].value;
  document.getElementById("form-login").style.display = "none";

  let _params = {
    group: "L",
    user: username,
    session: "",
    channel: "W",
    data: {
      type: "string",
      cmd: "Web.sCheckLogin",
      p1: username,
      p2: password,
      p3: "W",
      p4: "",
    },
  };
  getLogin(_params);
};

changeOrder.onclick = function changeOrder() {
  if (IndayOrder) {
    document.getElementById("inday-order").classList.add("display-none");
    document.getElementById("order-his").classList.remove("display-none");
    IndayOrder = false;
  } else {
    document.getElementById("order-his").classList.add("display-none");
    document.getElementById("inday-order").classList.remove("display-none");
    IndayOrder = true;
  }
};

document.addEventListener("beforeunload", function () {
  localStorage.clear();
});

async function getLogin(_params) {
  try {
    var response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: JSON.stringify(_params),
    });
    var result = await response.json();
    if (result.rc < 1) {
      window.alert(result.rs);
    } else {
      window.localStorage.setItem("token", JSON.stringify(result.data));
      window.localStorage.setItem("login", "true");
      handleChangeData(result.data);
    }
  } catch (error) {
    window.alert(error);
  }
}

//get tai san

async function getAccStatus(token) {
  let cmdPortFolio = {
    group: "Q",
    user: token.user,
    session: token.sid,
    data: {
      type: "string",
      cmd: "Web.Portfolio.AccountStatus",
      p1: token.defaultAcc,
    },
  };

  var response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: JSON.stringify(cmdPortFolio),
  });
  var result = await response.json();
  if (result.rc < 1) {
    window.alert(result.rs);
  } else {
    // window.localStorage.setItem("accStatus", JSON.stringify(result.data));
    renderAccStatus(result.data);
  }
}

async function getPortfolioStatus(token) {
  const data = {
    group: "Q",
    user: token.user,
    session: token.sid,
    data: {
      type: "string",
      cmd: "Web.Portfolio.PortfolioStatus",
      p1: token.defaultAcc,
    },
  };
  var response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: JSON.stringify(data),
  });
  var result = await response.json();
  if (result.rc < 1) {
    window.alert(result.rs);
  } else {
    // window.localStorage.setItem("positions", JSON.stringify(result.data));
    renderPositions(result.data);
  }
}

//get inday-order
async function getIndayOrder(token) {
  const params = {
    group: "Q",
    user: token.user,
    session: token.sid,
    data: {
      type: "string",
      cmd: "Web.Order.IndayOrder2",
      p1: "1",
      p2: "1000",
      p3: token.defaultAcc,
      p4: "",
    },
  };
  var response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: JSON.stringify(params),
  });
  var result = await response.json();
  if (result.rc < 1) {
    window.alert(result.rs);
  } else {
    // window.localStorage.setItem("indayOrder", JSON.stringify(result.data));
    makeTableIndayOrder(result.data);
  }
}

// get order-his
function replaceAll(str, find, replace) {
  if (!str) return "";

  return str.replace(new RegExp(find, "g"), replace);
}

function addZero(i) {
  if (Number(i) < 10) {
    i = "0" + i;
  }
  return i;
}

function formatDate(idata, slack, _fm) {
  if (!idata) return;

  let y, m, d;

  try {
    if (typeof idata === "number" || typeof idata === "string") {
      let st;
      if (typeof idata === "number") st = new Date(idata);
      if (typeof idata === "string") st = new Date(replaceAll(idata, "/", "-"));

      y = st.getFullYear();
      m = addZero(st.getMonth() + 1 + "");
      d = addZero(st.getDate() + "");
    } else {
      y = idata.getFullYear();
      m = addZero(idata.getMonth() + 1 + "");
      d = addZero(idata.getDate() + "");
    }
    if (_fm === "ymd") {
      return y + slack + m + slack + d;
    } else {
      return d + slack + m + slack + y;
    }
  } catch (error) {
    return null;
  }
}

async function getOrderHis(token) {
  const params = {
    group: "B",
    user: token.user,
    session: token.sid,
    data: {
      type: "cursor",
      cmd: "ListOrder",
      p1: token.defaultAcc,
      p2: "",
      p3: formatDate(d, "/", "dmy"),
      p4: formatDate(new Date(), "/", "dmy"),
      p5: "",
      // p6: , // kênh đặt
      p7: "1",
      p8: "1000000",
    },
  };
  var response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body: JSON.stringify(params),
  });
  var result = await response.json();
  if (result.rc < 1) {
    window.alert(result.rs);
  } else {
    // window.localStorage.setItem("orderHis", JSON.stringify(result.data));
    makeTableOrderHis(result.data);
  }
}

//get allStock
async function getAllStock() {
  var response = await fetch(`${priceUrl}/getlistallstock`);
  var result = await response.json();
  if (result.rc < 1) {
    window.alert(result.rs);
  } else {
    window.localStorage.setItem("allStock", JSON.stringify(result));
  }
}

// ht account và lấy tài sản khi có token
if (tokenStorage) handleChangeData(tokenStorage);

function handleChangeData(token) {
  if (token) {
    userName.innerHTML = token.name;
    numberAcc.innerHTML = "030C" + token.user;
    getAllStock();
    getAccStatus(token);
    getPortfolioStatus(token);
    getIndayOrder(token);
    getOrderHis(token);
  }
}

// hiển thị tài sản

function renderAccStatus(accStatus) {
  document.getElementById("tong-no").innerHTML = accStatus?.debt | 0;
  document.getElementById("tien-mat").innerHTML = accStatus?.cash_balance | 0;
  document.getElementById("ts-rong").innerHTML = accStatus?.equity | 0;
  document.getElementById("pp").innerHTML = accStatus?.cash_avai | 0;
}

function renderPositions(positions) {
  var _total = positions.find((o) => o.symbol === "TOTAL");
  var arrPositions = positions.filter((o) => o.symbol !== "TOTAL");
  document.getElementById("value-sym").innerHTML = _total.market_value | 0;
  document.getElementById("lai-lo").innerHTML = _total?.gain_loss_value | 0;
  if (parseFloat(_total?.gain_loss_value) > 0) {
    document.getElementById("lai-lo").classList.add("up");
  } else if (parseFloat(_total?.gain_loss_value) < 0)
    document.getElementById("lai-lo").classList.add("down");
  makeTableTS(arrPositions);
}

function makeTableTS(array) {
  const tbody = document.createElement("tbody");
  for (var i = 0; i < array.length; i++) {
    var row = document.createElement("tr");
    for (var j = 0; j < 4; j++) {
      var cell = document.createElement("td");
      switch (j) {
        case 0:
          cell.innerHTML = array[i].symbol;
          break;
        case 1:
          cell.innerHTML = array[i].actual_vol;
          break;
        case 2:
          cell.innerHTML = array[i].market_price;
          break;
        case 3:
          cell.innerHTML = array[i].gain_loss_per;
          if (parseFloat(array[i].gain_loss_per) > 0) {
            cell.classList.add("up");
          } else if (parseFloat(array[i].gain_loss_per) > 0)
            cell.classList.add("down");

          break;
      }
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }
  const tableContainer = document.getElementById("table-ts");
  tableContainer.appendChild(tbody);
}

// hiển thị indey-order

function getPostTo(stockCode) {
  var arr = allStockStorage.find((o) => o.stock_code === stockCode);
  if (arr) {
    return arr?.post_to;
  }
}

function getOrderStatus(sttCode, matchVol, orderVol, quote, index) {
  if (sttCode === "P") {
    return "Chờ khớp";
  } else if (sttCode.endsWith("W")) {
    return "Chờ hủy";
  } else if (sttCode.endsWith("M")) {
    if (StringToInt(matchVol) === StringToInt(orderVol)) return "Đã khớp";

    return "Khớp 1 phần";
  } else if (sttCode.endsWith("X")) {
    if (StringToInt(matchVol) > 0) return "Khớp 1 phần, 1 phần đã hủy";
    return "Đã hủy";
  } else if (sttCode.endsWith("C")) {
    if (index === "HNX" && quote === "G") return "Chờ sửa";
    if (index === "HNX" && quote === "Y") return "Chờ khớp";
    return "Đã sửa";
  } else if (sttCode.indexOf("R") > 0) {
    return "Từ chối";
  }

  return sttCode;
}

function makeTableIndayOrder(array) {
  const tbody = document.createElement("tbody");
  for (var i = 0; i < array.length; i++) {
    var row = document.createElement("tr");
    for (var j = 0; j < 7; j++) {
      var cell = document.createElement("td");
      switch (j) {
        case 0:
          cell.innerHTML = array[i].symbol;
          break;
        case 1:
          cell.innerHTML = array[i].side === "B" ? "Mua" : "Bán";
          if (array[i].side === "B") {
            cell.classList.add("up");
          } else cell.classList.add("down");
          break;
        case 2:
          cell.innerHTML = getOrderStatus(
            array[i].status,
            array[i].matchVolume,
            array[i].volume,
            array[i].quote,
            getPostTo(array[i].symbol)
          );

          break;
        case 3:
          cell.innerHTML = array[i].volume;
          break;
        case 4:
          cell.innerHTML = array[i].showPrice;
          break;
        case 5:
          cell.innerHTML = array[i].matchVolume;
          break;
        case 6:
          cell.innerHTML = array[i].matchValue;
          break;
      }
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }
  const tableContainer = document.getElementById("inday-order");
  tableContainer.appendChild(tbody);
}

// hiển thị lịch sử lệnh
function makeTableOrderHis(array) {
  const tbody = document.createElement("tbody");
  for (var i = 0; i < array.length; i++) {
    var row = document.createElement("tr");
    for (var j = 0; j < 7; j++) {
      var cell = document.createElement("td");
      switch (j) {
        case 0:
          cell.innerHTML = array[i].C_ACCOUNT_CODE;
          break;
        case 1:
          cell.innerHTML = array[i].C_SHARE_CODE;
          break;
        case 2:
          cell.innerHTML =
            array[i].C_SIDE && array[i].C_SIDE === "B" ? "Mua" : "Bán";
          if (array[i].C_SIDE === "B") {
            cell.classList.add("up");
          } else cell.classList.add("down");
          break;
        case 3:
          cell.innerHTML = array[i].C_ORDER_VOLUME;
          break;
        case 4:
          cell.innerHTML = array[i].C_MATCH_VOL;
          break;
        case 5:
          cell.innerHTML = array[i].C_MATCH_PRICE;
          break;
        case 6:
          cell.innerHTML = array[i].C_STATUS_NAME;
          break;
      }
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  }
  const tableContainer = document.getElementById("order-his");
  tableContainer.appendChild(tbody);
}
