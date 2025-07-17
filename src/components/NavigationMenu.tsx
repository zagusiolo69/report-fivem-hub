import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Home } from "lucide-react";

export function NavigationMenu() {
  const location = useLocation();

  return (
    <div className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-lg mb-6">
      <div className="container mx-auto flex justify-between items-center h-16 px-4">
        {/* Logo i nazwa */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">FiveM Reports</span>
          </Link>
        </div>
        
        {/* Nawigacja */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/">
            <Button 
              variant={location.pathname === '/' ? "default" : "ghost"} 
              size="sm" 
              className="hidden sm:flex"
            >
              <Home className="w-4 h-4 mr-2" />
              Strona Główna
            </Button>
            <Button 
              variant={location.pathname === '/' ? "default" : "ghost"} 
              size="sm" 
              className="sm:hidden"
            >
              <Home className="w-4 h-4" />
            </Button>
          </Link>
          
          <Link to="/report">
            <Button 
              variant={location.pathname === '/report' ? "default" : "ghost"} 
              size="sm"
              className="hidden sm:flex"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Zgłoś Problem
            </Button>
            <Button 
              variant={location.pathname === '/report' ? "default" : "ghost"} 
              size="sm"
              className="sm:hidden"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          </Link>
          
          <Link to="/admin">
            <Button 
              variant={location.pathname === '/admin' ? "default" : "ghost"} 
              size="sm"
              className="hidden sm:flex"
            >
              <Shield className="w-4 h-4 mr-2" />
              Panel Admina
            </Button>
            <Button 
              variant={location.pathname === '/admin' ? "default" : "ghost"} 
              size="sm"
              className="sm:hidden"
            >
              <Shield className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}