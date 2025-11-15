import React, { useState, useRef, useCallback, FC, useEffect } from 'react';
import { AudioPrompt, Storyboard, StoryboardPrompt, HistoryEntry } from './types';
import { GoogleGenAI, Type } from "@google/genai";

// SVG Icons defined as separate components for reusability and clarity.

const UploadIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const MusicIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
  </svg>
);

const PlayIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const CopyIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const DownloadIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const TranscribeIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const FileTextIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PlusIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const HistoryIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TrashIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const KeyIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-1a1 1 0 011-1h2-2-2a1 1 0 01-1-1v-2h2v-2h2v-2h2l1.743-1.743A6 6 0 0121 9z" />
    </svg>
);


const Spinner: FC<{ message?: string }> = ({ message = "Đang phân tích âm thanh..." }) => (
  <div className="flex flex-col items-center justify-center space-y-6">
    <svg width="80" height="60" viewBox="0 0 80 60" fill="currentColor" className="text-cyan-500">
      <rect x="0" y="30" width="10" height="30" >
        <animate attributeName="height" attributeType="XML" values="30;60;30" begin="0s" dur="1s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="30;0;30" begin="0s" dur="1s" repeatCount="indefinite" />
      </rect>
      <rect x="20" y="30" width="10" height="30" >
        <animate attributeName="height" attributeType="XML" values="30;60;30" begin="0.2s" dur="1s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="30;0;30" begin="0.2s" dur="1s" repeatCount="indefinite" />
      </rect>
      <rect x="40" y="30" width="10" height="30" >
         <animate attributeName="height" attributeType="XML" values="30;60;30" begin="0.4s" dur="1s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="30;0;30" begin="0.4s" dur="1s" repeatCount="indefinite" />
      </rect>
       <rect x="60" y="30" width="10" height="30" >
         <animate attributeName="height" attributeType="XML" values="30;60;30" begin="0.6s" dur="1s" repeatCount="indefinite" />
        <animate attributeName="y" attributeType="XML" values="30;0;30" begin="0.6s" dur="1s" repeatCount="indefinite" />
      </rect>
    </svg>
    <p className="text-lg text-gray-400">{message}</p>
  </div>
);

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: FC<FileUploadProps> = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const dragOverStyle = isDragging ? 'border-cyan-500 bg-gray-700' : 'border-gray-700';

  return (
    <div
      className={`relative w-full max-w-lg p-8 border-2 border-dashed ${dragOverStyle} rounded-xl transition-all duration-300 text-center flex flex-col items-center space-y-4`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mpeg, audio/wav, audio/ogg, audio/flac, audio/mp4"
        className="hidden"
        onChange={handleChange}
        disabled={isLoading}
      />
      <UploadIcon className="w-16 h-16 text-gray-400" />
      <p className="text-gray-400">Kéo và thả tệp âm thanh của bạn vào đây</p>
      <p className="text-gray-400">hoặc</p>
      <button
        onClick={onButtonClick}
        disabled={isLoading}
        className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Chọn Tệp
      </button>
      <p className="text-xs text-gray-500 pt-2">Định dạng hỗ trợ: MP3, WAV, OGG, FLAC. Tối đa 50MB.</p>
    </div>
  );
};

interface PromptItemProps {
  prompt: AudioPrompt;
  isPlaying: boolean;
  isPlaybackEnabled: boolean;
  onPlay: () => void;
}

const PromptItem: FC<PromptItemProps> = ({ prompt, isPlaying, onPlay, isPlaybackEnabled }) => {
  return (
    <div className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors space-x-4">
      <button
        onClick={onPlay}
        disabled={!isPlaybackEnabled}
        className="p-3 bg-gray-700 rounded-full hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
        aria-label={`Phát phân đoạn ${prompt.id + 1}`}
      >
        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
      </button>
       <div className="flex items-center space-x-4">
        <MusicIcon className="w-6 h-6 text-cyan-500" />
        <div>
          <p className="font-bold text-lg">Phân đoạn {prompt.id + 1}</p>
          <p className="text-sm text-gray-400">
            {prompt.startTime.toFixed(2)}s - {prompt.endTime.toFixed(2)}s
          </p>
        </div>
      </div>
    </div>
  );
};

interface StoryboardDisplayProps {
    storyboard: Storyboard;
    fileName: string;
    onPromptTextChange: (promptIndex: number, newText: string) => void;
}

const StoryboardDisplay: FC<StoryboardDisplayProps> = ({ storyboard, fileName, onPromptTextChange }) => {
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [copyAllStatus, setCopyAllStatus] = useState(false);

    const handleCopy = (text: string, id: number) => {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    };
    
    const handleCopyAll = () => {
        const allPrompts = storyboard.storyboard.map(item => `${item.segment}. ${item.prompt}`).join('\n\n');
        navigator.clipboard.writeText(allPrompts).then(() => {
            setCopyAllStatus(true);
            setTimeout(() => setCopyAllStatus(false), 2000);
        });
    };

    const characterItems = storyboard.characterDescriptions.split('\n').filter(line => line.trim() !== '');

    const handleDownload = () => {
        const title = `Kịch bản Phân cảnh cho Veo 3 - ${fileName.replace(/\.[^/.]+$/, "")}`;
        const divider = "================================\n";

        let content = `${title}\n\n`;

        content += `${divider}MÔ TẢ NHÂN VẬT\n${divider}\n`;
        storyboard.characterDescriptions.split('\n').filter(line => line.trim() !== '').forEach((desc, index) => {
            content += `${index + 1}. ${desc}\n`;
        });
        content += `\n`;

        content += `${divider}MÔ TẢ BỐI CẢNH\n${divider}\n`;
        content += `${storyboard.settingDescription}\n\n`;

        content += `${divider}CÁC PROMPT PHÂN CẢNH\n${divider}\n`;

        storyboard.storyboard.forEach(item => {
            const cleanPrompt = item.prompt.replace(/\n/g, ' ');
            content += `${item.segment}. ${cleanPrompt}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kich-ban-phan-canh.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
      <div className="space-y-6 mt-6 w-full text-left">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-2xl font-bold text-white">Kịch bản Phân cảnh đã tạo</h3>
            <div className="flex items-center gap-2">
                 <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold transition-colors text-sm disabled:opacity-75"
                    disabled={copyAllStatus}
                >
                    <CopyIcon className="w-5 h-5" />
                    {copyAllStatus ? 'Đã sao chép!' : 'Sao chép tất cả'}
                </button>
                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-semibold transition-colors text-sm"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Tải xuống (.txt)
                </button>
            </div>
        </div>
        <div>
          <h4 className="text-xl font-bold text-cyan-400">Mô tả Nhân vật</h4>
          <div className="mt-2 text-gray-300 bg-gray-800 p-4 rounded-lg font-mono text-sm">
            <ol className="list-decimal list-inside space-y-1">
              {characterItems.map((desc, index) => (
                <li key={index}>{desc.replace(/^\d+\.\s*/, '')}</li>
              ))}
            </ol>
          </div>
        </div>
        <div>
          <h4 className="text-xl font-bold text-cyan-400">Mô tả Bối cảnh</h4>
          <p className="mt-2 text-gray-300 bg-gray-800 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">{storyboard.settingDescription}</p>
        </div>
        <div>
          <h4 className="text-xl font-bold text-cyan-400 mb-2">Các Prompt Phân cảnh</h4>
          <div className="space-y-4">
            {storyboard.storyboard.map((item, index) => (
              <div key={item.segment} className="bg-gray-800 p-4 rounded-lg flex justify-between items-start gap-4">
                <div className="flex-1 flex items-start gap-3">
                    <span className="font-bold text-cyan-400 text-md pt-2">{item.segment}.</span>
                    <textarea
                        value={item.prompt}
                        onChange={(e) => onPromptTextChange(index, e.target.value)}
                        className="w-full flex-1 bg-gray-700/50 p-2 rounded-md border border-gray-600 focus:bg-gray-700 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all text-gray-300 resize-y"
                        rows={3}
                        aria-label={`Prompt cho phân đoạn ${item.segment}`}
                    />
                </div>
                <button
                  onClick={() => handleCopy(item.prompt, item.segment)}
                  className="p-2 mt-px rounded-md bg-gray-700 hover:bg-gray-600 transition-colors text-gray-400 flex items-center text-sm disabled:opacity-50"
                  disabled={copiedId === item.segment}
                  aria-label={`Sao chép prompt cho phân đoạn ${item.segment}`}
                >
                  {copiedId === item.segment ? 'Đã chép!' : <CopyIcon className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};

interface AnalysisPanelProps {
    prompts: AudioPrompt[];
    playingPromptId: number | null;
    onPlayPrompt: (prompt: AudioPrompt) => void;
    fileName: string;
    isPlaybackEnabled: boolean;
    voiceGender: string | null;
}

const AnalysisPanel: FC<AnalysisPanelProps> = ({ prompts, playingPromptId, onPlayPrompt, fileName, isPlaybackEnabled, voiceGender }) => {
    const displayGender = (gender: string | null) => {
        if (!gender) return null;
        switch (gender.toLowerCase()) {
            case 'male': return 'Nam';
            case 'female': return 'Nữ';
            case 'mixed': return 'Nhiều giọng';
            default: return null;
        }
    };
    
    const formattedGender = displayGender(voiceGender);

    return (
        <div className="w-full space-y-6">
           <div className="text-center p-4 bg-gray-800 rounded-lg sticky top-0 z-10">
             <h2 className="text-xl font-bold">Phân tích tệp <span className="text-cyan-400">{fileName}</span></h2>
             <p className="text-gray-400">Tìm thấy {prompts.length} phân đoạn</p>
             {formattedGender && (
                <p className="text-sm text-gray-400 mt-1">Giọng nói được phát hiện: <span className="font-semibold text-cyan-400">{formattedGender}</span></p>
             )}
             {!isPlaybackEnabled && <p className="text-xs text-yellow-400 mt-2">(Không thể phát lại âm thanh cho phiên đã lưu)</p>}
           </div>
           <div className="space-y-3 max-h-[70vh] overflow-y-auto p-1 rounded-md bg-gray-900/50">
             {prompts.map((prompt) => (
               <PromptItem
                 key={prompt.id}
                 prompt={prompt}
                 isPlaying={playingPromptId === prompt.id}
                 onPlay={() => onPlayPrompt(prompt)}
                 isPlaybackEnabled={isPlaybackEnabled}
               />
             ))}
           </div>
        </div>
    );
};


interface StoryboardPanelProps {
  isPlaybackEnabled: boolean;
  onTranscribeAudio: () => void;
  isTranscribing: boolean;
  transcriptionError: string | null;
  scriptText: string;
  onScriptTextChange: (value: string) => void;
  onTxtFileUpload: (file: File) => void;
  onGenerateStoryboard: () => void;
  isGenerating: boolean;
  generationError: string | null;
  storyboard: Storyboard | null;
  onPromptTextChange: (promptIndex: number, newText: string) => void;
  fileName: string;
  characterNationality: string;
  onCharacterNationalityChange: (value: string) => void;
  generationStyle: 'direct' | 'narrative';
  onGenerationStyleChange: (value: 'direct' | 'narrative') => void;
  characterCount: string;
  onCharacterCountChange: (value: string) => void;
}

const StoryboardPanel: FC<StoryboardPanelProps> = (props) => {
  const { 
    isPlaybackEnabled, onTranscribeAudio, isTranscribing, transcriptionError, scriptText, 
    onScriptTextChange, onTxtFileUpload, onGenerateStoryboard, isGenerating, generationError, 
    storyboard, onPromptTextChange, fileName, characterNationality, onCharacterNationalityChange,
    generationStyle, onGenerationStyleChange, characterCount, onCharacterCountChange
  } = props;
  
  const txtInputRef = useRef<HTMLInputElement>(null);

  const onUploadTxtClick = () => {
    txtInputRef.current?.click();
  };

  const handleTxtFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onTxtFileUpload(e.target.files[0]);
    }
  };
  
  return (
    <div className="w-full space-y-6">
        <div className="pt-6 border-t border-gray-700 lg:border-t-0 lg:pt-0">
            {!storyboard && (
              <div className="text-center">
                  <h3 className="text-2xl font-bold">Bước 2: Cung cấp Kịch bản</h3>
              </div>
            )}
            
            <div className="mt-6 space-y-4">
              {!scriptText && !isTranscribing && (
                 <div className="space-y-6 p-6 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-center">
                        <p className="text-gray-400">Nếu bạn chưa có kịch bản, chúng tôi có thể tạo một kịch bản từ âm thanh của bạn.</p>
                        <button
                            onClick={onTranscribeAudio}
                            disabled={!isPlaybackEnabled}
                            className="w-full mt-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            <TranscribeIcon className="w-6 h-6" />
                            Phiên âm từ Âm thanh (Khuyến nghị)
                        </button>
                    </div>

                    <div className="flex items-center text-gray-500">
                        <div className="flex-grow border-t border-gray-600"></div>
                        <span className="flex-shrink mx-4 font-semibold">HOẶC</span>
                        <div className="flex-grow border-t border-gray-600"></div>
                    </div>

                    <div className="text-center">
                       <p className="text-gray-400">Nếu bạn đã có sẵn kịch bản, hãy cung cấp bên dưới.</p>
                       <input
                          ref={txtInputRef}
                          type="file"
                          accept=".txt,text/plain"
                          className="hidden"
                          onChange={handleTxtFileChange}
                       />
                       <button
                          onClick={onUploadTxtClick}
                          className="w-full mt-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold transition-colors flex items-center justify-center gap-3"
                       >
                         <FileTextIcon className="w-5 h-5" />
                         Tải kịch bản từ tệp .txt
                       </button>
                       <textarea
                         placeholder="Hoặc dán trực tiếp kịch bản của bạn vào đây..."
                         onChange={(e) => onScriptTextChange(e.target.value)}
                         className="w-full mt-4 h-32 p-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
                         rows={5}
                       />
                    </div>
                </div>
              )}
            
              {isTranscribing && <Spinner message="Đang phiên âm..." />}

              {transcriptionError && (
                  <div className="text-center p-4 bg-red-900/50 border border-red-500 rounded-lg">
                      <p className="font-semibold text-red-300">Phiên âm thất bại</p>
                      <p className="text-red-400 mt-1 text-sm">{transcriptionError}</p>
                      <button onClick={onTranscribeAudio} className="mt-4 px-4 py-2 text-sm bg-red-700 hover:bg-red-600 rounded-md">Thử lại</button>
                  </div>
              )}

              {scriptText && !isTranscribing && (
                <div className="p-6 bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-center text-gray-300">Xem lại & Chỉnh sửa Kịch bản</h4>
                  <textarea
                      value={scriptText}
                      onChange={(e) => onScriptTextChange(e.target.value)}
                      placeholder="Kịch bản của bạn sẽ xuất hiện ở đây. Bạn có thể chỉnh sửa nó trước khi tạo kịch bản phân cảnh."
                      className="w-full mt-4 h-40 p-4 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
                      disabled={isGenerating}
                  />
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="nationality-select" className="block text-sm font-medium text-gray-400 mb-2">
                                Quốc tịch Nhân vật
                            </label>
                            <select
                                id="nationality-select"
                                value={characterNationality}
                                onChange={(e) => onCharacterNationalityChange(e.target.value)}
                                disabled={isGenerating}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
                            >
                                <option value="default">Mặc định (Không xác định)</option>
                                <option value="Vietnamese">Việt Nam</option>
                                <option value="Japanese">Nhật Bản</option>
                                <option value="Korean">Hàn Quốc</option>
                                <option value="Chinese">Trung Quốc</option>
                                <option value="Thai">Thái Lan</option>
                                <option value="American">Mỹ (American)</option>
                                <option value="British">Anh (British)</option>
                                <option value="French">Pháp (French)</option>
                                <option value="Portuguese">Bồ Đào Nha (Portuguese)</option>
                                <option value="Spanish">Tây Ban Nha (Spanish)</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="style-select" className="block text-sm font-medium text-gray-400 mb-2">
                                Phong cách Kịch bản
                            </label>
                            <select
                                id="style-select"
                                value={generationStyle}
                                onChange={(e) => onGenerationStyleChange(e.target.value as 'direct' | 'narrative')}
                                disabled={isGenerating}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
                            >
                                <option value="direct">Hành động Trực tiếp</option>
                                <option value="narrative">Thuyết minh/Minh họa</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="char-count-select" className="block text-sm font-medium text-gray-400 mb-2">
                                Số lượng Nhân vật
                            </label>
                            <select
                                id="char-count-select"
                                value={characterCount}
                                onChange={(e) => onCharacterCountChange(e.target.value)}
                                disabled={isGenerating}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors"
                            >
                                <option value="auto">Tự động (Mặc định)</option>
                                <option value="1">1 nhân vật</option>
                                <option value="2">2 nhân vật</option>
                                <option value="3">3 nhân vật</option>
                            </select>
                        </div>
                    </div>
                     <div className="mt-2 text-center text-xs text-gray-500 px-2 py-2 bg-gray-900/50 rounded-md">
                        {generationStyle === 'direct'
                            ? 'Tạo cảnh nhân vật thực hiện hành động hoặc nói lời thoại trong kịch bản.'
                            : 'Tạo cảnh quay minh họa (B-roll) cho nội dung được nói, không hiển thị người nói.'}
                    </div>
                  <button
                      onClick={onGenerateStoryboard}
                      disabled={isGenerating || !scriptText.trim()}
                      className="w-full mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                      {isGenerating ? 'Đang tạo...' : 'Tạo Storyboard từ Kịch bản'}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col items-center">
                {isGenerating && <Spinner message="Đang tạo kịch bản phân cảnh..." />}
                {generationError && (
                    <div className="text-center p-4 bg-red-900/50 border border-red-500 rounded-lg">
                        <p className="font-semibold text-red-300">Tạo kịch bản thất bại</p>
                        <p className="text-red-400 mt-1 text-sm">{generationError}</p>
                    </div>
                )}
                {storyboard && <StoryboardDisplay storyboard={storyboard} fileName={fileName} onPromptTextChange={onPromptTextChange} />}
            </div>
       </div>
    </div>
  );
};


interface HistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryEntry[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onClearAll: () => void;
}

const HistoryPanel: FC<HistoryPanelProps> = ({ isOpen, onClose, history, onLoad, onDelete, onClearAll }) => {
    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-gray-800 shadow-lg z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Lịch sử</h2>
                    <button onClick={onClose} className="text-2xl leading-none p-1 rounded-full hover:bg-gray-700">&times;</button>
                </div>
                {history.length === 0 ? (
                    <p className="p-4 text-gray-400">Chưa có lịch sử.</p>
                ) : (
                    <div className="flex flex-col h-[calc(100%-120px)]">
                        <ul className="overflow-y-auto flex-grow p-2 space-y-2">
                            {history.map(entry => (
                                <li key={entry.id} className="group bg-gray-700/50 rounded-md hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center justify-between p-3">
                                        <button onClick={() => onLoad(entry.id)} className="text-left flex-grow">
                                            <p className="font-semibold truncate">{entry.fileName}</p>
                                            <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleString('vi-VN')}</p>
                                        </button>
                                        <button 
                                            onClick={() => onDelete(entry.id)} 
                                            className="ml-4 p-2 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                                            aria-label="Xóa mục"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                         <div className="p-4 border-t border-gray-700">
                            <button onClick={onClearAll} className="w-full text-center text-sm py-2 bg-red-800/50 hover:bg-red-800/80 rounded-md text-red-300 transition-colors">
                                Xóa tất cả lịch sử
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (keys: string[]) => void;
    currentKeys: string[];
}

const ApiKeyModal: FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentKeys }) => {
    const [keysInput, setKeysInput] = useState(currentKeys.join('\n'));

    useEffect(() => {
        setKeysInput(currentKeys.join('\n'));
    }, [currentKeys, isOpen]);

    const handleSave = () => {
        onSave(keysInput.split('\n'));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-700 relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-2xl leading-none p-1 rounded-full hover:bg-gray-700">&times;</button>
                <h2 className="text-2xl font-bold mb-4">Cài đặt API Key</h2>
                <p className="text-gray-400 mb-4 text-sm">
                    Dán các API key của bạn vào đây, mỗi key một dòng. Ứng dụng sẽ tự động chuyển sang key tiếp theo nếu key hiện tại hết hạn ngạch.
                </p>
                <textarea
                    value={keysInput}
                    onChange={(e) => setKeysInput(e.target.value)}
                    placeholder="key-1...&#10;key-2...&#10;key-3..."
                    className="w-full h-40 p-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-colors font-mono text-sm resize-y"
                    rows={8}
                    aria-label="API Keys Input"
                />
                <button
                    onClick={handleSave}
                    className="w-full mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-semibold transition-colors"
                >
                    Lưu
                </button>
            </div>
        </div>
    );
};


// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        // remove the `data:${file.type};base64,` part
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const App: FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [prompts, setPrompts] = useState<AudioPrompt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [playingPromptId, setPlayingPromptId] = useState<number | null>(null);
  const [scriptText, setScriptText] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [voiceGender, setVoiceGender] = useState<string | null>(null);
  const [characterNationality, setCharacterNationality] = useState<string>('default');
  const [generationStyle, setGenerationStyle] = useState<'direct' | 'narrative'>('direct');
  const [characterCount, setCharacterCount] = useState<string>('auto');
  
  // History State
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  
  // API Key State
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState<number>(0);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const CHUNK_DURATION = 8; // Ideal chunk duration in seconds

  useEffect(() => {
    try {
        const storedHistory = localStorage.getItem('audioStoryboardHistory');
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
        const storedKeys = localStorage.getItem('geminiApiKeys');
        const storedIndex = localStorage.getItem('geminiApiKeyIndex');
        if (storedKeys) {
            const parsedKeys = JSON.parse(storedKeys);
            if (Array.isArray(parsedKeys) && parsedKeys.length > 0) {
                 setApiKeys(parsedKeys);
            }
        }
        if (storedIndex) {
            setCurrentApiKeyIndex(JSON.parse(storedIndex));
        }
    } catch (e) {
        console.error("Không thể tải dữ liệu từ localStorage", e);
    }
  }, []);

  const saveHistory = (newHistory: HistoryEntry[]) => {
    try {
        localStorage.setItem('audioStoryboardHistory', JSON.stringify(newHistory));
        setHistory(newHistory);
    } catch (e) {
        console.error("Không thể lưu lịch sử vào localStorage", e);
    }
  };
  
  const handleSaveApiKeys = (keys: string[]) => {
    const cleanedKeys = keys.filter(k => k.trim() !== '');
    setApiKeys(cleanedKeys);
    setCurrentApiKeyIndex(0);
    localStorage.setItem('geminiApiKeys', JSON.stringify(cleanedKeys));
    localStorage.setItem('geminiApiKeyIndex', '0');
    setIsApiKeyModalOpen(false);
  };


  const resetState = useCallback(() => {
    setFile(null);
    setPrompts([]);
    setError(null);
    setAudioBuffer(null);
    setPlayingPromptId(null);
    if(sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
    }
    setScriptText('');
    setIsTranscribing(false);
    setTranscriptionError(null);
    setStoryboard(null);
    setIsGenerating(false);
    setGenerationError(null);
    setIsLoading(false);
    setLoadingMessage('');
    setVoiceGender(null);
    setCharacterNationality('default');
    setGenerationStyle('direct');
    setCharacterCount('auto');
  }, []);

  const analyzeVoiceGender = async (audioFile: File): Promise<string | null> => {
    if (apiKeys.length === 0) {
        // Don't open modal here, let the main process handle it.
        console.warn("No API keys for voice analysis.");
        return null;
    }

    let attemptedKeys = 0;
    let localApiKeyIndex = currentApiKeyIndex;

    while (attemptedKeys < apiKeys.length) {
        const keyToTry = apiKeys[localApiKeyIndex];
        attemptedKeys++;

        try {
            const ai = new GoogleGenAI({ apiKey: keyToTry });
            const base64Data = await fileToBase64(audioFile);

            const audioPart = { inlineData: { mimeType: audioFile.type, data: base64Data } };
            const textPart = { text: "Analyze the voice(s) in this audio file. Identify the gender of the primary speaker or speakers. Respond with only one word from the following options: 'Male', 'Female', 'Mixed', 'Unknown'." };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [audioPart, textPart] },
            });
            
            const result = response.text.trim();
            const validResults = ['Male', 'Female', 'Mixed', 'Unknown'];
            const gender = validResults.find(r => result.toLowerCase().includes(r.toLowerCase())) || 'Unknown';
            
            setVoiceGender(gender);
            setCurrentApiKeyIndex(localApiKeyIndex);
            localStorage.setItem('geminiApiKeyIndex', JSON.stringify(localApiKeyIndex));
            return gender;

        } catch (err) {
            console.error(`Gender analysis with API Key ${localApiKeyIndex + 1} failed:`, err);
            const isQuotaError = err instanceof Error && (err.message.includes('429') || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('resource has been exhausted'));
            
            if (isQuotaError) {
                localApiKeyIndex = (localApiKeyIndex + 1) % apiKeys.length;
            } else {
                console.error("An unexpected error occurred during voice analysis.");
                setVoiceGender('Unknown');
                return 'Unknown';
            }
        }
    }
    
    console.error("All API keys failed for voice analysis.");
    setVoiceGender('Unknown');
    return 'Unknown';
};


  const handleFileUpload = useCallback(async (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/')) {
      setError('Loại tệp không hợp lệ. Vui lòng tải lên tệp âm thanh được hỗ trợ.');
      return;
    }
     if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      setError('Kích thước tệp vượt quá 50MB. Vui lòng tải lên một tệp nhỏ hơn.');
      return;
    }
    resetState();
    setFile(selectedFile);
    setIsLoading(true);
    setLoadingMessage('Đang đọc tệp...');

    try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        setLoadingMessage('Đang giải mã dữ liệu âm thanh...');
        const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setAudioBuffer(decodedBuffer);

        setLoadingMessage('Đang phân đoạn âm thanh...');
        const totalDuration = decodedBuffer.duration;
        const numChunks = Math.max(1, Math.round(totalDuration / CHUNK_DURATION));
        const actualChunkDuration = totalDuration / numChunks;
        
        const generatedPrompts: AudioPrompt[] = Array.from({ length: numChunks }, (_, i) => {
            const startTime = i * actualChunkDuration;
            // The last chunk should end exactly at totalDuration to avoid floating point inaccuracies
            const endTime = (i === numChunks - 1) ? totalDuration : (i + 1) * actualChunkDuration;
            return {
                id: i,
                startTime,
                endTime,
                duration: endTime - startTime,
            };
        });
        setPrompts(generatedPrompts);
        
        setLoadingMessage('Đang phân tích giọng nói...');
        await analyzeVoiceGender(selectedFile);

    } catch (err) {
        setError('Không thể xử lý tệp âm thanh. Tệp có thể bị hỏng hoặc có định dạng không được hỗ trợ.');
        console.error(err);
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [resetState, apiKeys, currentApiKeyIndex]);

  const handlePlayPrompt = useCallback((prompt: AudioPrompt) => {
    if (!audioBuffer || !audioContextRef.current) return;

    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.onended = null;
      sourceNodeRef.current = null;
    }

    if (playingPromptId === prompt.id) {
      setPlayingPromptId(null);
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start(0, prompt.startTime, prompt.duration);
    
    source.onended = () => {
      if (sourceNodeRef.current === source) {
        setPlayingPromptId(null);
        sourceNodeRef.current = null;
      }
    };

    sourceNodeRef.current = source;
    setPlayingPromptId(prompt.id);
  }, [audioBuffer, playingPromptId]);

  const handleTxtFileUpload = (txtFile: File) => {
    if (txtFile.type !== 'text/plain') {
        setError('Loại tệp không hợp lệ. Vui lòng tải lên tệp .txt.');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        setScriptText(text);
    };
    reader.onerror = () => {
        setError('Không thể đọc tệp .txt.');
    };
    reader.readAsText(txtFile);
  };
  
    const handleTranscribeAudio = async () => {
    if (!file) return;

    if (apiKeys.length === 0) {
        setIsApiKeyModalOpen(true);
        setTranscriptionError("Vui lòng thêm API key để tiếp tục.");
        return;
    }

    setIsTranscribing(true);
    setTranscriptionError(null);
    setStoryboard(null);

    let attemptedKeys = 0;
    let localApiKeyIndex = currentApiKeyIndex;
    
    while(attemptedKeys < apiKeys.length) {
        const keyToTry = apiKeys[localApiKeyIndex];
        attemptedKeys++;
        
        try {
            const ai = new GoogleGenAI({ apiKey: keyToTry });
            const base64Data = await fileToBase64(file);

            const audioPart = { inlineData: { mimeType: file.type, data: base64Data } };
            const textPart = { text: "Phiên âm tệp âm thanh này một cách chính xác. Chỉ cung cấp văn bản thô của lời nói, không có bất kỳ bình luận bổ sung nào, nhãn như 'NGƯỜI NÓI 1', hoặc các cụm từ giới thiệu như 'Đây là bản phiên âm:'." };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: { parts: [audioPart, textPart] },
            });
            
            setScriptText(response.text);
            setCurrentApiKeyIndex(localApiKeyIndex);
            localStorage.setItem('geminiApiKeyIndex', JSON.stringify(localApiKeyIndex));
            setIsTranscribing(false);
            return;

        } catch (err) {
            console.error(`API Key ${localApiKeyIndex + 1} failed:`, err);
            const isQuotaError = err instanceof Error && (err.message.includes('429') || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('resource has been exhausted'));
            
            if (isQuotaError) {
                localApiKeyIndex = (localApiKeyIndex + 1) % apiKeys.length;
            } else {
                setTranscriptionError("Đã xảy ra lỗi không mong muốn. Vui lòng kiểm tra console để biết chi tiết.");
                setIsTranscribing(false);
                return;
            }
        }
    }
    
    setTranscriptionError("Tất cả các API key đã hết hạn ngạch hoặc không hợp lệ. Vui lòng thêm key mới.");
    setIsTranscribing(false);
  };

  const handlePromptTextChange = (promptIndex: number, newText: string) => {
    if (!storyboard) return;

    setStoryboard(prev => {
        if (!prev) return null;
        const newStoryboardPrompts = [...prev.storyboard];
        if(newStoryboardPrompts[promptIndex]) {
            newStoryboardPrompts[promptIndex] = { ...newStoryboardPrompts[promptIndex], prompt: newText };
            return { ...prev, storyboard: newStoryboardPrompts };
        }
        return prev;
    });
  };

  const handleGenerateStoryboard = async () => {
    if (!scriptText.trim() || prompts.length === 0 || !file) return;
    
    if (apiKeys.length === 0) {
        setIsApiKeyModalOpen(true);
        setGenerationError("Vui lòng thêm API key để tạo storyboard.");
        return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setStoryboard(null);

    const averageDuration = prompts.length > 0 
        ? (prompts[prompts.length - 1].endTime / prompts.length).toFixed(1) 
        : CHUNK_DURATION;
    
    let attemptedKeys = 0;
    let localApiKeyIndex = currentApiKeyIndex;

    while(attemptedKeys < apiKeys.length) {
        const keyToTry = apiKeys[localApiKeyIndex];
        attemptedKeys++;

        try {
            const ai = new GoogleGenAI({ apiKey: keyToTry });

            const videoPromptSchema = {
                type: Type.OBJECT,
                properties: {
                  storyboard: { type: Type.ARRAY, description: `An array of ${prompts.length} video prompts, one for each audio segment.`, items: { type: Type.OBJECT, properties: { segment: { type: Type.NUMBER, description: "The sequential number of the segment, starting from 1." }, prompt: { type: Type.STRING, description: "A detailed, cinematic video prompt for this segment." } }, required: ["segment", "prompt"] } },
                  characterDescriptions: { type: Type.STRING, description: "A detailed description of the main characters to ensure consistency. Use newlines to separate characters." },
                  settingDescription: { type: Type.STRING, description: "A detailed description of the main setting/environment to ensure consistency." }
                },
                required: ["storyboard", "characterDescriptions", "settingDescription"]
            };
            
            const promptRequirements: string[] = [];

            if (generationStyle === 'narrative') {
                promptRequirements.push("**Style:** The audio is a voice-over, discussion, or narration. The generated video prompts should be for illustrative B-roll footage that visualizes the topics being discussed. **DO NOT** show the narrator/speaker. The visuals should complement the audio, like in a documentary.");
                promptRequirements.push("**Character Descriptions:** If illustrative scenes might contain people, describe them here. Otherwise, describe the overall visual style or recurring motifs. The speaker is NOT a character to be visualized.");
            } else {
                promptRequirements.push("**Style:** The script contains dialogue or direct actions from characters. The video prompts should depict these characters speaking and performing the actions described.");
                promptRequirements.push("**Character Descriptions:** Provide detailed descriptions for the main characters. This is crucial for maintaining visual consistency across all video clips. Describe each character on a new line.");
            }

            if (characterCount !== 'auto') {
                promptRequirements.push(`**Number of Characters:** The story MUST revolve around exactly ${characterCount} main character(s). All character descriptions and scene prompts must strictly adhere to this number to maintain consistency. Do not introduce more characters than specified.`);
            }

            if (characterNationality && characterNationality !== 'default') {
                promptRequirements.push(`**Character Nationality:** The characters MUST be described as ${characterNationality}. Ensure their appearance, clothing, and context are consistent with people from that nationality. This is a strict requirement.`);
            }

            if (voiceGender && voiceGender.toLowerCase() !== 'unknown') {
                let description = '';
                switch (voiceGender.toLowerCase()) {
                    case 'male':
                        description = 'The primary speaker is male. Reflect this in the character descriptions (e.g., "a male news anchor," "a man in his 40s").';
                        break;
                    case 'female':
                        description = 'The primary speaker is female. Reflect this in the character descriptions (e.g., "a female reporter," "a woman in her 30s").';
                        break;
                    case 'mixed':
                        description = 'There are multiple speakers of different genders. Create distinct character descriptions, noting their likely gender based on the dialogue.';
                        break;
                }
                if(description) {
                    promptRequirements.push(`**Voice Profile:** ${description}`);
                }
            }

            promptRequirements.push(`**Scene Prompts:** Generate a list of exactly ${prompts.length} distinct video prompts, one for each audio segment.`);
            promptRequirements.push(`**Cinematic Language:** Each prompt must be a richly descriptive paragraph. Include details on camera angles (e.g., "wide shot," "close-up"), character actions, emotions, lighting, and environment. Each prompt should be a single paragraph with no internal line breaks.`);
            promptRequirements.push(`**Consistency:** Ensure the character and setting descriptions are consistently applied across all storyboard prompts.`);
            
            const numberedRequirements = promptRequirements.map((req, index) => `${index + 1}. ${req}`).join('\n\n');

            const userPrompt = `You are a creative director for a short film. The film will be generated using a text-to-video AI model called Veo. The audio for this film has been split into ${prompts.length} segments, each approximately ${averageDuration} seconds long. Based on the following script/summary, create a coherent video storyboard.
            **Key Requirements:**
            ${numberedRequirements}
            
            **User-Provided Audio Script/Summary:**
            ---
            ${scriptText}
            ---
            Please provide your response in the requested JSON format.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: userPrompt,
                config: { responseMimeType: "application/json", responseSchema: videoPromptSchema },
            });
            
            const parsedStoryboard = JSON.parse(response.text) as Storyboard;
            setStoryboard(parsedStoryboard);

            const newEntry: HistoryEntry = { id: `${Date.now()}-${file.name}`, timestamp: Date.now(), fileName: file.name, prompts, scriptText, storyboard: parsedStoryboard, voiceGender, characterNationality, generationStyle, characterCount };
            saveHistory([newEntry, ...history]);
            
            setCurrentApiKeyIndex(localApiKeyIndex);
            localStorage.setItem('geminiApiKeyIndex', JSON.stringify(localApiKeyIndex));
            setIsGenerating(false);
            return;

        } catch(err) {
            console.error(`API Key ${localApiKeyIndex + 1} failed:`, err);
            const isQuotaError = err instanceof Error && (err.message.includes('429') || err.message.toLowerCase().includes('quota') || err.message.toLowerCase().includes('resource has been exhausted'));

            if (isQuotaError) {
                localApiKeyIndex = (localApiKeyIndex + 1) % apiKeys.length;
            } else {
                setGenerationError('Không thể tạo kịch bản phân cảnh. Mô hình có thể không khả dụng hoặc yêu cầu không thể xử lý. Vui lòng thử lại.');
                setIsGenerating(false);
                return;
            }
        }
    }
    
    setGenerationError('Tất cả các API key đã hết hạn ngạch hoặc không hợp lệ. Vui lòng thêm key mới.');
    setIsGenerating(false);
  };

  const loadHistoryEntry = (id: string) => {
    const entry = history.find(item => item.id === id);
    if (entry) {
        resetState();
        setFile({ name: entry.fileName, type: 'audio/mpeg' } as File); // Mock file for name display
        setPrompts(entry.prompts);
        setScriptText(entry.scriptText);
        setStoryboard(entry.storyboard);
        setVoiceGender(entry.voiceGender || null);
        setCharacterNationality(entry.characterNationality || 'default');
        setGenerationStyle(entry.generationStyle || 'direct');
        setCharacterCount(entry.characterCount || 'auto');
        setAudioBuffer(null); // IMPORTANT: No audio buffer for history items
        setIsHistoryPanelOpen(false);
    }
  };

  const deleteHistoryEntry = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    saveHistory(updatedHistory);
  };
  
  const clearAllHistory = () => {
    saveHistory([]);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center h-full"><Spinner message={loadingMessage} /></div>;
    }
    if (error) {
      return (
        <div className="text-center p-8 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-xl font-semibold text-red-300">Đã xảy ra lỗi</p>
          <p className="text-red-400 mt-2">{error}</p>
          <button onClick={resetState} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md">
            Thử lại
          </button>
        </div>
      );
    }
    if (prompts.length > 0 && file) {
      return (
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <AnalysisPanel 
                prompts={prompts}
                playingPromptId={playingPromptId}
                onPlayPrompt={handlePlayPrompt}
                fileName={file.name}
                isPlaybackEnabled={!!audioBuffer}
                voiceGender={voiceGender}
            />
            <StoryboardPanel 
                fileName={file.name}
                isPlaybackEnabled={!!audioBuffer}
                onTranscribeAudio={handleTranscribeAudio}
                isTranscribing={isTranscribing}
                transcriptionError={transcriptionError}
                scriptText={scriptText}
                onScriptTextChange={setScriptText}
                onTxtFileUpload={handleTxtFileUpload}
                onGenerateStoryboard={handleGenerateStoryboard}
                isGenerating={isGenerating}
                generationError={generationError}
                storyboard={storyboard}
                onPromptTextChange={handlePromptTextChange}
                characterNationality={characterNationality}
                onCharacterNationalityChange={setCharacterNationality}
                generationStyle={generationStyle}
                onGenerationStyleChange={setGenerationStyle}
                characterCount={characterCount}
                onCharacterCountChange={setCharacterCount}
            />
        </div>
      );
    }
    return <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 relative">
       <HistoryPanel 
            isOpen={isHistoryPanelOpen}
            onClose={() => setIsHistoryPanelOpen(false)}
            history={history}
            onLoad={loadHistoryEntry}
            onDelete={deleteHistoryEntry}
            onClearAll={clearAllHistory}
        />
        <ApiKeyModal
            isOpen={isApiKeyModalOpen}
            onClose={() => setIsApiKeyModalOpen(false)}
            onSave={handleSaveApiKeys}
            currentKeys={apiKeys}
        />
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center mb-10">
         <button 
            onClick={resetState}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-semibold transition-colors text-sm"
        >
            <PlusIcon className="w-5 h-5"/>
            Phiên Mới
        </button>
        <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Âm thanh sang <span className="text-cyan-400">Storyboard</span>
            </h1>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsApiKeyModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-semibold transition-colors text-sm"
                aria-label="Cài đặt API Key"
            >
                <KeyIcon className="w-5 h-5"/>
                <span className="hidden sm:inline">API Key</span>
            </button>
            <button 
                onClick={() => setIsHistoryPanelOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white font-semibold transition-colors text-sm"
            >
                <HistoryIcon className="w-5 h-5"/>
                <span className="hidden sm:inline">Lịch sử</span>
            </button>
        </div>
      </header>
       <p className="text-lg text-gray-400 max-w-2xl mx-auto text-center -mt-4 mb-10">
          Tải lên âm thanh, cung cấp kịch bản, sau đó tạo một kịch bản phân cảnh video có thể chỉnh sửa cho Veo.
        </p>
      <main className="w-full flex items-center justify-center flex-grow">
        {renderContent()}
      </main>
      <footer className="text-center text-gray-500 mt-12 text-sm">
        <p>Xây dựng với React, TypeScript, và Tailwind CSS. Hỗ trợ bởi Web Audio API và Gemini.</p>
      </footer>
    </div>
  );
};

export default App;