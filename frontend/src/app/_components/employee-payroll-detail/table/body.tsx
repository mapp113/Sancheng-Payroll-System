import {cn} from "@/lib/utils";

import type {PayrollLineItem} from "../types";
import {formatCurrency} from "../utils";

interface PayrollDetailTableBodyProps {
    items: PayrollLineItem[];
}

export default function PayrollDetailTableBody({items}: PayrollDetailTableBodyProps) {
    let rowIndex = 0;
    
    return (
        <tbody className="divide-y divide-[#E4EEF9] text-[#1D3E6A]">
        {items.map((item, index) => {
            const rows = [];
            const isEven = rowIndex % 2 === 0;
            rowIndex++;
            
            // Main item row
            rows.push(
                <tr
                    key={`${item.label}-${index}`}
                    className={cn(isEven ? "bg-white" : "bg-[#F8FCFF]")}
                >
                    <td className="px-5 py-4 align-top">
                        <div className="font-semibold">{item.label}</div>
                        {item.description ? (
                            <p className="mt-1 whitespace-pre-line text-xs text-[#56749A]">{item.description}</p>
                        ) : null}
                    </td>
                    <td className="px-5 py-4 text-right align-top text-sm font-semibold">
                        {formatCurrency(item.value)}
                    </td>
                </tr>
            );
            
            // Sub-items rows
            if (item.subItems && item.subItems.length > 0) {
                item.subItems.forEach((subItem, subIndex) => {
                    const subIsEven = rowIndex % 2 === 0;
                    rowIndex++;
                    rows.push(
                        <tr
                            key={`${item.label}-sub-${subIndex}`}
                            className={cn(subIsEven ? "bg-white" : "bg-[#F8FCFF]")}
                        >
                            <td className="px-5 py-4 align-top">
                                <div className="pl-4 text-sm font-medium text-[#56749A]">└─ {subItem.label}</div>
                                {subItem.description ? (
                                    <p className="mt-1 pl-4 text-xs text-[#56749A]">{subItem.description}</p>
                                ) : null}
                            </td>
                            <td className="px-5 py-4 text-right align-top text-sm font-medium text-[#56749A]">
                                {formatCurrency(subItem.value)}
                            </td>
                        </tr>
                    );
                });
            }
            
            return rows;
        })}
        </tbody>
    );
}