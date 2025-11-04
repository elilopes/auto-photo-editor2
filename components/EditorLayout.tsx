
import React from 'react';

interface EditorLayoutProps {
  children: React.ReactNode;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ children }) => {
  return (
    <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
      {children}
    </main>
  );
};
