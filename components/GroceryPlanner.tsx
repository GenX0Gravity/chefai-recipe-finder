"use client";

import React, { useState } from "react";
import { FileText, FileSpreadsheet, Copy, Check, ShoppingCart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type GroceryItem = {
  ingredient: string;
  quantity: string;
  estimatedCost: number;
  priority: "High" | "Medium" | "Low";
};

interface GroceryPlannerProps {
  groceryList: GroceryItem[];
  recipeTitle: string;
}

export default function GroceryPlanner({ groceryList, recipeTitle }: GroceryPlannerProps) {
  const [copied, setCopied] = useState(false);

  if (!groceryList || groceryList.length === 0) return null;

  const totalCost = groceryList.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

  const handleCopy = async () => {
    let text = `Shopping List for ${recipeTitle}\n\n`;
    groceryList.forEach(item => {
      text += `- [ ] ${item.quantity} ${item.ingredient} ($${item.estimatedCost?.toFixed(2) || "0.00"} | ${item.priority} Priority)\n`;
    });
    text += `\nEstimated Total: $${totalCost.toFixed(2)}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy", e);
    }
  };

  const exportCSV = () => {
    const headers = ["Ingredient", "Quantity", "Estimated Cost", "Priority"];
    const rows = groceryList.map(item => [
      `"${item.ingredient.replace(/"/g, '""')}"`,
      `"${item.quantity.replace(/"/g, '""')}"`,
      item.estimatedCost || 0,
      item.priority
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shopping_list_${recipeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Shopping List", 14, 22);
    
    doc.setFontSize(14);
    doc.text(`Recipe: ${recipeTitle}`, 14, 32);

    autoTable(doc, {
      startY: 40,
      head: [["Ingredient", "Quantity", "Estimated Cost", "Priority"]],
      body: groceryList.map(item => [
        item.ingredient,
        item.quantity,
        `$${(item.estimatedCost || 0).toFixed(2)}`,
        item.priority
      ]),
      theme: "striped",
      headStyles: { fillColor: [249, 115, 22] }, // orange-500
      foot: [["Total", "", `$${totalCost.toFixed(2)}`, ""]],
      footStyles: { fillColor: [255, 237, 213], textColor: [0, 0, 0], fontStyle: "bold" } // orange-100
    });

    doc.save(`shopping_list_${recipeTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="bg-white border border-orange-200 rounded-xl overflow-hidden shadow-sm mt-8">
      <div className="bg-orange-50 border-b border-orange-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center text-orange-900">
          <ShoppingCart className="w-5 h-5 mr-2 text-orange-600" />
          <h3 className="font-bold text-lg">AI Grocery Planner</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs border-orange-200 text-orange-800 hover:bg-orange-100">
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs border-orange-200 text-orange-800 hover:bg-orange-100">
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF} className="text-xs border-orange-200 text-orange-800 hover:bg-orange-100">
            <FileText className="w-3.5 h-3.5 mr-1" />
            PDF
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start mb-6 bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800">
          <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
          <p>We noticed you are missing some ingredients for this recipe. Here&apos;s a shopping list we put together based on your pantry.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Ingredient</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {groceryList.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.ingredient}</td>
                  <td className="px-4 py-3 text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border tracking-wider ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-700">
                    ${(item.estimatedCost || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50/80 border-t border-gray-100 font-bold">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right text-gray-700 rounded-bl-lg">Estimated Total</td>
                <td className="px-4 py-3 text-right text-orange-600 rounded-br-lg">${totalCost.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
