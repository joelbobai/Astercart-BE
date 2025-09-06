import { generatePassword } from 'easy_random_password';

const otp = +generatePassword(6,{  includeNumbers: true})


console.log(otp);
console.log(typeof(otp));


