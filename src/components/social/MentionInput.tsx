import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandList, CommandGroup, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useAIAutocomplete } from '@/hooks/useAIAutocomplete';
import { Hash, AtSign } from 'lucide-react';

interface MentionInputProps {
  value: string;
  onChange: (content: string, mentions: string[], hashtags: string[]) => void;
  platform: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  platform,
  placeholder = "What would you like to share? Use @ to mention and # for hashtags...",
  className,
  disabled = false
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'mention' | 'hashtag' | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    suggestions: mentionSuggestions,
    getSuggestions: getMentionSuggestions,
    clearSuggestions: clearMentionSuggestions,
    isLoading: isLoadingMentions
  } = useAIAutocomplete('mentions', { platform });

  const {
    suggestions: hashtagSuggestions,
    getSuggestions: getHashtagSuggestions,
    clearSuggestions: clearHashtagSuggestions,
    isLoading: isLoadingHashtags
  } = useAIAutocomplete('hashtags', { platform, postContent: value });

  // Extract mentions and hashtags from text
  const extractMentionsAndHashtags = (text: string) => {
    const mentions = (text.match(/@\w+/g) || []);
    const hashtags = (text.match(/#\w+/g) || []);
    return { mentions, hashtags };
  };

  // Detect @ or # triggers
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    // Check for @ or # trigger
    const beforeCursor = newValue.slice(0, cursorPos);
    const atMatch = beforeCursor.match(/@(\w*)$/);
    const hashMatch = beforeCursor.match(/#(\w*)$/);

    if (atMatch) {
      setSuggestionType('mention');
      setShowSuggestions(true);
      getMentionSuggestions(atMatch[1]);
    } else if (hashMatch) {
      setSuggestionType('hashtag');
      setShowSuggestions(true);
      getHashtagSuggestions(hashMatch[1]);
    } else {
      setShowSuggestions(false);
      clearMentionSuggestions();
      clearHashtagSuggestions();
    }

    // Extract mentions and hashtags
    const { mentions, hashtags } = extractMentionsAndHashtags(newValue);
    onChange(newValue, mentions, hashtags);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart || 0;
    const beforeCursor = value.slice(0, cursorPos);
    const afterCursor = value.slice(cursorPos);

    // Replace the @word or #word with selected suggestion
    const regex = suggestionType === 'mention' ? /@\w*$/ : /#\w*$/;
    const newBefore = beforeCursor.replace(regex, suggestion + ' ');

    const newValue = newBefore + afterCursor;
    const { mentions, hashtags } = extractMentionsAndHashtags(newValue);

    onChange(newValue, mentions, hashtags);
    setShowSuggestions(false);
    clearMentionSuggestions();
    clearHashtagSuggestions();

    // Restore focus
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(newBefore.length, newBefore.length);
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && (e.key === 'Escape')) {
      e.preventDefault();
      setShowSuggestions(false);
      clearMentionSuggestions();
      clearHashtagSuggestions();
    }
  };

  const currentSuggestions = suggestionType === 'mention'
    ? mentionSuggestions
    : hashtagSuggestions;

  const isLoadingSuggestions = suggestionType === 'mention'
    ? isLoadingMentions
    : isLoadingHashtags;

  const { mentions, hashtags } = extractMentionsAndHashtags(value);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className || "min-h-24"}
        disabled={disabled}
      />

      {/* Autocomplete Dropdown */}
      {showSuggestions && (currentSuggestions.length > 0 || isLoadingSuggestions) && (
        <div className="absolute z-50 w-64 mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
          <Command>
            <CommandList>
              <CommandGroup>
                {isLoadingSuggestions && (
                  <div className="p-2 text-sm text-gray-500 flex items-center justify-center">
                    <span className="animate-pulse">Loading suggestions...</span>
                  </div>
                )}
                {!isLoadingSuggestions && currentSuggestions.length === 0 && (
                  <div className="p-2 text-sm text-gray-500 text-center">
                    No suggestions found
                  </div>
                )}
                {!isLoadingSuggestions && currentSuggestions.map((suggestion, idx) => (
                  <CommandItem
                    key={idx}
                    onSelect={() => handleSelectSuggestion(suggestion)}
                    className="cursor-pointer"
                  >
                    {suggestionType === 'mention' ? (
                      <AtSign className="h-3 w-3 mr-2 text-blue-600" />
                    ) : (
                      <Hash className="h-3 w-3 mr-2 text-purple-600" />
                    )}
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}

      {/* Display extracted tags */}
      {(mentions.length > 0 || hashtags.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {mentions.map((mention, idx) => (
            <Badge
              key={`mention-${idx}`}
              variant="secondary"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              <AtSign className="h-3 w-3 mr-1" />
              {mention}
            </Badge>
          ))}
          {hashtags.map((tag, idx) => (
            <Badge
              key={`tag-${idx}`}
              variant="outline"
              className="border-purple-300 text-purple-700"
            >
              <Hash className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
