import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Theme } from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';

const Picker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => <div className="w-[350px] h-[450px] bg-background animate-pulse rounded-xl" />
});

interface EmojiPickerProps {
  onEmojiClick: (emojiData: EmojiClickData) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiClick }) => {
  const { resolvedTheme } = useTheme();
  
  const theme = resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT;

  return (
    <div className="absolute bottom-full mb-2 left-0 shadow-xl rounded-xl border border-border overflow-hidden z-50">
      <Picker
        onEmojiClick={onEmojiClick}
        theme={theme}
        lazyLoadEmojis={true}
        height={400}
        width={320}
        previewConfig={{
          showPreview: false
        }}
      />
    </div>
  );
};
