import React from 'react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { chatService, UserSettings } from '@/api/chat.service';
import { useConversationsContext } from '@/context/ConversationsContext';
import { Check, X, Settings2 } from 'lucide-react';

interface GlobalChatSettingsProps {
  onClose: () => void;
}

export const GlobalChatSettings: React.FC<GlobalChatSettingsProps> = ({ onClose }) => {
  const { globalSettings: contextSettings, setGlobalSettings } = useConversationsContext();
  const [settings, setSettings] = React.useState<UserSettings | null>(contextSettings);
  const [isLoading, setIsLoading] = React.useState(!contextSettings);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await chatService.getGlobalSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (updates: Partial<UserSettings>) => {
    if (!settings) return;
    try {
      setIsUpdating(true);
      const updated = await chatService.updateGlobalSettings(updates);
      setSettings(updated);
      setGlobalSettings(updated); // Sync with context for instant UI updates
    } catch (err) {
      console.error('Failed to update settings', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleReceipts = () => {
    if (!settings) return;
    handleUpdate({ showReadReceipts: !settings.showReadReceipts });
  };

  const handleToggleBadges = () => {
    if (!settings) return;
    // muteUnreadBadges: true means hiding them, so toggle means reversing that logic for the user UI
    handleUpdate({ muteUnreadBadges: !settings.muteUnreadBadges });
  };




  if (isLoading) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[100] p-6 animate-in fade-in duration-300">
      <div className="max-w-md mx-auto bg-background border border-border rounded-2xl shadow-2xl p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground/30" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Settings2 className="w-6 h-6 text-primary" />
          <Text weight="bold" className="text-xl">Chat Settings</Text>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Text weight="semibold">Read Receipts</Text>
              <Text size="sm" muted className="text-xs mt-0.5">
                Let others know when you&apos;ve read their messages.
              </Text>
            </div>
            <button 
              onClick={handleToggleReceipts}
              disabled={isUpdating}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                settings?.showReadReceipts ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                settings?.showReadReceipts ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Text weight="semibold">Message Counts</Text>
              <Text size="sm" muted className="text-xs mt-0.5">
                Display unread message bubbles in your chat list.
              </Text>
            </div>
            <button 
              onClick={handleToggleBadges}
              disabled={isUpdating}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                !settings?.muteUnreadBadges ? 'bg-primary' : 'bg-muted-foreground/20'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                !settings?.muteUnreadBadges ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>


          <div className="pt-4 border-t border-border/50">
            <Button 
                variant="outline" 
                fullWidth 
                onClick={onClose}
                className="rounded-xl border-border/40"
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
