export function evaluateExpression(expression: string): number {
  // Remove any trailing operators
  expression = expression.replace(/[+\-*/]$/, '');
  
  if (!expression) {
    return 0;
  }

  try {
    // Use Function instead of eval for better security
    const result = new Function(`return ${expression}`)();
    
    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Invalid result');
    }
    
    // Round to 8 decimal places to handle floating point precision
    return Number(result.toFixed(8));
  } catch (error) {
    throw new Error('Invalid expression');
  }
}
