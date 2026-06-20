import { Button } from "@/components/ui/button";
import React from "react";
import HomeClient from "./homeClient";
import ElectionView from "@/features/elections/components/election-view";

const HomePage = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 p-4 w-full h-full bg-white">
      <HomeClient />
      <ElectionView />
    </div>
  );
};

export default HomePage;
