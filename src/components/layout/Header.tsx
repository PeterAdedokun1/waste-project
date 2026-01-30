import { Button } from "@/components/ui/button";
import { Recycle, Menu, X, User, LogOut, MessageCircle, Package, BarChart3, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const fetchUnread = async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", user.id)
        .is("read_at", null);
      setUnreadCount(count || 0);
    };

    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(data === true);
    };

    fetchUnread();
    checkAdmin();

    const channel = supabase
      .channel("header-messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchUnread()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center shadow-soft">
              <Recycle className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              WasteFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/browse" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Browse Listings
            </Link>
            <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              How it Works
            </a>
            <a href="/#about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              About
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-hero-gradient flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-medium">{profile?.full_name || "Account"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="cursor-pointer flex items-center justify-between">
                      Messages
                      {unreadCount > 0 && (
                        <Badge variant="default" className="ml-2 h-5 min-w-5 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-listings" className="cursor-pointer">
                      My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-offers" className="cursor-pointer">
                      My Offers
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-orders" className="cursor-pointer">
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/analytics" className="cursor-pointer">
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/create-listing" className="cursor-pointer">
                      Create Listing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link to="/browse" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Browse Listings
              </Link>
              <a href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                How it Works
              </a>
              <a href="/#about" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                About
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-between" asChild>
                      <Link to="/messages">
                        <span className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Messages
                        </span>
                        {unreadCount > 0 && (
                          <Badge variant="default" className="h-5 min-w-5 text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/my-listings">My Listings</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/my-offers">My Offers</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/my-orders">
                        <Package className="w-4 h-4 mr-2" />
                        My Orders
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/analytics">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link to="/admin">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/create-listing">Create Listing</Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link to="/profile">Edit Profile</Link>
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button variant="hero" className="w-full" asChild>
                      <Link to="/signup">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
