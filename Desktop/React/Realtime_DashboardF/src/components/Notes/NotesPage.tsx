import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, FileText, Clock, Hash } from 'lucide-react';
import { Note, notesAPI } from '../../api/notes';
import { toast } from '@/hooks/use-toast';

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });

  // Mock data for demo
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Product Roadmap Ideas',
      content: `# Q1 Product Features

## High Priority
- User authentication improvements
- Dashboard performance optimization
- Mobile responsiveness updates

## Medium Priority  
- Dark mode implementation
- Advanced search functionality
- Export features

## Notes
- Consider user feedback from last survey
- Check technical feasibility with dev team`,
      tags: ['product', 'roadmap', 'planning'],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      title: 'Client Meeting Notes',
      content: `Met with ABC Corp today to discuss project requirements.

Key Points:
- Timeline: 6 weeks
- Budget: $50k
- Requirements: Custom dashboard with real-time analytics
- Preferred tech stack: React + Node.js

Next Steps:
- Send project proposal by Friday
- Schedule technical architecture review
- Prepare mockups for next meeting`,
      tags: ['client', 'meeting', 'business'],
      createdAt: '2024-01-14T09:00:00Z',
      updatedAt: '2024-01-14T09:00:00Z',
    },
    {
      id: '3',
      title: 'Market Research Findings',
      content: `Research on productivity tools market:

## Key Findings
- Market size: $47.33 billion (2023)
- Growth rate: 13.4% CAGR
- Top competitors: Notion, Asana, Monday.com

## Opportunities
- Integration capabilities
- AI-powered features
- Better mobile experience

## Threats
- Increasing competition
- Price sensitivity
- Feature saturation`,
      tags: ['research', 'market', 'competitive'],
      createdAt: '2024-01-13T08:00:00Z',
      updatedAt: '2024-01-13T08:00:00Z',
    },
    {
      id: '4',
      title: 'Technical Architecture Notes',
      content: `System design considerations for the new dashboard:

## Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- React Query for state management

## Backend
- Node.js with Express
- PostgreSQL database
- Redis for caching
- JWT authentication

## Infrastructure
- AWS deployment
- Docker containers
- CI/CD with GitHub Actions`,
      tags: ['technical', 'architecture', 'development'],
      createdAt: '2024-01-12T16:00:00Z',
      updatedAt: '2024-01-12T16:00:00Z',
    },
  ];

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      // Use mock data for demo
      setNotes(mockNotes);
      setLoading(false);
    } catch (error) {
      setNotes(mockNotes);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const noteData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (editingNote) {
        toast({
          title: "Note updated",
          description: "Your note has been successfully updated.",
        });
      } else {
        toast({
          title: "Note created",
          description: "Your new note has been successfully created.",
        });
      }

      setIsDialogOpen(false);
      setEditingNote(null);
      setFormData({ title: '', content: '', tags: '' });
      fetchNotes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', '),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: "Note deleted",
        description: "The note has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    }
  };

  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getContentPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Capture your thoughts and organize your knowledge
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </DialogTitle>
              <DialogDescription>
                {editingNote ? 'Update your note' : 'Capture your thoughts and ideas'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter note title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your note content here..."
                    rows={10}
                    className="resize-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Enter tags separated by commas (e.g., work, ideas, meeting)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas to organize your notes
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="btn-primary">
                  {editingNote ? 'Update Note' : 'Create Note'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="glass-card group h-fit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Clock className="h-3 w-3" />
                    {formatDate(note.createdAt)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(note)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {getContentPreview(note.content)}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Hash className="h-2 w-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full">
            <Card className="glass-card">
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No notes found matching your search' : 'No notes yet'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'Try a different search term' : 'Create your first note to get started'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage;