import React from "react";

interface Props {
  register: any;
}

export const RiskStep8 = ({ register }: Props) => {
  return (
    <div className="h-full py-4 pt-[2.2rem] px-4 border border-borderCol rounded-lg w-full bg-white">
      <div className="flex items-center gap-x-2 ml-2 mb-3">
        <p className="size-6 rounded-full bg-[#255EF2] center text-white font-semibold text-sm">
          8
        </p>
        <p className="font-semibold text-[16px] text-lightGray">
          Additional notes
        </p>
      </div>

      <textarea
        name="note"
        {...register("note")}
        rows={6}
        placeholder="Add any additional notes you want your partner banks to see"
        className="bg-[#F5F7F9] border border-borderCol resize-none w-full py-3 px-3 rounded-lg outline-none"
      ></textarea>
    </div>
  );
};
