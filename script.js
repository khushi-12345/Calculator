const display = document.getElementById("result");
const history = document.getElementById("history");

let current = "0";
let stored = null;
let operator = null;
let resetNext = false;
let finished = false;

function render() {
  display.value = current;
}

function formatNumber(number) {
  if (!Number.isFinite(number)) return "Error";
  return String(Number(number.toPrecision(12)));
}

function calculate(a, op, b) {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? NaN : a / b;
  }
}

function clearAll() {
  current = "0";
  stored = null;
  operator = null;
  resetNext = false;
  finished = false;
  history.textContent = "";
  render();
}

function inputNumber(value) {
  if (current === "Error") clearAll();

  if (resetNext || finished) {
    current = value;
    resetNext = false;
    finished = false;
  } else if (current === "0") {
    current = value;
  } else if (current.replace("-", "").length < 15) {
    current += value;
  }

  render();
}

function chooseOperator(op) {
  if (current === "Error") return;

  if (operator && !resetNext) {
    const answer = calculate(stored, operator, Number(current));
    current = formatNumber(answer);
    stored = answer;
    render();
  } else {
    stored = Number(current);
  }

  if (current === "Error") {
    clearAll();
    current = "Error";
    render();
    return;
  }

  operator = op;
  history.textContent = `${current} ${symbol(op)}`;
  resetNext = true;
  finished = false;
}

function symbol(op) {
  return { "+": "+", "-": "−", "*": "×", "/": "÷" }[op];
}

function equals() {
  if (operator === null || stored === null ||
      resetNext || current === "Error") return;

  const a = stored;
  const b = Number(current);
  const op = operator;

  history.textContent =
    `${formatNumber(a)} ${symbol(op)} ${formatNumber(b)} =`;

  current = formatNumber(calculate(a, op, b));
  stored = null;
  operator = null;
  resetNext = true;
  finished = true;
  render();
}

function deleteLast() {
  if (resetNext || finished || current === "Error") {
    current = "0";
    resetNext = false;
    finished = false;
  } else {
    current = current.length > 1
      ? current.slice(0, -1)
      : "0";

    if (current === "-") current = "0";
  }

  render();
}

function percentage() {
  if (current === "Error") return;
  current = formatNumber(Number(current) / 100);
  resetNext = false;
  finished = false;
  render();
}

function changeSign() {
  if (current === "0" || current === "Error") return;

  current = current.startsWith("-")
    ? current.slice(1)
    : "-" + current;

  render();
}

function decimal() {
  if (current === "Error" || resetNext || finished) {
    current = "0.";
    resetNext = false;
    finished = false;
  } else if (!current.includes(".")) {
    current += ".";
  }

  render();
}

document.querySelector(".buttons").addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.num !== undefined) {
    inputNumber(button.dataset.num);
  } else if (button.dataset.op) {
    chooseOperator(button.dataset.op);
  } else {
    switch (button.dataset.action) {
      case "clear": clearAll(); break;
      case "delete": deleteLast(); break;
      case "percent": percentage(); break;
      case "sign": changeSign(); break;
      case "decimal": decimal(); break;
      case "equals": equals(); break;
    }
  }
});

document.addEventListener("keydown", event => {
  const key = event.key;

  if (/^[0-9]$/.test(key)) inputNumber(key);
  else if (["+", "-", "*", "/"].includes(key)) chooseOperator(key);
  else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Backspace") deleteLast();
  else if (key === "Escape") clearAll();
  else if (key === ".") decimal();
  else if (key === "%") percentage();
});