import React from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import ArtifactPanel from '../components/ArtifactPanel';
import { useSelector } from 'react-redux';

export default function Chat() {
  const artifacts = useSelector(state => state.message?.artifacts || []);

  return (
    <div className="flex h-screen w-full bg-[#F8F7F4] overflow-hidden">
      <Sidebar />
      <ChatArea />
      {artifacts.length > 0 && (
        <ArtifactPanel />
      )}
    </div>
  );
}
