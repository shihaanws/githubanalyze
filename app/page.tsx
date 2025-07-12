'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, GitBranch, Zap, FileText, Download, Star, Code, TreePine, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = () => {
    if (!url) return;
    
    setLoading(true);
    
    // Extract username and repo from GitHub URL or direct format
    let username = '';
    let repo = '';
    
    if (url.includes('github.com')) {
      const parts = url.split('/');
      const githubIndex = parts.findIndex(part => part.includes('github.com'));
      username = parts[githubIndex + 1];
      repo = parts[githubIndex + 2];
    } else if (url.includes('/')) {
      const parts = url.split('/');
      username = parts[0];
      repo = parts[1];
    }
    
    if (username && repo) {
      router.push(`/${username}/${repo}`);
    }
  };

  const exampleRepos = [
    { username: 'vercel', repo: 'next.js', description: 'The React Framework' },
    { username: 'facebook', repo: 'react', description: 'A declarative library for building UIs' },
    { username: 'microsoft', repo: 'vscode', description: 'Visual Studio Code' },
    { username: 'tailwindlabs', repo: 'tailwindcss', description: 'Utility-first CSS framework' }
  ];

  const features = [
    {
      icon: <TreePine className="h-6 w-6 text-green-500" />,
      title: 'Interactive File Tree',
      description: 'Beautiful, copyable directory structure with ASCII art formatting'
    },
    {
      icon: <Code className="h-6 w-6 text-blue-500" />,
      title: 'Tech Stack Detection',
      description: 'Automatically detect frameworks, languages, and tools used'
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: 'AI-Powered Insights',
      description: 'Get intelligent analysis of code organization and project structure'
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-500" />,
      title: 'Multiple Export Formats',
      description: 'Export as Markdown, JSON, plain text, or AI prompts'
    },
    {
      icon: <Search className="h-6 w-6 text-cyan-500" />,
      title: 'Advanced Filtering',
      description: 'Search and filter files by type, importance, or custom criteria'
    },
    {
      icon: <Download className="h-6 w-6 text-orange-500" />,
      title: 'One-Click Copy',
      description: 'Copy structures in various formats with a single click'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                RepoAnalyzer
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                <Star className="h-3 w-3 mr-1" />
                GitHub API
              </Badge>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                AI Powered
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Analyze Any GitHub Repository
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Get instant insights into any GitHub repository's structure. Copy file trees, detect tech stacks, 
            and generate AI-powered analysis reports with beautiful, production-ready formatting.
          </p>

          {/* URL Input */}
          <Card className="max-w-2xl mx-auto mb-12 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Enter GitHub URL or username/repo (e.g., facebook/react)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <Button 
                  onClick={handleAnalyze}
                  disabled={!url || loading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                >
                  {loading ? (
                    'Analyzing...'
                  ) : (
                    <>
                      Analyze Repository
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Supports: github.com/user/repo, user/repo, or direct GitHub URLs
              </p>
            </CardContent>
          </Card>

          {/* Example Repositories */}
          <div className="mb-16">
            <h3 className="text-lg font-semibold mb-4 text-gray-300">Try these popular repositories:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {exampleRepos.map((repo) => (
                <Button
                  key={`${repo.username}/${repo.repo}`}
                  variant="outline"
                  size="sm"
                  onClick={() => setUrl(`${repo.username}/${repo.repo}`)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {repo.username}/{repo.repo}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features for Developers</h2>
          <p className="text-gray-400 text-lg">Everything you need to understand and document repository structures</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {feature.icon}
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
          <p className="text-gray-400 text-lg">Example output from analyzing a Next.js repository</p>
        </div>

        <Card className="max-w-4xl mx-auto bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <TreePine className="h-5 w-5 text-green-500" />
              <span>Repository Structure Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
{`📁 next.js
├── 📁 .github
│   ├── 📁 workflows
│   └── 📄 CONTRIBUTING.md
├── 📁 packages
│   ├── 📁 next
│   │   ├── 📁 src
│   │   │   ├── 📁 client
│   │   │   └── 📁 server
│   │   └── 📋 package.json
│   └── 📁 eslint-config-next
├── 📁 examples
│   ├── 📁 with-typescript
│   ├── 📁 with-tailwindcss
│   └── 📁 blog-starter
├── 📄 README.md
├── 📋 package.json
└── ⚙️ next.config.js`}
              </pre>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="bg-blue-500 text-white">⚡ TypeScript</Badge>
              <Badge className="bg-cyan-500 text-white">⚛️ React</Badge>
              <Badge className="bg-black text-white">▲ Next.js</Badge>
              <Badge className="bg-green-600 text-white">🟢 Node.js</Badge>
              <Badge className="bg-teal-500 text-white">🎨 Tailwind</Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <GitBranch className="h-6 w-6 text-blue-500" />
              <span className="text-xl font-bold">RepoAnalyzer</span>
            </div>
            <p className="text-gray-400">
              Analyze GitHub repositories with AI-powered insights and beautiful formatting
            </p>
            <div className="mt-4 flex justify-center space-x-4 text-sm text-gray-500">
              <span>Built with Next.js & Tailwind CSS</span>
              <span>•</span>
              <span>Powered by GitHub API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}