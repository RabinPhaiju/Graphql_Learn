import location, { message, name, getGreeting } from "./Module/myModule";
import add, { substract } from "./Module/math";

console.log(message);
console.log(name + " from ", location);
console.log(getGreeting("rabin"));

console.log(add(2, 3));
console.log(substract(5, 2));
