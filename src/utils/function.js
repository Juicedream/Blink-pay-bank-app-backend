const crypto = require("crypto");
const dotenv = require("dotenv");

const SECRET_KEY = process.env.SECRET_KEY;
const SECRET_IV = process.env.SECRET_IV;
const ALGORITHM = process.env.ALGORITHM;

function getAge(date) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;

  const key = crypto.createHash("sha256").update(SECRET_KEY).digest();
  const iv = crypto.createHash("md5").update(SECRET_IV).digest();

  if (!dateRegex.test(date)) {
    throw new ApiError(400, "Invalid Date Format. Must be: DD/MM/YYYY");
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
  let virtual_starter = ["20", "21", "76"];
  let random_8_numbers = Math.floor(Math.random() * 9999999) + 9999999;
  let idx = Math.floor(Math.random() * virtual_starter.length);
  return Number(virtual_starter[idx] + random_8_numbers);
}

function generatePin() {
  let pin = Math.floor(Math.random() * 9 * 999) + 999;
  return pin.toString();
}

function generateRefId() {
  const id = Math.floor(Math.random() * 9999) * 9999 + 9999;
  return `BP-${id}`;
}
function generateCardNumber(acc_type) {
  const random_numbers =
    Math.floor(Math.random() * 99999999999999) + 9999999999999;
  const four_teen = random_numbers.toString();
  if (acc_type === "savings") {
    return "41" + four_teen;
  } else {
    return "51" + four_teen;
  }
}


function generateCvv() {
  return Math.floor(Math.random() * 999) + 99;
}


function encrypt(text) {
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}


function generateCardExpiryDate(expiryMonth) {
  const now = new Date();
  // Move to next month
  now.setMonth(now.getMonth() + Number(expiryMonth));

  const month = String(now.getMonth() + 1).padStart(2, "0"); // 01-12
  const year = String(now.getFullYear()).slice(-2); // last 2 digits of year

  return `${month}/${year}`;
}

function dbCardExpiryDate(expiryMonth) {
  const now = new Date();
  now.setMonth(now.getMonth() + Number(expiryMonth)); // 1 month from now
  return now;
}

module.exports = {
  getAge,
  generateAccountNumber,
  generateVirtualAccountNumber,
  generatePin,
  generateRefId,
  generateCardNumber,
  generateCvv,
  encrypt,
  decrypt,
  generateCardExpiryDate,
};
