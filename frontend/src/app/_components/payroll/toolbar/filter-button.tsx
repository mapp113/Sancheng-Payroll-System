import { Funnel } from "lucide-react";

export default function FilterButton() {
  return (
    <div className="flex items-center border border-black rounded-sm px-2 py-1 cursor-pointer select-none">
      <Funnel className="inline"/>
      <span className="">Filters</span>
    </div>
  );
}