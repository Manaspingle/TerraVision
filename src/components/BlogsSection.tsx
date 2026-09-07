import React, { useState } from 'react';
import { BookOpen, Plus, User, Tag, Calendar, Send } from 'lucide-react';
import { Blog, UserProfile } from '../types';
import { submitBlogApi } from '../api';

interface BlogsProps {
  blogs: Blog[];
  user: UserProfile | null;
  onBlogCreated: () => void;
}

export const BlogsSection: React.FC<BlogsProps> = ({
  blogs,
  user,
  onBlogCreated
}) => {
  const [showWriter, setShowWriter] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Remote Sensing");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitBlogApi({
        title,
        author: user?.displayName || "Guest Researcher",
        role: user?.role === 'admin' ? 'Admin Author' : 'User Contributor',
        category,
        content
      });
      onBlogCreated();
      setTitle("");
      setContent("");
      setShowWriter(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase mb-1">
            <BookOpen className="w-4 h-4" /> Educational Knowledge Hub
          </div>
          <h1 className="text-2xl font-extrabold text-white">Terravision Educational Blogs</h1>
          <p className="text-xs text-slate-400">
            Read default satellite image processing guides and community articles.
          </p>
        </div>

        <button
          onClick={() => setShowWriter(!showWriter)}
          className="glow-btn text-xs flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {showWriter ? 'Close Writer' : 'Write New Blog'}
        </button>
      </div>

      {showWriter && (
        <div className="glass-panel p-6 border-cyan-500/30 space-y-4">
          <h3 className="text-lg font-bold text-white">Publish Article on Terravision</h3>
          <form onSubmit={handleSubmitBlog} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Blog Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Spectral Indices for Deforestation Monitoring"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Remote Sensing">Remote Sensing</option>
                  <option value="Image Enhancement">Image Enhancement</option>
                  <option value="Segmentation">Segmentation</option>
                  <option value="Feature Extraction">Feature Extraction</option>
                  <option value="Machine Learning">Machine Learning</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Blog Content</label>
              <textarea
                required
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write educational explanations, code snippets, or satellite analytical insights..."
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-btn text-xs py-3 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Publishing...' : 'Publish Blog Post'}
            </button>
          </form>
        </div>
      )}

      {/* Blogs List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((b) => (
          <div key={b.id} className="glass-panel p-6 border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="px-2.5 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-full font-semibold">
                  {b.category}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-400" /> {b.date}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white hover:text-cyan-300 transition-colors">
                {b.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                {b.content}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-cyan-400" /> {b.author}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{b.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
