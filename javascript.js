var bankHolidays = [new Date(2016,07,29), new Date(2016,11,26), new Date(2016,11,27),
    new Date(2017,00,02), new Date(2017,03,14), new Date(2017,03,17),
    new Date(2017,04,01), new Date(2017,04,29)];
var assignedHolidays = [new Date(2016,11,13), new Date(2016,11,14), new Date(2016,11,15),
    new Date(2016,11,15), new Date(2016,11,19), new Date(2016,11,20),
    new Date(2016,11,21), new Date(2016,11,22), new Date(2016,11,23),
    new Date(2016,11,28), new Date(2016,11,29), new Date(2016,11,30),
    new Date(2017,05,15), new Date(2017,05,16), new Date(2017,05,19),
    new Date(2017,05,20), new Date(2017,05,21), new Date(2017,05,22),
    new Date(2017,05,23), new Date(2017,05,26), new Date(2017,05,27),
    new Date(2017,05,28), new Date(2017,05,29), new Date(2017,05,30),
    new Date(2017,06,03)];
var employmentStart = new Date(2016,06,04);
var employmentEnd = new Date(2017,06,03);
var employmentDayTotal = getBusinessDatesCount(employmentStart, employmentEnd);
var yearlyWage = 14047;
var offset = 1190.013;

function update() {
  var earnedTodayString = getEarnedToday().toFixed(4);
  document.title = "£" + earnedTodayString;
  document.getElementById('spanToday').innerHTML = "£" + earnedTodayString;
  document.getElementById('spanTotal').innerHTML = "£" + getEarnedTotal().toFixed(2);
  document.getElementById('spanTotalLeft').innerHTML = "(" + "£" + (yearlyWage - getEarnedTotal()).toFixed(2) + " remaining)";
  document.getElementById('spanDays').innerHTML = getBusinessDatesCount(employmentStart, getCurrentDate())
  document.getElementById('spanYearDays').innerHTML = "(" + employmentDayTotal + " remaining)";

  setTimeout(update, 500);
}

function getEarnedTotal() {
  return getEarnedUntilToday() + getEarnedToday();
}

function getEarnedToday() {
  var currentDate = getCurrentDate();

  if (isDayOff(currentDate)) return 0;

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
  return offset + (getBusinessDatesCount(employmentStart, getCurrentDate()) / employmentDayTotal) * (yearlyWage - offset);
}

function getCurrentDate() {
  return new Date();
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
