import React, { useState } from 'react';
import { Sparkles, KeyRound, ChevronDown, Clapperboard, Copy, Check, Hourglass } from 'lucide-react';

interface JsonPromptBuilderCollapseProps {
    onGenerateVideo: (prompt: string) => void;
    isApiKeySelected: boolean;
    setIsApiKeySelected: (isSelected: boolean) => void;
    isLoading: boolean;
}

const SuggestionChip: React.FC<{ text: string, onClick: () => void }> = ({ text, onClick }) => (
    <button
        onClick={onClick}
        className="px-3 py-1 bg-gray-600 text-gray-200 text-xs rounded-full hover:bg-blue-600 transition-colors"
    >
        {text}
    </button>
);

export const JsonPromptBuilderCollapse: React.FC<JsonPromptBuilderCollapseProps> = ({ onGenerateVideo, isApiKeySelected, setIsApiKeySelected, isLoading }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [prompt, setPrompt] = useState({
        subject: '',
        setting: '',
        cameraMovement: 'None',
        atmosphere: 'None',
        style: 'None',
        artStyle: 'Photorealistic',
        colorPalette: 'Vibrant',
        shotType: 'None',
        lighting: 'None',
        timeOfDay: 'None',
        pacing: 'Normal Speed',
        framing: 'None',
    });
    const [copied, setCopied] = useState(false);

    const jsonString = JSON.stringify(prompt, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    
    const handlePromptChange = (field: keyof typeof prompt, value: string) => {
        setPrompt(p => ({ ...p, [field]: value }));
    };
    
    const cameraMovements = ['None', 'Pan Left', 'Tilt Up', 'Zoom In', 'Dolly Forward', 'Crane Shot', 'Aerial Shot'];
    const atmospheres = ['None', 'Cinematic', 'Joyful', 'Dramatic', 'Mysterious', 'Nostalgic', 'Futuristic', 'Horror'];
    const styles = ['None', 'Advertisement', "Children's Story", 'Funny/Comedic', 'Documentary', 'Music Video', 'Time-lapse'];
    const artStyles = ['Photorealistic', 'Anime', 'Watercolor', 'Claymation', 'Pixel Art', '3D Render', 'Sketch'];
    const colorPalettes = ['Vibrant', 'Monochrome', 'Pastel', 'Neon', 'Sepia Tone', 'Warm Tones', 'Cool Tones'];
    const shotTypes = ['None', 'Close-Up', 'Medium Shot', 'Wide Shot', 'Extreme Wide Shot', 'POV (Point of View)'];
    const lightings = ['None', 'Soft Light', 'Hard/Harsh Light', 'High Key (Bright)', 'Low Key (Dark)', 'Backlight', 'Natural Light', 'Neon Glow'];
    const timesOfDay = ['None', 'Midday', 'Sunrise', 'Sunset (Golden Hour)', 'Twilight (Blue Hour)', 'Night'];
    const pacings = ['Normal Speed', 'Slow Motion', 'Fast Motion / Hyperlapse'];
    const framings = ['None', 'Centered Composition', 'Rule of Thirds', 'Symmetrical', 'Leading Lines'];

    const subjectSuggestions = ['A majestic lion', 'A futuristic robot', 'A happy corgi', 'An ancient tree'];
    const settingSuggestions = ['In a dense jungle', 'On a cyberpunk city street', 'At a sunny beach', 'In a magical forest'];

    const renderSelect = (label: string, field: keyof typeof prompt, options: string[]) => (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <select
                value={prompt[field]}
                onChange={(e) => handlePromptChange(field, e.target.value)}
                disabled={isLoading}
                className="w-full p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
            >
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </div>
    );

    return (
        <div className="bg-gray-800 rounded-lg">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-3 rounded-lg text-left font-medium bg-gray-700 text-gray-200 hover:bg-gray-600">
                <span className="flex items-center"><Clapperboard size={18} className="mr-2"/> Video Prompt Builder</span>
                <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                        <input
                            type="text"
                            placeholder="e.g., A robot holding a red skateboard"
                            value={prompt.subject}
                            onChange={(e) => handlePromptChange('subject', e.target.value)}
                            disabled={isLoading}
                            className="w-full p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                        />
                         <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs text-gray-400 self-center">Suggestions:</span>
                            {subjectSuggestions.map(s => <SuggestionChip key={s} text={s} onClick={() => handlePromptChange('subject', s)} />)}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Setting / Environment</label>
                        <input
                            type="text"
                            placeholder="e.g., On a futuristic city street at night"
                            value={prompt.setting}
                            onChange={(e) => handlePromptChange('setting', e.target.value)}
                            disabled={isLoading}
                            className="w-full p-2 bg-gray-700 text-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                             <span className="text-xs text-gray-400 self-center">Suggestions:</span>
                            {settingSuggestions.map(s => <SuggestionChip key={s} text={s} onClick={() => handlePromptChange('setting', s)} />)}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {renderSelect("Camera Movement", "cameraMovement", cameraMovements)}
                        {renderSelect("Atmosphere", "atmosphere", atmospheres)}
                        {renderSelect("Style / Format", "style", styles)}
                        {renderSelect("Art Style", "artStyle", artStyles)}
                        {renderSelect("Color Palette", "colorPalette", colorPalettes)}
                        {renderSelect("Shot Type", "shotType", shotTypes)}
                        {renderSelect("Lighting", "lighting", lightings)}
                        {renderSelect("Time of Day", "timeOfDay", timesOfDay)}
                        {renderSelect("Pacing", "pacing", pacings)}
                        {renderSelect("Framing", "framing", framings)}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-400">Generated JSON Prompt</label>
                        <pre className="w-full p-3 bg-gray-900 text-gray-300 font-mono text-xs rounded-md max-h-40 overflow-auto">{jsonString}</pre>
                        <button onClick={handleCopy} disabled={isLoading} className="w-full py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors flex items-center justify-center disabled:opacity-50">
                            {copied ? <Check size={20} className="mr-2"/> : <Copy size={20} className="mr-2"/>}
                            {copied ? 'Copied!' : 'Copy JSON'}
                        </button>
                    </div>

                    <div className="text-center p-3 bg-gray-900 rounded-lg text-sm text-gray-400 flex items-center justify-center space-x-2">
                        <Hourglass size={16} />
                        <span>Estimated Duration: ~4 seconds</span>
                    </div>

                    {!isApiKeySelected ? (
                         <div className="text-center p-2 bg-yellow-900/50 rounded-lg">
                            <p className="text-sm text-yellow-300 mb-2">Video generation requires an API key.</p>
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline mb-2 block">Learn about billing</a>
                            <button 
                                onClick={async () => {
                                    if (window.aistudio && window.aistudio.openSelectKey) {
                                      await window.aistudio.openSelectKey();
                                      setIsApiKeySelected(true);
                                    }
                                }}
                                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                <KeyRound size={20} className="mr-2" /> Select API Key
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onGenerateVideo(jsonString)}
                            disabled={!prompt.subject.trim() || isLoading}
                            className="w-full py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Sparkles size={20} className="mr-2" /> Generate Video
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};