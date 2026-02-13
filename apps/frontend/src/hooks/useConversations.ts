import { useConversationsContext } from '../context/ConversationsContext';

export function useConversations() {
  return useConversationsContext();
}
