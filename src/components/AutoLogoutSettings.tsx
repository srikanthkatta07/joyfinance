import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Shield, Clock, Eye, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AutoLogoutSettingsProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AutoLogoutSettings({ open: externalOpen, onOpenChange: externalOnOpenChange }: AutoLogoutSettingsProps = {}) {
  const { autoLogoutSettings, updateAutoLogoutSettings } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(autoLogoutSettings);

  const handleSave = () => {
    updateAutoLogoutSettings(tempSettings);
    toast.success('Auto-logout settings saved');
    const newOpen = false;
    setIsOpen(newOpen);
    externalOnOpenChange?.(newOpen);
  };

  const handleCancel = () => {
    setTempSettings(autoLogoutSettings);
    const newOpen = false;
    setIsOpen(newOpen);
    externalOnOpenChange?.(newOpen);
  };

  // Use external open state if provided, otherwise use internal state
  const dialogOpen = externalOpen !== undefined ? externalOpen : isOpen;
  const setDialogOpen = externalOnOpenChange || setIsOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Auto-Logout Security Settings
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Logout on App Switch */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Logout when switching apps
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically logout when you switch to another app
                </p>
              </div>
              <Switch
                checked={tempSettings.logoutOnVisibilityChange}
                onCheckedChange={(checked) =>
                  setTempSettings(prev => ({ ...prev, logoutOnVisibilityChange: checked }))
                }
              />
            </div>

            {/* Logout on Screen Lock */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Logout when screen locks
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically logout when your device screen locks
                </p>
              </div>
              <Switch
                checked={tempSettings.logoutOnScreenLock}
                onCheckedChange={(checked) =>
                  setTempSettings(prev => ({ ...prev, logoutOnScreenLock: checked }))
                }
              />
            </div>

            {/* Idle Timeout */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Idle timeout (minutes)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="120"
                  value={tempSettings.idleTimeoutMinutes}
                  onChange={(e) =>
                    setTempSettings(prev => ({ 
                      ...prev, 
                      idleTimeoutMinutes: Math.max(0, parseInt(e.target.value) || 0) 
                    }))
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Set to 0 to disable idle timeout
              </p>
            </div>

            {/* Security Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-blue-900">Security Notice</h4>
                    <p className="text-sm text-blue-800">
                      Auto-logout helps protect your financial data when you're not actively using the app. 
                      These settings are stored locally on your device.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Settings
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
  );
}
