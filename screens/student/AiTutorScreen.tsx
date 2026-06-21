import React from 'react';
import ChatScreen from '../shared/ChatScreen';

export default function AiTutorScreen() {
  return (
    <ChatScreen
      mode="student"
      title="CodeMate AI"
      subtitle="Your coding tutor"
    />
  );
}
