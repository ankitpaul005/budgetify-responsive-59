
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Investment } from "@/utils/mockData";
import { formatCurrency } from "@/utils/formatting";
import { PlusCircle, TrendingUp, TrendingDown, MoreHorizontal, TrashIcon, PenIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InvestmentForm from "./InvestmentForm";

export interface InvestmentListProps {
  investments: Investment[];
  currency?: string; // Added currency prop
}

const InvestmentList: React.FC<InvestmentListProps> = ({ 
  investments,
  currency = "INR" // Default to INR
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Your Investments</CardTitle>
            <CardDescription>Manage your portfolio</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-4">
            <InvestmentForm onClose={() => setShowAddForm(false)} />
          </div>
        )}

        <div className="space-y-3">
          {investments.length > 0 ? (
            investments.map((investment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/40 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-sm">{investment.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {investment.type}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(investment.value, currency)}</div>
                  <div
                    className={`text-xs flex items-center justify-end ${
                      investment.value > investment.initialValue
                        ? "text-budget-green"
                        : investment.value < investment.initialValue
                        ? "text-budget-red"
                        : "text-muted-foreground"
                    }`}
                  >
                    {investment.value > investment.initialValue ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : investment.value < investment.initialValue ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : null}
                    {((investment.value - investment.initialValue) /
                      investment.initialValue) *
                      100 >
                    0
                      ? "+"
                      : ""}
                    {(
                      ((investment.value - investment.initialValue) /
                        investment.initialValue) *
                      100
                    ).toFixed(2)}
                    %
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <PenIcon className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <div className="text-center py-6 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground mb-2">
                No investments added yet
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                Add Your First Investment
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentList;
