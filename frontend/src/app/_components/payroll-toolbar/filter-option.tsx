import { Funnel } from "lucide-react";

export default function FilterOption() {
  //TODO: Write Filter Interface
  return(
    <>
    <button id="payroll-toolbar-filter-button" className="flex items-center p-1 border border-black rounded-sm text-sm cursor-pointer">
        <Funnel className="inline mr-1"/>
        Filters
    </button>
    </>
  )
}