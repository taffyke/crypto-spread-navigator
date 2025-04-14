
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ScannerHeaderProps {
  onRefresh: () => void;
  onDownload: () => void;
  data: any[];
}

export function ScannerHeader({ onRefresh, onDownload, data }: ScannerHeaderProps) {
  return (
    <Card className="bg-slate-800 border-slate-700 mb-6">
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Arbitrage Opportunities</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
