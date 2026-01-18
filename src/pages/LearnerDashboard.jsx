import React from 'react';

export default function LearnerDashboard() {
  return (
    <div className="w-full h-[calc(100vh-64px)] bg-black">
      <iframe
        src="https://schoolace-streamlit-963696778204.us-central1.run.app/?embed=true"
        className="w-full h-full border-none"
        title="Learner Dashboard"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; camera; microphone"
        allowFullScreen
      />
    </div>
  );
}