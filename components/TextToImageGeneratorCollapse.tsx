import React, { useState } from 'react';
import { Sparkles, KeyRound, ChevronDown } from 'lucide-react';

interface TextToImageGeneratorCollapseProps {
    onGenerateImages: (prompt: string) => void;
    isApiKeySelected: boolean;
    setIsApiKeySelected: (isSelected: boolean) => void;
}

export const TextToImageGeneratorCollapse: React.FC<TextToImageGeneratorCollapseProps> = (props) => {
    const [isOpen, setIsOpen] = useState(true);
    const [generationPrompt, setGenerationPrompt] = useState('');

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Sparkles size={18} className="mr-2" /> Generate Images from Text</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 space-y-3">
                    <textarea
                        value={generationPrompt}
                        onChange={(e) => setGenerationPrompt(e.target.value)}
                        placeholder="e.g., a cute cat astronaut on the moon, cinematic lighting..."
                        className="w-full h-24 p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {!props.isApiKeySelected ? (
                        <div className="text-center p-2 bg-yellow-900/50 rounded-lg">
                            <p className="text-sm text-yellow-300 mb-2">Image generation requires an API key.</p>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mb-2 block">Learn about billing</a>
                            <button
                                onClick={async () => {
                                    if (window.aistudio && window.aistudio.openSelectKey) {
                                        await window.aistudio.openSelectKey();
                                        props.setIsApiKeySelected(true);
                                    }
                                }}
                                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                <KeyRound size={20} className="mr-2" /> Select API Key
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => props.onGenerateImages(generationPrompt)}
                            disabled={!generationPrompt.trim()}
                            className="w-full py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles size={20} className="mr-2" /> Generate 4 Images
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
