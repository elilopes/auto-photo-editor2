import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        onFileUpload(file);
      } else {
        alert('Please upload a valid image (JPEG, PNG, WEBP, GIF) or video (MP4, WEBM, MOV) file.');
      }
    }
  };

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };
  
  return (
    <div className="flex-grow flex items-center justify-center p-8 relative z-10">
        <div 
            className={`w-full max-w-2xl p-10 border-4 border-dashed rounded-xl transition-colors duration-300 bg-gray-900/80 backdrop-blur-sm ${isDragging ? 'border-blue-400 bg-gray-800/90' : 'border-gray-600 hover:border-blue-500'}`}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                onChange={(e) => handleFileChange(e.target.files)}
            />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer space-y-4 text-center">
                <UploadCloud className={`w-16 h-16 transition-colors duration-300 ${isDragging ? 'text-blue-400' : 'text-gray-500'}`} />
                <div>
                    <p className="text-xl font-semibold text-gray-300">Drag & Drop your photo or video here for edition</p>
                    <p className="text-sm text-gray-400 mt-2">Arraste e solte sua foto ou vídeo aqui para edição</p>
                    <p className="text-sm text-gray-400">Glissez-déposez votre photo ou vidéo ici pour l'édition</p>
                    <p className="text-sm text-gray-400">संपादन के लिए अपनी तस्वीर या वीडियो यहां खींचें और छोड़ें</p>
                    <p className="text-sm text-gray-400">Перетащите фото или видео сюда для редактирования</p>
                </div>
                <p className="text-gray-400">or</p>
                <button type="button" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300">
                    Browse Files
                </button>
                <p className="text-sm text-gray-500 pt-4">Supports JPEG, PNG, WEBP, GIF, MP4, WEBM, MOV</p>
            </label>
        </div>
    </div>
  );
};