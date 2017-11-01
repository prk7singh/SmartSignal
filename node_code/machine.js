var ml = require('ml-regression');
console.log(ml);
const SLR = require('ml-regression').SLR;
let x = [80, 60, 10, 20, 30];
let y = [20, 40, 30, 50, 60];

let regression = new SLR(x, y);
regression.toString(3) === 'f(x) = - 0.265 * x + 50.6';
//console.log(regression.predict(80));
//console.log(regression.predict(30));
PolynomialRegression = require('ml-regression').PolynomialRegression;
x = [50,50,50,70,70,70,80,80,80,90,90,90,100,100,100];
y = [3.3,2.8,2.9,2.3,2.6,2.1,2.5,2.9,2.4,3.0,0,2.8,3.3,3.5,4];
const degree = 2; // setup the maximum degree of the polynomial 
regression = new PolynomialRegression(x, y, degree);
console.log(regression.predict(80));
console.log(regression.predict(30));
console.log(regression.predict(120));
console.log(regression.predict(140));
