import { useState, useEffect } from "react";
import PieChart, { PieChartDataProps } from "./PieChart";
import { useAnalytics } from "@/context/AnalyticsContext";
import Image from "next/image";
import { CustomVisitEvent } from "@/utils/types";
import { Spinner } from "@chakra-ui/react";
import { DataTable } from "../Table/DataTable";
import { PaginatedTable } from "../Table/PaginatedTable";
import { columns } from "../Table/SourceLinksColumns";

// GROUP DATA
export const groupMap: Record<string, string> = {
  student: "Student",
  educator: "Educator",
  parent: "Parent",
  administrator: "Admin",
};

interface UserTrafficProps {
  trafficSourceData: PieChartDataProps[];
  trafficGroupsData: PieChartDataProps[];
  loading: boolean;
}

const UserTraffic = ({
  trafficSourceData,
  trafficGroupsData,
  loading,
}: UserTrafficProps) => {
  const [currentTab, setCurrentTab] = useState("Major Sources");

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-10">
          <Spinner
            className="mb-5 h-10 w-10"
            thickness="4px"
            emptyColor="#98A2B3"
            color="#164C96"
          />
        </div>
      );
    }

    if (trafficSourceData.length === 0) {
      return (
        <div className="flex flex-col items-center self-stretch">
          <Image
            src={"/orange_heart.svg"}
            alt="No views"
            width={180}
            height={140}
          />
          <h1 className="mt-4 font-inter text-2xl text-orange-primary">
            Sorry, no {currentTab.toLowerCase()}!
          </h1>
          <h2 className="text-sm text-gray-500">
            No users viewed the site today.
          </h2>
        </div>
      );
    }
    switch (currentTab) {
      case "Major Sources":
        return <PieChart data={trafficSourceData} type="sources" />;
      case "Links":
        return (
          <PaginatedTable
            columns={columns}
            itemsPerPage={12}
            data={trafficSourceData}
          />
        );
      case "User Groups":
        return <PieChart data={trafficGroupsData} type="groups" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 self-stretch rounded-2xl">
      <h1 className="self-stretch text-2xl">User Traffic</h1>
      <div className="flex space-x-4 self-stretch border-b-2 border-orange-primary">
        <button
          className={`rounded-t-md px-3 py-2 text-xs ${
            currentTab === "Major Sources"
              ? "bg-orange-primary text-white"
              : "bg-gray-100 text-gray-500"
          }`}
          onClick={() => setCurrentTab("Major Sources")}
        >
          Major Sources
        </button>
        <button
          className={`rounded-t-md px-4 py-2 text-xs ${
            currentTab === "Links"
              ? "bg-orange-primary text-white"
              : "bg-gray-100 text-gray-500"
          }`}
          onClick={() => setCurrentTab("Links")}
        >
          Links
        </button>
        <button
          className={`rounded-t-md px-4 py-2 text-xs ${
            currentTab === "User Groups"
              ? "bg-orange-primary text-white"
              : "bg-gray-100 text-gray-500"
          }`}
          onClick={() => setCurrentTab("User Groups")}
        >
          User Groups
        </button>
      </div>
      <div className="self-stretch overflow-x-auto bg-white">
        {renderContent()}
      </div>
    </div>
  );
};

export default UserTraffic;
