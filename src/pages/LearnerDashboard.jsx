import React, { useState, useEffect } from 'react';
import AceTransition, { LOADING_DURATION } from "@/components/common/AceTransition";

export default function LearnerDashboard() {
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
        setPageLoading(false);
    }, LOADING_DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <AceTransition />;
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-black">
      <iframe
        src="https://schoolace-frontend-963696778204.us-central1.run.app/"
        className="w-full h-full border-none"
        title="Learner Dashboard"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
        allowFullScreen
      />
    </div>
  );
}