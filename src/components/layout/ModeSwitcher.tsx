import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Eye, ToggleLeft } from 'lucide-react';
import { useUserMode } from '@/hooks/useUserMode';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ModeSwitcher: React.FC = () => {
  const { mode, setMode } = useUserMode();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSwitchToSimple = async () => {
    await setMode('simple');
    toast({
      title: 'Switched to Simple Mode',
      description: 'Showing your autopilot dashboard with simplified view',
    });
    navigate('/app/autopilot');
  };

  const handleSwitchToAdvanced = async () => {
    await setMode('advanced');
    toast({
      title: 'Switched to Advanced Mode',
      description: 'Full marketing platform features now available',
    });
    navigate('/app/conversational-dashboard');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {mode === 'simple' ? (
            <>
              <ToggleLeft className="h-4 w-4" />
              Simple Mode
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Advanced Mode
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Interface Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Simple Mode Option */}
        <DropdownMenuItem
          onClick={handleSwitchToSimple}
          className="flex-col items-start py-3 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Simple Mode</span>
            </div>
            {mode === 'simple' && <Badge className="bg-blue-600">Active</Badge>}
          </div>
          <p className="text-xs text-gray-600">
            Autopilot dashboard with weekly results and lead inbox. Perfect for hands-off marketing.
          </p>
        </DropdownMenuItem>

        {/* Advanced Mode Option */}
        <DropdownMenuItem
          onClick={handleSwitchToAdvanced}
          className="flex-col items-start py-3 cursor-pointer"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Advanced Mode</span>
            </div>
            {mode === 'advanced' && <Badge className="bg-purple-600">Active</Badge>}
          </div>
          <p className="text-xs text-gray-600">
            Full access to all marketing tools, analytics, and campaign controls. For power users.
          </p>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <div className="px-2 py-2 text-xs text-gray-500">
          <Eye className="h-3 w-3 inline mr-1" />
          You can switch modes anytime
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ModeSwitcher;
