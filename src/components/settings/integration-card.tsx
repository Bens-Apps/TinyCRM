import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function IntegrationCard({
  name,
  description,
  icon,
  connected,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          {icon}
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">{name}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {connected ? (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">Connected</Badge>
            {onDisconnect && (
              <Button variant="outline" size="sm" onClick={onDisconnect}>Disconnect</Button>
            )}
          </div>
        ) : (
          onConnect && <Button size="sm" onClick={onConnect}>Connect</Button>
        )}
      </CardHeader>
    </Card>
  );
}
