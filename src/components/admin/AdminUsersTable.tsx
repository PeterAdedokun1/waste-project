import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { UserX, UserCheck, Shield, Search } from "lucide-react";
import { format } from "date-fns";

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  user_type: string;
  location: string | null;
  is_suspended: boolean;
  suspended_at: string | null;
  suspended_reason: string | null;
  created_at: string;
}

interface AdminUsersTableProps {
  profiles: AdminProfile[];
  onSuspend: (userId: string, reason: string) => Promise<boolean>;
  onUnsuspend: (userId: string) => Promise<boolean>;
  onMakeAdmin: (userId: string) => Promise<boolean>;
  onRefresh: () => void;
}

const AdminUsersTable = ({
  profiles,
  onSuspend,
  onUnsuspend,
  onMakeAdmin,
  onRefresh,
}: AdminUsersTableProps) => {
  const [search, setSearch] = useState("");
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredProfiles = profiles.filter(
    (p) =>
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async () => {
    if (!selectedUser || !suspendReason.trim()) return;
    setLoading(true);
    const success = await onSuspend(selectedUser.user_id, suspendReason);
    if (success) {
      setSuspendDialogOpen(false);
      setSuspendReason("");
      setSelectedUser(null);
      onRefresh();
    }
    setLoading(false);
  };

  const handleUnsuspend = async (userId: string) => {
    setLoading(true);
    const success = await onUnsuspend(userId);
    if (success) onRefresh();
    setLoading(false);
  };

  const handleMakeAdmin = async (userId: string) => {
    setLoading(true);
    const success = await onMakeAdmin(userId);
    if (success) onRefresh();
    setLoading(false);
  };

  const getUserTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      generator: "bg-blue-100 text-blue-800",
      middleman: "bg-purple-100 text-purple-800",
      recycler: "bg-green-100 text-green-800",
    };
    return (
      <Badge variant="secondary" className={colors[type] || ""}>
        {type}
      </Badge>
    );
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {profile.full_name || "No name"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {profile.email}
                    </div>
                    {profile.company_name && (
                      <div className="text-xs text-muted-foreground">
                        {profile.company_name}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getUserTypeBadge(profile.user_type)}</TableCell>
                <TableCell>{profile.location || "—"}</TableCell>
                <TableCell>
                  {profile.is_suspended ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(profile.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {profile.is_suspended ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnsuspend(profile.user_id)}
                        disabled={loading}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Unsuspend
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedUser(profile);
                          setSuspendDialogOpen(true);
                        }}
                        disabled={loading}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMakeAdmin(profile.user_id)}
                      disabled={loading}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Make Admin
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProfiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspending {selectedUser?.full_name || selectedUser?.email}. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for suspension..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={loading || !suspendReason.trim()}
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsersTable;
