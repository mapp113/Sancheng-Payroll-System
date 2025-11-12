"use client";

import LeavesToolBar from "@/app/_components/leaves/tool-bar";

export default function LeavesPage() {

  return (
    <div className="flex flex-col items-center justify-center h-full p-5">
      <LeavesToolBar />
      <div className="w-3xl px-5 pt-2 pb-5 mt-10 bg-[#d5f1f5] rounded-2xl">
        <h1 className="text-lg text-center">Yêu cầu xin nghỉ</h1>
        <div className="my-2">
          <label htmlFor="leave-type">Loại nghỉ:</label>
          <select id="leave-type" className="ml-5 border border-black rounded px-2 py-1">
            <option value="annual">Nghỉ hằng năm</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div className="my-2">
          Sử dụng ngày phép:
          <select id="leave-request-used-days" className="ml-5 border border-black rounded px-2 py-1">
            <option value="true">Có</option>
            <option value="false">Không</option>
          </select>
        </div>
        <div className="my-2">
          Ngày bắt đầu:
          <input id="leave-request-start-date" type="date" className="ml-5 border border-black rounded px-2 py-1" />
        </div>
        <div className="my-2 flex flex-row">
          <div>
            <div>Ngày kết thúc:</div>
            <div>(Nếu chọn nhiều)</div>
          </div>
          <input id="leave-request-end-date" type="date" className="ml-5 border border-black rounded px-2 py-1" />
        </div>
        <div className="my-2 flex">
          <span className="pt-1">Lý do:</span>
          <textarea className="ml-5 border border-black rounded px-2 py-1 max-h-md w-md resize-y" rows={3} />
        </div>
        <div className="h-fit my-2 items-center">
          <input type="file" className="ml-2 file:mr-4 file:py-2 file:px-4 file:rounded-full 
             file:border-0 file:text-sm file:font-semibold
             file:bg-blue-50 file:text-blue-700 
             hover:file:bg-blue-100" />
        </div>
        <div className="flex">
          <button className="ml-2 border border-black rounded px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
            Reset / Clear
          </button>
          <div className="ml-auto">
            <button className="border border-black rounded px-4 py-2 bg-green-500 text-white hover:bg-green-600 cursor-pointer">
              Gửi yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}