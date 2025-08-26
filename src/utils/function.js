function getAge(date) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
  if (!dateRegex.test(date)) {
    throw new ApiError(400, "Invalid Date Format. Must be: DD/MM/YYYY")
  }

  let userDate = date.split("/");
  let [userDay, userMonth, userYear] = userDate;
  userYear = Number(userYear);
  userMonth = Number(userMonth);
  userDay = Number(userDay);

  if (userMonth <= currentMonth && userDay <= currentDay) {
    return currentYear - userYear;
  } else {
    return currentYear - userYear - 1;
  }
}


function generateAccountNumber(accountType) {
  let startNum = accountType === "savings" ? "30" : "50";
  let random_8_numbers = Math.floor(Math.random() * 9999999) + 9999999;
  return Number(startNum + random_8_numbers);
}

function generateVirtualAccountNumber() {
  let virtual_starter = ["20", "21", "76"]
  let random_8_numbers = Math.floor(Math.random() * 9999999) + 9999999;
  let idx = Math.floor(Math.random() * virtual_starter.length);
  return Number( virtual_starter[idx] + random_8_numbers );
}

function generatePin() {
  let pin = Math.floor(Math.random() * 9 * 999) + 999;
  return pin.toString();
}

function generateRefId() {
  const id = Math.floor(Math.random() * 9999) * 9999 + 9999;
  return `BP-${id}`;
}


module.exports = {
    getAge,
    generateAccountNumber,
    generateVirtualAccountNumber,
    generatePin,
    generateRefId,
}