import { Settings } from 'lucide-react';
import EmptyChatMessageInput from './EmptyChatMessageInput';
import { File } from './ChatWindow';
import Link from 'next/link';
import WeatherWidget from './WeatherWidget';
import NewsArticleWidget from './NewsArticleWidget';
import WalletConnection, { WalletConnectionHeader } from './wallet/WalletConnection';
import InfoBanner from './InfoBanner';
import { useIsSignedIn } from '@coinbase/cdp-hooks';

const EmptyChat = ({
  sendMessage,
  focusMode,
  setFocusMode,
  optimizationMode,
  setOptimizationMode,
  fileIds,
  setFileIds,
  files,
  setFiles,
}: {
  sendMessage: (message: string) => void;
  focusMode: string;
  setFocusMode: (mode: string) => void;
  optimizationMode: string;
  setOptimizationMode: (mode: string) => void;
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
}) => {
  const { isSignedIn } = useIsSignedIn();

  return (
    <div className="relative">
      <div className="absolute w-full flex flex-row items-center justify-between px-5 mt-5 z-10">
        <div></div>
        <div className="flex items-center space-x-4">
          <WalletConnectionHeader />
          <Link href="/settings">
            <Settings className="cursor-pointer lg:hidden" />
          </Link>
        </div>
      </div>
      
      {/* Info Banner - Positioned below header to avoid overlap */}
      <div className="fixed top-16 left-0 right-0 z-50">
        <InfoBanner />
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen max-w-screen-sm mx-auto p-2 space-y-4">
        <div className="flex flex-col items-center justify-center w-full space-y-8">
          <h2 className="text-black/70 dark:text-white/70 text-3xl font-medium -mt-8">
            Research begins here.
          </h2>
          <EmptyChatMessageInput
            sendMessage={sendMessage}
            focusMode={focusMode}
            setFocusMode={setFocusMode}
            optimizationMode={optimizationMode}
            setOptimizationMode={setOptimizationMode}
            fileIds={fileIds}
            setFileIds={setFileIds}
            files={files}
            setFiles={setFiles}
          />
        </div>
        <div className="flex flex-col w-full gap-4 mt-2 sm:flex-row sm:justify-center">
          <div className="flex-1 w-full">
            <WeatherWidget />
          </div>
          <div className="flex-1 w-full">
            <NewsArticleWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;
