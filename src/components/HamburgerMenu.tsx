import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  Key, 
  Settings, 
  LogOut, 
  User,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ChangePassword } from './ChangePassword';
import { AutoLogoutSettings } from './AutoLogoutSettings';

export function HamburgerMenu() {
  const { user, signOut } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAutoLogoutSettings, setShowAutoLogoutSettings] = useState(false);

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await signOut();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* User Info */}
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <p className="text-sm font-medium">{user?.display_name || user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.mobile_number}</p>
              </div>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Security Settings */}
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Security
            </p>
          </div>
          
          <DropdownMenuItem 
            onClick={() => setShowChangePassword(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Key className="h-4 w-4" />
            <span>Change Password</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setShowAutoLogoutSettings(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>Auto-Logout Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Logout */}
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modals */}
      <ChangePassword 
        open={showChangePassword} 
        onOpenChange={setShowChangePassword} 
      />
      
      <AutoLogoutSettings 
        open={showAutoLogoutSettings} 
        onOpenChange={setShowAutoLogoutSettings} 
      />
    </>
  );
}
