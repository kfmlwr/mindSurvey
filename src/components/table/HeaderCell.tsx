import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Button } from "../ui/button";

export const HeaderCell = <TData, TValue>({ children, column }: { children: React.ReactNode; column: Column<TData, TValue> }) => {
  const isSorted = column.getIsSorted(); // 'asc', 'desc', or false

  if (!column.getCanSort()) {
    return <div className="flex items-center">{children}</div>;
  }

  const getSortIcon = () => {
    if (isSorted === "asc") return <ArrowDown className="ml-2 h-4 w-4" />;
    if (isSorted === "desc") return <ArrowUp className="ml-2 h-4 w-4" />;
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <Button variant="ghost" onClick={() => column.toggleSorting(isSorted === "asc")}>
      {children}
      {getSortIcon()}
    </Button>
  );
};
