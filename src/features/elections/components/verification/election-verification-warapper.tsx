"use client";
import React, { useState } from "react";
import ElectionVerification from "./election-verification";
import FaceVerification from "./face-verification";

const ElectionVerificationWrapper = () => {
  const [sessionId, setSessionId] = useState("");

  const handleSessionId = (sessionId: string) => {
    setSessionId(sessionId);
  };

  return (
    <div className="max-w-2xl w-full h-full mx-auto bg-white ">
      {!sessionId ? (
        <ElectionVerification handleSessionId={handleSessionId} />
      ) : (
        <FaceVerification sessionId={sessionId} />
      )}
    </div>
  );
};

export default ElectionVerificationWrapper;
