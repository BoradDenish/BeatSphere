import { useEffect, useState } from 'react';
import {
  Users,
  Music,
  Video,
  Shield,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Crown,
  Play,
  Eye,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/stores/authStore';
import { useMusicStore } from '@/stores/musicStore';
import { usersAPI } from '@/lib/api';
import { formatPlays, cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  mediaCount?: number;
}

export function AdminPage() {
  const { user } = useAuthStore();
  const { media, fetchMedia, deleteMedia } = useMusicStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchMedia({ limit: 50 });
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll({ limit: 100 });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const [deleteUserConfirm, setDeleteUserConfirm] = useState<number | null>(null);
  const [deleteMediaConfirm, setDeleteMediaConfirm] = useState<number | null>(null);

  const handleEditUser = async (userId: number, updates: Partial<AdminUser>) => {
    try {
      await usersAPI.update(userId, updates);
      toast({ title: 'User updated', description: 'Changes saved successfully.', variant: 'success' });
      fetchUsers();
      setEditUser(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user.', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await usersAPI.delete(userId);
      toast({ title: 'User deleted', description: 'User has been removed.', variant: 'destructive' });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
    }
    setDeleteUserConfirm(null);
  };

  const handleDeleteMedia = async (id: number) => {
    await deleteMedia(id);
    toast({ title: 'Media deleted', description: 'Media item removed.', variant: 'destructive' });
    setDeleteMediaConfirm(null);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;
  const totalPlays = media.reduce((sum, m) => sum + m.plays, 0);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 hero-gradient opacity-60 pointer-events-none" />
      <div className="px-8 sm:px-12 py-12 animate-fade-in relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/20 group-hover:rotate-6 transition-transform">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-xs mb-1">
                <Shield className="h-3 w-3" />
                <span>System Administration</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">CONTROL <span className="gradient-text">CENTER</span></h1>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { fetchUsers(); fetchMedia({ limit: 50 }); }}
            className="glass-morphism border-white/10 hover:bg-white/5 font-bold group"
          >
            <RefreshCw className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
            Refresh Data
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {[
            { label: 'Total Users', value: users.length, icon: Users, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'Admins', value: adminCount, icon: Shield, gradient: 'from-amber-500 to-orange-500' },
            { label: 'Active Users', value: userCount, icon: Users, gradient: 'from-green-500 to-emerald-500' },
            { label: 'Media Items', value: media.length, icon: Music, gradient: 'from-violet-500 to-purple-500' },
            { label: 'Total Plays', value: formatPlays(totalPlays), icon: Play, gradient: 'from-red-500 to-rose-500' },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="group relative animate-slide-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="relative h-full p-6 rounded-[2rem] bg-card/50 backdrop-blur-xl border border-border/50 overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-500">
                <div className={cn(
                  "absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-full -translate-y-1/2 translate-x-1/2",
                  stat.gradient
                )} />
                <div className="flex flex-col gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500",
                    stat.gradient
                  )}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-black tracking-tighter mb-1">{stat.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="media">
              <Music className="h-4 w-4 mr-2" />
              Media ({media.length})
            </TabsTrigger>
          </TabsList>

          <TabsTrigger value="users" className="hidden" />
          <TabsTrigger value="media" className="hidden" />

          {activeTab === 'users' && (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Media</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                              {u.username[0].toUpperCase()}
                            </div>
                            <span className="font-medium">{u.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === 'admin' ? 'premium' : 'secondary'}
                          >
                            {u.role === 'admin' && (
                              <Shield className="h-3 w-3 mr-1" />
                            )}
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.isActive ? 'default' : 'destructive'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.mediaCount !== undefined ? u.mediaCount : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditUser(u)}
                                disabled={u.id === user?.id}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                  onClick={() => setDeleteUserConfirm(u.id)}
                                  className="text-destructive"
                                  disabled={u.id === user?.id}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative">
                    {item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex w-full h-full items-center justify-center">
                        {item.mediaType === 'video' ? (
                          <Video className="h-12 w-12 text-muted-foreground/50" />
                        ) : (
                          <Music className="h-12 w-12 text-muted-foreground/50" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge variant={item.mediaType === 'video' ? 'video' : 'audio'}>
                        {item.mediaType}
                      </Badge>
                    </div>
                    {item.isPremium && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="premium">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium line-clamp-1">{item.title}</h4>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {formatPlays(item.plays)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => setDeleteMediaConfirm(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Tabs>
      </div>

      {/* Delete User Confirmation */}
      <Dialog open={!!deleteUserConfirm} onOpenChange={() => setDeleteUserConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete User
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This will permanently delete this user and all their data.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteUserConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteUserConfirm && handleDeleteUser(deleteUserConfirm)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Media Confirmation */}
      <Dialog open={!!deleteMediaConfirm} onOpenChange={() => setDeleteMediaConfirm(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Media
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This will permanently delete this media item.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteMediaConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMediaConfirm && handleDeleteMedia(deleteMediaConfirm)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete Media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg font-medium">
                  {editUser.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{editUser.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {editUser.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={editUser.role}
                  onValueChange={(value) =>
                    setEditUser({ ...editUser, role: value as 'admin' | 'user' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Active Status</label>
                <Badge variant={editUser.isActive ? 'default' : 'destructive'}>
                  {editUser.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editUser && handleEditUser(editUser.id, editUser)}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
