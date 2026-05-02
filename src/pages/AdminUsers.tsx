import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import { Search, UserCog, Trash2, ShieldCheck, User, Eye } from 'lucide-react';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users. You might not have permission.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        role: editingUser.role,
      });
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      toast({
        title: 'Success',
        description: 'User deleted successfully.',
      });
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">
            <ShieldCheck className="w-3 h-3 mr-1" /> Admin
          </Badge>
        );
      case 'user':
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">
            <User className="w-3 h-3 mr-1" /> User
          </Badge>
        );
      case 'viewer':
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-gray-200">
            <Eye className="w-3 h-3 mr-1" /> Viewer
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold tracking-tight mb-1">
                User Management
              </h1>
              <p className="text-[var(--text-secondary)]">
                View and manage all registered users and their access roles.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-2 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" />
            <Input
              placeholder="Search users..."
              className="pl-10 h-11 rounded-xl bg-[var(--bg-secondary)] border-[var(--border)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-[var(--border)]">
          <Table>
            <TableHeader className="bg-[var(--bg-secondary)]">
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="h-16 animate-pulse bg-[var(--bg-secondary)]/50" />
                  </TableRow>
                ))
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-[var(--text-secondary)]">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <TableRow key={u.id} className="group">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        {u.name}
                        {u.id === Number(currentUser?.id) && (
                          <span className="text-[10px] bg-[var(--accent-soft)] text-[var(--accent)] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-[var(--text-secondary)]">{u.email}</TableCell>
                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                    <TableCell className="text-[var(--text-secondary)] text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                          onClick={() => {
                            setEditingUser(u);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                          disabled={u.id === Number(currentUser?.id)}
                          onClick={() => {
                            setUserToDelete(u);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Permissions</DialogTitle>
            <DialogDescription>
              Change user's name and access role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser(editingUser ? { ...editingUser, name: e.target.value } : null)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={editingUser?.role || 'user'}
                onValueChange={(val: any) => setEditingUser(editingUser ? { ...editingUser, role: val } : null)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} className="gradient-primary text-white rounded-xl">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete **{userToDelete?.name}**? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="rounded-xl">
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminUsers;
