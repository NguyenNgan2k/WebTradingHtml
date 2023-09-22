const apiUrl = "http://10.0.230.208:9999/TraditionalService";
let token = JSON.parse(window.localStorage.getItem("token"));
let accStatus = JSON.parse(window.localStorage.getItem("accStatus"));
let positions = JSON.parse(window.localStorage.getItem("positions"));

// js login
const rootImgLogin = document.getElementById("icon-login");
const btnLogin = document.getElementById("btn-login");
const userName = document.getElementById("username");
const numberAcc = document.getElementById("number-acc");

rootImgLogin.onclick = function OpenLogin() {
  if (window.localStorage.getItem("login") !== "true") {
    document.getElementById("form-login").style.display = "block";
  }
};

btnLogin.onclick = function Login() {
  //window.localStorage.setItem("login", "true");
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
  if (token) {
    userName.innerHTML = token.name;
    numberAcc.innerHTML = "030C" + token.user;
    getAccStatus();
    getPortfolioStatus();
  }
  if (accStatus && positions) {
    renderTaisan();
  }
};

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
    }
  } catch (error) {
    window.alert("Mất kết nối");
  }
}

//get tai san

async function getAccStatus() {
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
  try {
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
      window.localStorage.setItem("accStatus", JSON.stringify(result.data));
    }
  } catch (error) {
    window.alert("Mất kết nối");
  }
}

async function getPortfolioStatus() {
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
  try {
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
      window.localStorage.setItem("positions", JSON.stringify(result.data));
    }
  } catch (error) {
    window.alert("Mất kết nối");
  }
}

// hiển thị tài sản

function renderTaisan() {
  var _total = positions.find((o) => o.symbol === "TOTAL");
  var arrPositions = positions.filter((o) => o.symbol !== "TOTAL");
  document.getElementById("value-sym").innerHTML = _total.market_value;
  document.getElementById("lai-lo").innerHTML = _total?.gain_loss_value;
  document.getElementById("tong-no").innerHTML = accStatus?.debt;
  document.getElementById("tien-mat").innerHTML = accStatus?.cash_balance;
  document.getElementById("ts-rong").innerHTML = accStatus?.equity;
  document.getElementById("pp").innerHTML = accStatus?.cash_avai;
  if (parseFloat(_total?.gain_loss_value) > 0) {
    document.getElementById("lai-lo").classList.add("up");
  } else if (parseFloat(_total?.gain_loss_value) < 0)
    document.getElementById("lai-lo").classList.add("down");
  makeTable(arrPositions);
}

function makeTable(array) {
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
