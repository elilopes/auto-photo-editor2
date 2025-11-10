
import React from 'react';

interface EditorLayoutProps {
  children: React.ReactNode;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ children }) => {
  return (
    <main className="flex-grow flex flex-col gap-4 p-4">
      {children}
    </main>
  );
};
