var bankHolidays = [new Date(2016,07,29), new Date(2016,11,26), new Date(2016,11,27),
    new Date(2017,00,02), new Date(2017,03,14), new Date(2017,03,17),
    new Date(2017,04,01), new Date(2017,04,29)];
var assignedHolidays = [];
var calculationStart;
var employmentStart;
var employmentEnd;
var employmentDayTotal;
var yearlyWage;
var offset;

function init() {
  populateSettingsFields();
  saveSettings();
  update();
}

function update() {
  setTimeout(update, 500);
  
  if (!validateInputs()) return;

  var earnedToday = getEarnedToday();
  var earnedTotal = getEarnedTotal();
  var daysWorked = getBusinessDatesCount(employmentStart, getCurrentDate());

  document.title = "£" + numberWithCommas(earnedToday.toFixed(2));
  document.getElementById('spanToday').innerHTML = "£" + numberWithCommas(earnedToday.toFixed(4));
  document.getElementById('spanTotal').innerHTML = "£" + numberWithCommas(earnedTotal.toFixed(2));
  document.getElementById('spanTotalLeft').innerHTML = "(" + "£" + numberWithCommas((yearlyWage - earnedTotal).toFixed(2)) + " remaining)";
  document.getElementById('spanDays').innerHTML = daysWorked;
  document.getElementById('spanDaysLeft').innerHTML = "(" + (employmentDayTotal - daysWorked) + " remaining)";

}

function populateSettingsFields() {
  var holidays = getCookie("holidays");
  if (holidays !== null) {
    document.getElementById("txtHolidays").value = holidays.split(",").map(s => s.trim()).join(", ");
  }

  var startDate = getCookie("employmentStart");
  if (startDate !== null) {
    document.getElementById("inputStartDate").value = startDate;
  }

  var calcStartDate = getCookie("calculationStart");
  if (calcStartDate !== null) {
    document.getElementById("inputCalcStartDate").value = calcStartDate;
  }

  var endDate = getCookie("employmentEndDate");
  if (endDate !== null) {
    document.getElementById("inputEndDate").value = endDate;
  }

  var wage = getCookie("wage");
  if (endDate !== null) {
    document.getElementById("inputWage").value = wage;
  }

  var alreadyEarned = getCookie("alreadyEarned");
  if (alreadyEarned !== null) {
    document.getElementById("inputAlreadyEarned").value = alreadyEarned;
  }
}

function saveSettings() {
  if (validateInputs()) {
    var holidays = document.getElementById("txtHolidays").value;
    setCookie("holidays", holidays);

    assignedHolidays = holidays == "" 
      ? []
      : holidays.split(",")
      .map(s => s.trim())
      .map(
          function(date) {
            var parts = date.split("/");
            return new Date(parts[2], parts[1] - 1, parts[0]);
          }
      );

    var startDate = document.getElementById("inputStartDate").value;
    setCookie("employmentStart", startDate);
    var parts = startDate.split("/");
    this.employmentStart = new Date(parts[2], parts[1] - 1, parts[0]);

    var calcStartDate = document.getElementById("inputCalcStartDate").value;
    setCookie("calculationStart", calcStartDate);
    var parts = calcStartDate.split("/");
    this.calculationStart = new Date(parts[2], parts[1] - 1, parts[0]);

    var endDate = document.getElementById("inputEndDate").value;
    setCookie("employmentEndDate", endDate);
    var parts = endDate.split("/");
    this.employmentEnd = new Date(parts[2], parts[1] - 1, parts[0]);

    var wage = document.getElementById("inputWage").value;
    setCookie("wage", wage);
    this.yearlyWage = parseFloat(wage);

    var alreadyEarned = document.getElementById("inputAlreadyEarned").value;
    setCookie("alreadyEarned", alreadyEarned);
    this.offset = parseFloat(alreadyEarned);

    this.employmentDayTotal = getBusinessDatesCount(employmentStart, employmentEnd);
  }
}

function validateInputs() {
  var matches = true;

  var txtHolidays = document.getElementById("txtHolidays");
  var check = /^(\s*\d\d\/\d\d\/\d\d\d\d(,\s*\d\d\/\d\d\/\d\d\d\d\s*)*)?$/.test(txtHolidays.value);
  txtHolidays.style.backgroundColor = check ? "white" : "pink";
  matches = matches && check;

  var inputStartDate = document.getElementById("inputStartDate");
  check = /^\s*\d\d\/\d\d\/\d\d\d\d\s*$/.test(inputStartDate.value);
  inputStartDate.style.backgroundColor = check ? "white" : "pink";
  matches = matches && check;

  var inputCalcStartDate = document.getElementById("inputCalcStartDate");
  check = /^\s*\d\d\/\d\d\/\d\d\d\d\s*$/.test(inputCalcStartDate.value);
  inputCalcStartDate.style.backgroundColor = check ? "white" : "pink";
  matches = matches && check;

  var inputEndDate = document.getElementById("inputEndDate");
  check = /^\s*\d\d\/\d\d\/\d\d\d\d\s*$/.test(inputEndDate.value);
  inputEndDate.style.backgroundColor = check ? "white" : "pink";
  matches = matches && check;

  var inputWage = document.getElementById("inputWage");
  check = /^\s*\d+(\.\d+)?$/.test(inputWage.value);
  inputWage.style.backgroundColor = check ? "white" : "pink";
  matches = matches && check;

  var inputAlreadyEarned = document.getElementById("inputAlreadyEarned");
  check = /^\s*\d+(\.\d+)?$/.test(inputAlreadyEarned.value);
  inputAlreadyEarned.style.backgroundColor = check ? "white" : "pink";
  matches = matches && check;

  return matches;
}

function setCookie(name, value) {
  if (window.localStorage !== undefined) {
    window.localStorage.setItem(name, value);
  } else {
    console.log("localStorage is undefined, so cookie cannot be set");
  }
}

function getCookie(name) {
  if (window.localStorage !== undefined) {
    return window.localStorage.getItem(name);
  } else {
    return null;
  }
}

/* Thanks to http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript */
function numberWithCommas(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
function getEarnedTotal() {
  return getEarnedUntilToday() + getEarnedToday();
}

function getEarnedToday() {
  var currentDate = getCurrentDate();

  if (isDayOff(currentDate) || currentDate >= employmentEnd) return 0;

  var daysLeftInYear = getBusinessDatesCount(getCurrentDate(), employmentEnd);
  var amountLeftToEarn = yearlyWage - getEarnedUntilToday();
  var totalToday = amountLeftToEarn / daysLeftInYear;

  var time = currentDate.getHours() + currentDate.getMinutes() / 60 + currentDate.getSeconds() / 3600;
  var timeWorked = 0;
  if (time < 9)
    timeWorked = 0;
  else if (time >= 9 && time < 12.5) {
    timeWorked = time - 9;
  } else if (time >= 12.5 && time < 13.5) {
    timeWorked = 3.5;
  } else if (time >= 13.5 && time < 17.5) {
    timeWorked = (time - 9) - 1;
  } else timeWorked = 7.5;

  return timeWorked/7.5 * totalToday;
}

function getEarnedUntilToday() {
  return offset + (getBusinessDatesCount(calculationStart, getCurrentDate()) / employmentDayTotal) * (yearlyWage - offset);
}

function getCurrentDate() {
  var now = new Date();
  if (now > employmentEnd) {
    return employmentEnd;
  } else {
    return now;
  }
}

function getBusinessDatesCount(startDate, endDate) {
  var c = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  var endNormalised = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  var svar = 0;
  while (c < endNormalised) {
    if (!isDayOff(c))
      ++svar;

    c.setDate(c.getDate() + 1);
  }

  return svar;
}

function isDayOff(date) {
  var containsDate = (pre, cur) => pre || areEqual(date, cur);
  return date.getDay() == 0 || date.getDay() == 6
    || bankHolidays.reduce(containsDate, false) || assignedHolidays.reduce(containsDate, false);
}

function areEqual(date1, date2) {
  return date1.getTime() == date2.getTime();
}
