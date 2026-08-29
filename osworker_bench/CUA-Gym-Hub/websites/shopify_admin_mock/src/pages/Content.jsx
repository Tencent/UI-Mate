
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Newspaper, ArrowRight } from 'lucide-react';

export default function Content() {
  return (
    <div className="space-y-6">
      <h1 className="page-title">Content</h1>
      <p className="text-[13px] text-[#616161]">Manage the content that appears on your online store.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/online-store/pages"
          className="card hover:shadow-md transition-shadow group"
          style={{ textDecoration: 'none' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f1f1f1' }}>
              <FileText size={20} className="text-[#616161]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Pages</h3>
                <ArrowRight size={16} className="text-[#616161] opacity-100 transition-opacity" />
              </div>
              <p className="text-[13px] text-[#616161] mt-1">
                Create and manage standalone pages like About, Contact, FAQ, and custom landing pages.
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/online-store/blog-posts"
          className="card hover:shadow-md transition-shadow group"
          style={{ textDecoration: 'none' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f1f1f1' }}>
              <Newspaper size={20} className="text-[#616161]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="card-title">Blog posts</h3>
                <ArrowRight size={16} className="text-[#616161] opacity-100 transition-opacity" />
              </div>
              <p className="text-[13px] text-[#616161] mt-1">
                Write blog posts to share news, stories, and updates with your customers.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
