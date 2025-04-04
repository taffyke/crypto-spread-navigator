
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Settings } from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 py-3 px-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <Link to="/" className="text-white font-bold text-xl flex items-center">
          <img src="/logo.svg" alt="CryptoArb" className="h-8 w-8 mr-2" />
          <span>CryptoArb</span>
        </Link>
        
        <nav className="hidden md:flex ml-8">
          <Link to="/" className="text-slate-300 hover:text-white px-3 py-1 transition-colors">
            Dashboard
          </Link>
          <Link to="/scanner" className="text-slate-300 hover:text-white px-3 py-1 transition-colors">
            Scanner
          </Link>
          <Link to="/charts/BTC/USDT" className="text-slate-300 hover:text-white px-3 py-1 transition-colors">
            Charts
          </Link>
          <Link to="/bots" className="text-slate-300 hover:text-white px-3 py-1 transition-colors">
            Bots
          </Link>
        </nav>
      </div>
      
      <div className="flex items-center space-x-3">
        <GlobalSearch />
        
        <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full">
          <Bell size={20} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-full">
              <User size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-2 bg-slate-800 border-slate-700 text-white">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem className="focus:bg-slate-700 cursor-pointer text-red-400 focus:text-red-300">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
