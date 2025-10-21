
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/api';

interface NewChatDialogProps {
  onChatCreated: () => void;
}

export function NewChatDialog({ onChatCreated }: NewChatDialogProps) {
  const [chatName, setChatName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      apiClient.searchUsers(searchQuery).then(({ data }) => {
        setSearchResults(data);
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCreateChat = async () => {
    if (!chatName.trim() || !user) return;

    try {
      const { data: newChat } = await apiClient.addChat({ name: chatName, chatType: 0 });
      await apiClient.addChatUser({ chatId: newChat.id, userId: user.id, chatRole: 0 });
      for (const selectedUser of selectedUsers) {
        await apiClient.addChatUser({ chatId: newChat.id, userId: selectedUser.id, chatRole: 1 });
      }
      onChatCreated();
      setOpen(false);
      setChatName('');
      setSearchQuery('');
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.find((u) => u.id === user.id)
        ? prevSelected.filter((u) => u.id !== user.id)
        : [...prevSelected, user]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
          <DialogDescription>
            Give your new chat a name and add members.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Chat Name
            </Label>
            <Input
              id="name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search" className="text-right">
              Add Users
            </Label>
            <Input
              id="search"
              placeholder="Search by email or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="col-span-3"
            />
          </div>
          {searchResults.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div />
              <div className="col-span-3 border rounded-md max-h-32 overflow-y-auto">
                {searchResults.map((userResult) => (
                  <div
                    key={userResult.id}
                    className={`p-2 cursor-pointer hover:bg-muted ${
                      selectedUsers.find((u) => u.id === userResult.id) ? 'bg-muted' : ''
                    }`}
                    onClick={() => toggleUserSelection(userResult)}
                  >
                    {userResult.name} ({userResult.email})
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedUsers.length > 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div />
              <div className="col-span-3 flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1 text-sm">
                    {user.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => toggleUserSelection(user)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleCreateChat}>Create Chat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
