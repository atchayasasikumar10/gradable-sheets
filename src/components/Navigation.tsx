import { Link, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/80">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="bg-gradient-primary bg-clip-text text-transparent">Gradient</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`transition-colors ${isActive('/') ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Home
            </Link>
            <Link 
              to="/upload-template" 
              className={`transition-colors ${isActive('/upload-template') ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Upload Template
            </Link>
            <Link 
              to="/upload-sheets" 
              className={`transition-colors ${isActive('/upload-sheets') ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Upload Sheets
            </Link>
            <Link 
              to="/evaluation" 
              className={`transition-colors ${isActive('/evaluation') ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Evaluation
            </Link>
            <Link 
              to="/results" 
              className={`transition-colors ${isActive('/results') ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Results
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
