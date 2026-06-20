import React from "react";
import ElectionList from "./single-election";

const ElectionView = () => {
  return (
    <div className="mt-4">
      <p className="text-lg font-semibold mb-2">Elections in progress</p>
      <ElectionList />
    </div>
  );
};

export default ElectionView;
