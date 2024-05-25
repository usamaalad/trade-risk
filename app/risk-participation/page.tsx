import DashboardLayout from "@/components/layouts/DashboardLayout";
import { BankTable } from "@/components/shared/BankTable";
import { Sidebar } from "@/components/shared/Sidebar";
import Image from "next/image";

const RiskParticipationPage = () => {
  return (
    <DashboardLayout>
      {/* <div className="flex w-full 2xl:px-10 px-2">
        <div className="2xl:w-5/6 w-4/5 p-2 xl:p-4">
          <h2 className="text-4xl font-semibold mb-5">
            Risk Participation Requests
          </h2>
          <div className="rounded-md border border-borderCol px-4 py-4"></div>
        </div>
        <div className="2xl:w-1/6 w-1/5 sticky top-10 h-[80vh]">
          <Sidebar isBank={true} createMode />
        </div>
      </div> */}
      <div className="center w-full h-[84vh]">
        <Image
          src="/images/risk-dummy.png"
          alt="risk-participation"
          width={1000}
          height={1000}
          className=" w-full h-[85vh] object-contain"
        />
      </div>
      <div className="center absolute top-0 left-0 bg-gray-300/40 w-full h-full z-10">
        <Image
          src="/gif/coming.gif"
          alt="coming-soon"
          width={100}
          height={100}
          className="absolute"
        />
      </div>
    </DashboardLayout>
  );
};

export default RiskParticipationPage;
