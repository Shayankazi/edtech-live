import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  SparklesIcon,
  BookmarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { API_CONFIG } from '../../config/api';
import toast from 'react-hot-toast';

const NoteTaking = ({ courseId, lessonId, currentTime = 0 }) => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notes
  const { data: notesData, isLoading } = useQuery(
    ['notes', courseId, lessonId],
    async () => {
      const response = await fetch(
        `${API_CONFIG.API_URL}/notes?course=${courseId}&lesson=${lessonId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json();
    },
    {
      enabled: !!courseId && !!lessonId,
      onSuccess: (data) => {
        setNotes(data.notes || []);
      }
    }
  );

  // Create note mutation
  const createNoteMutation = useMutation(
    async (noteData) => {
      const response = await fetch(`${API_CONFIG.API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(noteData)
      });
      if (!response.ok) throw new Error('Failed to create note');
      return response.json();
    },
    {
      onSuccess: (data) => {
        setNotes(prev => [data.note, ...prev]);
        setNewNote('');
        toast.success('Note saved!');
        queryClient.invalidateQueries(['notes', courseId, lessonId]);
      },
      onError: () => {
        toast.error('Failed to save note');
      }
    }
  );

  // Update note mutation
  const updateNoteMutation = useMutation(
    async ({ id, content }) => {
      const response = await fetch(`${API_CONFIG.API_URL}/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Failed to update note');
      return response.json();
    },
    {
      onSuccess: (data) => {
        setNotes(prev => prev.map(note => 
          note._id === data.note._id ? data.note : note
        ));
        setEditingNote(null);
        toast.success('Note updated!');
      },
      onError: () => {
        toast.error('Failed to update note');
      }
    }
  );

  // Delete note mutation
  const deleteNoteMutation = useMutation(
    async (noteId) => {
      const response = await fetch(`${API_CONFIG.API_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete note');
      return response.json();
    },
    {
      onSuccess: (_, noteId) => {
        setNotes(prev => prev.filter(note => note._id !== noteId));
        toast.success('Note deleted!');
      },
      onError: () => {
        toast.error('Failed to delete note');
      }
    }
  );

  // Summarize notes mutation
  const summarizeNoteMutation = useMutation(
    async (noteId) => {
      const response = await fetch(`${API_CONFIG.API_URL}/notes/${noteId}/summarize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to generate summary');
      return response.json();
    },
    {
      onSuccess: (data, noteId) => {
        setNotes(prev => prev.map(note => 
          note._id === noteId ? { ...note, aiSummary: data.summary } : note
        ));
        toast.success('AI summary generated!');
      },
      onError: () => {
        toast.error('Failed to generate summary');
      }
    }
  );

  const handleSaveNote = () => {
    if (!newNote.trim()) return;

    createNoteMutation.mutate({
      course: courseId,
      lesson: lessonId,
      content: newNote,
      timestamp: Math.floor(currentTime)
    });
  };

  const handleUpdateNote = (noteId, content) => {
    updateNoteMutation.mutate({ id: noteId, content });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BookmarkIcon className="w-5 h-5 mr-2" />
          Notes
        </h3>
        <span className="text-sm text-gray-500">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* New Note Input */}
      <div className="mb-4">
        <div className="flex items-start space-x-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Take a note at this moment..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={3}
          />
          <button
            onClick={handleSaveNote}
            disabled={!newNote.trim() || createNoteMutation.isLoading}
            className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4 mr-1" />
          At {formatTime(currentTime)}
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note._id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="w-4 h-4 mr-1" />
                {formatTime(note.timestamp)} • {formatDate(note.createdAt)}
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => summarizeNoteMutation.mutate(note._id)}
                  disabled={summarizeNoteMutation.isLoading}
                  className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  title="Generate AI Summary"
                >
                  <SparklesIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingNote(note._id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteNoteMutation.mutate(note._id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingNote === note._id ? (
              <div className="space-y-2">
                <textarea
                  defaultValue={note.content}
                  className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  onBlur={(e) => {
                    if (e.target.value !== note.content) {
                      handleUpdateNote(note._id, e.target.value);
                    } else {
                      setEditingNote(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleUpdateNote(note._id, e.target.value);
                    } else if (e.key === 'Escape') {
                      setEditingNote(null);
                    }
                  }}
                  autoFocus
                />
                <div className="text-xs text-gray-500">
                  Press Ctrl+Enter to save, Escape to cancel
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                
                {/* AI Summary */}
                {note.aiSummary && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <div className="flex items-center mb-2">
                      <SparklesIcon className="w-4 h-4 text-purple-600 mr-1" />
                      <span className="text-sm font-medium text-purple-800">AI Summary</span>
                    </div>
                    <p className="text-sm text-purple-700 mb-2">{note.aiSummary.summary}</p>
                    {note.aiSummary.keyPoints && note.aiSummary.keyPoints.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-purple-800 mb-1">Key Points:</p>
                        <ul className="text-xs text-purple-700 space-y-1">
                          {note.aiSummary.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-1 h-1 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookmarkIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No notes yet</p>
            <p className="text-sm">Start taking notes to enhance your learning!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteTaking;
