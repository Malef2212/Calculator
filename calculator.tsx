import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { evaluateExpression } from "@/lib/calculator";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Calculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch calculation history
  const { data: calculations = [] } = useQuery({
    queryKey: ['/api/calculations'],
    staleTime: 0  // Always fetch fresh data
  });

  const handleNumber = (num: string) => {
    if (display === "0") {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
    setExpression(expression + num);
  };

  const handleOperator = (op: string) => {
    setDisplay("0");
    setExpression(expression + op);
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay(display + ".");
      setExpression(expression + ".");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
  };

  const handleEquals = async () => {
    try {
      const result = evaluateExpression(expression);
      setDisplay(result.toString());
      setExpression(result.toString());

      // Save calculation to database
      await apiRequest('POST', '/api/calculations', {
        expression,
        result: result.toString()
      });

      // Invalidate and refetch calculations
      queryClient.invalidateQueries({ queryKey: ['/api/calculations'] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid expression",
      });
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    const key = event.key;
    if (/[0-9]/.test(key)) {
      handleNumber(key);
    } else if (["+", "-", "*", "/"].includes(key)) {
      handleOperator(key);
    } else if (key === ".") {
      handleDecimal();
    } else if (key === "Enter") {
      handleEquals();
    } else if (key === "Escape") {
      handleClear();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [display, expression]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl flex gap-4 flex-col md:flex-row">
        <Card className="w-full md:w-1/2 p-6 shadow-lg">
          <div className="mb-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground overflow-x-auto whitespace-nowrap mb-1">
                {expression || "0"}
              </div>
              <div className="text-4xl font-bold text-foreground overflow-x-auto whitespace-nowrap">
                {display}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="text-lg font-semibold"
              onClick={handleClear}
            >
              C
            </Button>
            <Button
              variant="outline"
              className="text-lg font-semibold col-span-2"
              onClick={() => handleOperator("/")}
            >
              ÷
            </Button>
            <Button
              variant="outline"
              className="text-lg font-semibold"
              onClick={() => handleOperator("*")}
            >
              ×
            </Button>

            {[7, 8, 9].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="text-lg font-semibold"
                onClick={() => handleNumber(num.toString())}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              className="text-lg font-semibold"
              onClick={() => handleOperator("-")}
            >
              -
            </Button>

            {[4, 5, 6].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="text-lg font-semibold"
                onClick={() => handleNumber(num.toString())}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="outline"
              className="text-lg font-semibold"
              onClick={() => handleOperator("+")}
            >
              +
            </Button>

            {[1, 2, 3].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="text-lg font-semibold"
                onClick={() => handleNumber(num.toString())}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="default"
              className="text-lg font-semibold row-span-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleEquals}
            >
              =
            </Button>

            <Button
              variant="outline"
              className="text-lg font-semibold col-span-2"
              onClick={() => handleNumber("0")}
            >
              0
            </Button>
            <Button
              variant="outline"
              className="text-lg font-semibold"
              onClick={handleDecimal}
            >
              .
            </Button>
          </div>
        </Card>

        <Card className="w-full md:w-1/2 p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Calculation History</h2>
          <div className="space-y-2">
            {calculations.map((calc: any) => (
              <div
                key={calc.id}
                className="p-3 bg-muted rounded-lg"
              >
                <div className="text-sm text-muted-foreground">
                  {calc.expression} = {calc.result}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(calc.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {calculations.length === 0 && (
              <div className="text-center text-muted-foreground p-4">
                No calculations yet
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}