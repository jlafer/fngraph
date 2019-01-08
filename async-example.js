const sum = (x, y) => Promise.resolve(x + y);
const double = (x) => Promise.resolve(x * 2);
const product = (x, y) => Promise.resolve(x * y);

const p1 = sum(2, 2);
const p2 = double(2);
const p3 = double(3);
const p4 = Promise.all([p1, p2]).then(([v1, v2]) => product(v1, v2));
const p5 = Promise.all([p2, p3]).then(([v2, v3]) => sum(v2, v3));
const p6 = Promise.all([p4, p5]).then(([v4, v5]) => sum(v4, v5));
p6.then(v6 => console.log(v6));