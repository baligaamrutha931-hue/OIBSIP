// Calculator state: keep track of the numbers and the chosen operator.
let currentInput = "0";
let previousNumber = null;
let selectedOperator = null;
let justCalculated = false;
let waitingForSecondNumber = false;
let errorMessage = "";
const display = document.getElementById("display");
const expression = document.getElementById("expression");
const keypad = document.getElementById("keypad");
function updateDisplay() {
  if (errorMessage) {
    display.textContent = errorMessage;
    display.classList.add("error");
  } else {
    display.textContent = currentInput;
    display.classList.remove("error");
  }
  // Show the running expression above the main result.
  if (previousNumber !== null && selectedOperator) {
    expression.textContent = previousNumber + " " + selectedOperator;
  } else {
    expression.textContent = "";
  }
}
function resetCalculator() {
  currentInput = "0";
  previousNumber = null;
  selectedOperator = null;
  justCalculated = false;
  waitingForSecondNumber = false;
  errorMessage = "";
  updateDisplay();
}
function clearErrorIfNeeded() {
  if (errorMessage) {
    resetCalculator();
  }
}
function appendNumber(digit) {
  clearErrorIfNeeded();
  // After pressing "=", start a new number instead of appending to the result.
  if (justCalculated || waitingForSecondNumber) {
    currentInput = digit;
    justCalculated = false;
    waitingForSecondNumber = false;
    updateDisplay();
    return;
  }
  if (currentInput === "0" && digit !== ".") {
    currentInput = digit;
  } else {
    currentInput += digit;
  }
  updateDisplay();
}
function appendDecimal() {
  clearErrorIfNeeded();
  if (justCalculated || waitingForSecondNumber) {
    currentInput = "0.";
    justCalculated = false;
    waitingForSecondNumber = false;
    updateDisplay();
    return;
  }
  // Prevent more than one decimal point in the current number.
  if (currentInput.includes(".")) {
    return;
  }
  currentInput += ".";
  updateDisplay();
}
function deleteLastCharacter() {
  clearErrorIfNeeded();
  if (justCalculated) {
    return;
  }
  if (currentInput.length <= 1) {
    currentInput = "0";
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
}
// Perform one arithmetic operation without using eval().
function calculate(firstValue, operator, secondValue) {
  let result;
  switch (operator) {
    case "+":
      result = firstValue + secondValue;
      break;
    case "−":
      result = firstValue - secondValue;
      break;
    case "×":
      result = firstValue * secondValue;
      break;
    case "÷":
      if (secondValue === 0) {
        return { error: "Error: Cannot divide by zero" };
      }
      result = firstValue / secondValue;
      break;
    default:
      return { error: "Error: Unknown operator" };
  }
  // Round slightly to avoid long floating-point tails (for example 0.1 + 0.2).
  result = parseFloat(result.toFixed(10));
  return { value: result };
}
function chooseOperator(operator) {
  clearErrorIfNeeded();
  // If the user taps operators in a row (for example + then ×),
  // replace the operator instead of calculating with zero.
  if (waitingForSecondNumber && previousNumber !== null) {
    selectedOperator = operator;
    updateDisplay();
    return;
  }
  const currentNumber = parseFloat(currentInput);
  // If an operator is already waiting and the user entered a new number,
  // compute the previous pair first. This allows chaining: 5 + 3 × 2.
  if (previousNumber !== null && selectedOperator && !justCalculated) {
    const outcome = calculate(previousNumber, selectedOperator, currentNumber);
    if (outcome.error) {
      errorMessage = outcome.error;
      previousNumber = null;
      selectedOperator = null;
      currentInput = "0";
      justCalculated = false;
      waitingForSecondNumber = false;
      updateDisplay();
      return;
    }
    previousNumber = outcome.value;
    currentInput = String(outcome.value);
  } else {
    previousNumber = currentNumber;
  }
  selectedOperator = operator;
  justCalculated = false;
  waitingForSecondNumber = true;
  updateDisplay();
}
function handleEquals() {
  clearErrorIfNeeded();
  if (previousNumber === null || selectedOperator === null) {
    return;
  }
  const currentNumber = parseFloat(currentInput);
  const outcome = calculate(previousNumber, selectedOperator, currentNumber);
  if (outcome.error) {
    errorMessage = outcome.error;
    previousNumber = null;
    selectedOperator = null;
    currentInput = "0";
    justCalculated = false;
    waitingForSecondNumber = false;
    updateDisplay();
    return;
  }
  currentInput = String(outcome.value);
  previousNumber = null;
  selectedOperator = null;
  justCalculated = true;
  waitingForSecondNumber = false;
  updateDisplay();
}
// Use addEventListener for every button. No inline onclick attributes.
keypad.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  if (button.dataset.number !== undefined) {
    if (button.dataset.number === ".") {
      appendDecimal();
    } else {
      appendNumber(button.dataset.number);
    }
    return;
  }
  if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
    return;
  }
  const action = button.dataset.action;
  if (action === "clear") {
    resetCalculator();
  } else if (action === "backspace") {
    deleteLastCharacter();
  } else if (action === "equals") {
    handleEquals();
  }
});
updateDisplay();
