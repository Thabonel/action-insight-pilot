import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAIAutocomplete, AutocompleteContext } from '@/hooks/useAIAutocomplete';
import { cn } from '@/lib/utils';

interface AIAutocompleteInputProps {
  field: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  context?: AutocompleteContext;
  multiline?: boolean;
  className?: string;
  disabled?: boolean;
}

export const AIAutocompleteInput: React.FC<AIAutocompleteInputProps> = ({
  field,
  value,
  onChange,
  placeholder,
  context = {},
  multiline = false,
  className,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading, getSuggestions, clearSuggestions } = useAIAutocomplete(
    field,
    context
  );

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    getSuggestions(newValue);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    clearSuggestions();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 200);
  };

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="relative">
      <div className="relative">
        <InputComponent
          ref={inputRef as React.RefObject<HTMLInputElement & HTMLTextAreaElement>}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className={cn(
            "pr-10",
            className
          )}
          disabled={disabled}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
            ...
          </div>
        )}

        {!isLoading && suggestions.length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-xs">
            AI
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <Card
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto border shadow-lg bg-background"
        >
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left h-auto p-3 rounded-none border-0",
                index === selectedIndex && "bg-accent",
                index !== suggestions.length - 1 && "border-b"
              )}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm leading-relaxed break-words">
                  {suggestion}
                </span>
              </div>
            </Button>
          ))}
        </Card>
      )}
    </div>
  );
};