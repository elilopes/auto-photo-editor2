import React from 'react';
import { FileUploader } from './ImageUploader';
import { JsonPromptBuilderCollapse } from './JsonPromptBuilderCollapse';
import { TextToImageGeneratorCollapse } from './TextToImageGeneratorCollapse';

interface InitialScreenProps {
    onFileUpload: (file: File) => void;
    onGenerateImages: (prompt: string) => void;
    onGenerateVideoFromJsonPrompt: (prompt: string) => void;
    isApiKeySelected: boolean;
    setIsApiKeySelected: (isSelected: boolean) => void;
    isLoading: boolean;
    graffitiFeatures: React.ReactNode[];
}

export const InitialScreen: React.FC<InitialScreenProps> = ({
    onFileUpload,
    onGenerateImages,
    onGenerateVideoFromJsonPrompt,
    isApiKeySelected,
    setIsApiKeySelected,
    isLoading,
    graffitiFeatures
}) => {
    return (
        <div className="flex-grow flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {graffitiFeatures}
            <div className="w-full max-w-4xl space-y-8 z-10">
                <FileUploader onFileUpload={onFileUpload} />

                <div className="flex items-center text-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 font-semibold">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <TextToImageGeneratorCollapse
                        onGenerateImages={onGenerateImages}
                        isApiKeySelected={isApiKeySelected}
                        setIsApiKeySelected={setIsApiKeySelected}
                    />
                    <JsonPromptBuilderCollapse
                        onGenerateVideo={onGenerateVideoFromJsonPrompt}
                        isApiKeySelected={isApiKeySelected}
                        setIsApiKeySelected={setIsApiKeySelected}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};
