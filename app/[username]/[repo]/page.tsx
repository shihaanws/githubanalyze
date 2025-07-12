'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Copy, Search, Filter, Download, TreePine, FileText, Star, GitBranch, Users, Eye, Code, Folder, File, Package, BookOpen, Settings, Globe, ChevronRight, ChevronDown, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface GitHubFile {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
}

interface RepoInfo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  homepage?: string;
  topics: string[];
}

interface TreeNode {
  name: string;
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  children?: TreeNode[];
  level: number;
}

export default function RepoAnalyzer() {
  const params = useParams();
  const username = params.username as string;
  const repo = params.repo as string;

  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const techStackMapping: Record<string, { color: string; icon: string }> = {
    'TypeScript': { color: 'bg-blue-500', icon: '⚡' },
    'JavaScript': { color: 'bg-yellow-500', icon: '📜' },
    'React': { color: 'bg-cyan-500', icon: '⚛️' },
    'Next.js': { color: 'bg-black', icon: '▲' },
    'Vue': { color: 'bg-green-500', icon: '🌟' },
    'Angular': { color: 'bg-red-500', icon: '🅰️' },
    'Python': { color: 'bg-blue-600', icon: '🐍' },
    'Node.js': { color: 'bg-green-600', icon: '🟢' },
    'Docker': { color: 'bg-blue-400', icon: '🐋' },
    'Tailwind': { color: 'bg-teal-500', icon: '🎨' },
    'Vite': { color: 'bg-purple-500', icon: '⚡' },
    'CSS': { color: 'bg-blue-300', icon: '🎨' },
    'HTML': { color: 'bg-orange-500', icon: '📄' },
    'Markdown': { color: 'bg-gray-600', icon: '📝' }
  };

  useEffect(() => {
    fetchRepoData();
  }, [username, repo]);

  const fetchRepoData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch repository info
      const repoResponse = await fetch(`https://api.github.com/repos/${username}/${repo}`);
      if (!repoResponse.ok) {
        throw new Error('Repository not found');
      }
      const repoData = await repoResponse.json();
      setRepoInfo(repoData);

      // Get default branch SHA
      const branchResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/branches/${repoData.default_branch}`);
      if (!branchResponse.ok) {
        throw new Error('Failed to fetch branch information');
      }
      const branchData = await branchResponse.json();

      // Get tree recursively
      const treeResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/git/trees/${branchData.commit.sha}?recursive=1`);
      if (!treeResponse.ok) {
        throw new Error('Failed to fetch repository tree');
      }
      const treeData = await treeResponse.json();
      
      setFiles(treeData.tree);
      buildTreeStructure(treeData.tree);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const buildTreeStructure = (files: GitHubFile[]) => {
    const tree: TreeNode[] = [];
    const pathMap = new Map<string, TreeNode>();

    // Sort files by path
    const sortedFiles = files.sort((a, b) => a.path.localeCompare(b.path));

    sortedFiles.forEach((file) => {
      const parts = file.path.split('/');
      let currentPath = '';
      
      parts.forEach((part, index) => {
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!pathMap.has(currentPath)) {
          const node: TreeNode = {
            name: part,
            path: currentPath,
            type: index === parts.length - 1 ? file.type : 'tree',
            size: index === parts.length - 1 ? file.size : undefined,
            children: [],
            level: index
          };
          
          pathMap.set(currentPath, node);
          
          if (parentPath) {
            const parent = pathMap.get(parentPath);
            if (parent) {
              parent.children!.push(node);
            }
          } else {
            tree.push(node);
          }
        }
      });
    });

    setTreeData(tree);
  };

  const detectTechStack = (): string[] => {
    const stack: string[] = [];
    const fileExtensions = files.map(f => f.path.split('.').pop()?.toLowerCase()).filter(Boolean);
    const fileNames = files.map(f => f.path.split('/').pop()?.toLowerCase()).filter(Boolean);

    // Detect by file extensions
    if (fileExtensions.includes('ts') || fileExtensions.includes('tsx')) stack.push('TypeScript');
    if (fileExtensions.includes('js') || fileExtensions.includes('jsx')) stack.push('JavaScript');
    if (fileExtensions.includes('py')) stack.push('Python');
    if (fileExtensions.includes('css')) stack.push('CSS');
    if (fileExtensions.includes('html')) stack.push('HTML');
    if (fileExtensions.includes('md')) stack.push('Markdown');

    // Detect by specific files
    if (fileNames.includes('package.json')) {
      const packageJsonFile = files.find(f => f.path.includes('package.json'));
      if (packageJsonFile) {
        // In a real app, you'd fetch and parse package.json content
        stack.push('Node.js');
      }
    }

    if (fileNames.includes('next.config.js') || fileNames.includes('next.config.ts')) stack.push('Next.js');
    if (fileNames.includes('vite.config.js') || fileNames.includes('vite.config.ts')) stack.push('Vite');
    if (fileNames.includes('dockerfile') || fileNames.includes('docker-compose.yml')) stack.push('Docker');
    if (fileNames.includes('tailwind.config.js') || fileNames.includes('tailwind.config.ts')) stack.push('Tailwind');

    // Check for React indicators
    if (files.some(f => f.path.includes('react') || f.path.endsWith('.jsx') || f.path.endsWith('.tsx'))) {
      stack.push('React');
    }

    return [...new Set(stack)];
  };

  const generateTreeString = (nodes: TreeNode[], indent = '', isLast = true): string => {
    let result = '';
    
    nodes.forEach((node, index) => {
      const isLastChild = index === nodes.length - 1;
      const prefix = indent + (isLastChild ? '└── ' : '├── ');
      const icon = node.type === 'tree' ? '📁' : getFileIcon(node.name);
      
      result += `${prefix}${icon} ${node.name}\n`;
      
      if (node.children && node.children.length > 0) {
        const nextIndent = indent + (isLastChild ? '    ' : '│   ');
        result += generateTreeString(node.children, nextIndent);
      }
    });
    
    return result;
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      'js': '📜', 'jsx': '⚛️', 'ts': '⚡', 'tsx': '⚛️',
      'html': '🌐', 'css': '🎨', 'scss': '🎨', 'sass': '🎨',
      'json': '📋', 'md': '📝', 'txt': '📄',
      'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
      'py': '🐍', 'java': '☕', 'cpp': '⚙️', 'c': '⚙️',
      'yml': '⚙️', 'yaml': '⚙️', 'toml': '⚙️', 'xml': '📰'
    };
    return iconMap[ext || ''] || '📄';
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      toast.success(`${type} copied to clipboard!`);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.path.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'files') return matchesSearch && file.type === 'blob';
    if (filterType === 'folders') return matchesSearch && file.type === 'tree';
    if (filterType === 'important') {
      const importantFiles = ['readme', 'package.json', 'index', 'app', 'src', '.env', 'config'];
      return matchesSearch && importantFiles.some(important => 
        file.path.toLowerCase().includes(important)
      );
    }
    
    return matchesSearch;
  });

  const calculateComplexityScore = (): number => {
    const folderCount = files.filter(f => f.type === 'tree').length;
    const fileCount = files.filter(f => f.type === 'blob').length;
    const maxDepth = Math.max(...files.map(f => f.path.split('/').length));
    
    // Simple complexity calculation
    return Math.min(100, Math.round((folderCount * 2 + fileCount * 0.5 + maxDepth * 3) / 10));
  };

  const getImportantFiles = () => {
    return files.filter(f => {
      const filename = f.path.toLowerCase();
      return filename.includes('readme') || 
             filename.includes('package.json') || 
             filename.includes('index.') ||
             filename.includes('app.') ||
             filename.includes('.env') ||
             filename.includes('config');
    });
  };

  const techStack = detectTechStack();
  const complexityScore = calculateComplexityScore();
  const importantFiles = getImportantFiles();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Analyzing Repository</h2>
          <p className="text-gray-400">Fetching {username}/{repo}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={fetchRepoData} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold">RepoAnalyzer</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-gray-300">
                <span>/</span>
                <span className="text-blue-400">{username}</span>
                <span>/</span>
                <span className="text-blue-400 font-semibold">{repo}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {repoInfo && (
                <>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    <Star className="h-3 w-3 mr-1" />
                    {repoInfo.stars}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300">
                    <Users className="h-3 w-3 mr-1" />
                    {repoInfo.forks}
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Repository Info */}
        {repoInfo && (
          <Card className="mb-8 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div>
                  <CardTitle className="text-2xl text-white flex items-center space-x-2">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                    <span>{repoInfo.name}</span>
                  </CardTitle>
                  {repoInfo.description && (
                    <p className="text-gray-400 mt-2">{repoInfo.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {techStack.map((tech) => (
                    <Badge 
                      key={tech} 
                      className={`${techStackMapping[tech]?.color || 'bg-gray-600'} text-white border-0`}
                    >
                      {techStackMapping[tech]?.icon} {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Language:</span>
                  <p className="font-medium text-white">{repoInfo.language || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Files:</span>
                  <p className="font-medium text-white">{files.filter(f => f.type === 'blob').length}</p>
                </div>
                <div>
                  <span className="text-gray-400">Folders:</span>
                  <p className="font-medium text-white">{files.filter(f => f.type === 'tree').length}</p>
                </div>
                <div>
                  <span className="text-gray-400">Complexity:</span>
                  <p className="font-medium text-white">{complexityScore}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Controls */}
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center space-x-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  <span>Search & Filter</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search files and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="files">Files Only</SelectItem>
                    <SelectItem value="folders">Folders Only</SelectItem>
                    <SelectItem value="important">Important Files</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Important Files */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>Key Files</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {importantFiles.slice(0, 8).map((file) => (
                    <div key={file.path} className="flex items-center space-x-2 text-sm">
                      <span className="text-lg">{getFileIcon(file.path)}</span>
                      <span className="text-gray-300 truncate">{file.path}</span>
                    </div>
                  ))}
                  {importantFiles.length > 8 && (
                    <p className="text-xs text-gray-400">+{importantFiles.length - 8} more...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center space-x-2">
                  <Code className="h-5 w-5 text-purple-500" />
                  <span>AI Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Project Type:</span>
                  <p className="text-white font-medium">
                    {techStack.includes('Next.js') ? 'Next.js Application' :
                     techStack.includes('React') ? 'React Application' :
                     techStack.includes('Python') ? 'Python Project' :
                     'Web Application'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Structure Quality:</span>
                  <p className="text-white font-medium">
                    {complexityScore < 30 ? 'Simple & Clean' :
                     complexityScore < 60 ? 'Well Organized' :
                     complexityScore < 80 ? 'Complex but Manageable' :
                     'Highly Complex'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Recommendation:</span>
                  <p className="text-white text-sm">
                    {files.some(f => f.path.includes('README')) ? 
                      'Well documented project with README' :
                      'Consider adding a README file'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white flex items-center space-x-2">
                    <TreePine className="h-6 w-6 text-green-500" />
                    <span>Repository Structure</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {filteredFiles.length} items
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="tree" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-700">
                    <TabsTrigger value="tree" className="data-[state=active]:bg-gray-600 text-white">Tree View</TabsTrigger>
                    <TabsTrigger value="list" className="data-[state=active]:bg-gray-600 text-white">File List</TabsTrigger>
                    <TabsTrigger value="markdown" className="data-[state=active]:bg-gray-600 text-white">Markdown</TabsTrigger>
                    <TabsTrigger value="export" className="data-[state=active]:bg-gray-600 text-white">Export</TabsTrigger>
                  </TabsList>

                  <TabsContent value="tree" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Interactive Tree</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generateTreeString(treeData), 'Tree Structure')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          {copySuccess === 'Tree Structure' ? (
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          Copy Tree
                        </Button>
                      </div>
                      <ScrollArea className="h-96 bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                          {generateTreeString(treeData)}
                        </pre>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="list" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">File List</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(filteredFiles.map(f => f.path).join('\n'), 'File List')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          {copySuccess === 'File List' ? (
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          Copy List
                        </Button>
                      </div>
                      <ScrollArea className="h-96 bg-gray-900 rounded-lg border border-gray-700">
                        <div className="p-4 space-y-1">
                          {filteredFiles.map((file) => (
                            <div key={file.path} className="flex items-center space-x-3 py-1 hover:bg-gray-800 rounded px-2">
                              <span className="text-lg">{file.type === 'tree' ? '📁' : getFileIcon(file.path)}</span>
                              <span className="text-gray-300 font-mono text-sm flex-1">{file.path}</span>
                              {file.size && (
                                <span className="text-gray-500 text-xs">
                                  {(file.size / 1024).toFixed(1)}KB
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="markdown" className="mt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Markdown Format</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const markdown = `# ${repo} Repository Structure\n\n\`\`\`\n${generateTreeString(treeData)}\n\`\`\`\n\n## Tech Stack\n${techStack.map(tech => `- ${tech}`).join('\n')}\n\n## Statistics\n- Files: ${files.filter(f => f.type === 'blob').length}\n- Folders: ${files.filter(f => f.type === 'tree').length}\n- Complexity Score: ${complexityScore}/100`;
                            copyToClipboard(markdown, 'Markdown');
                          }}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          {copySuccess === 'Markdown' ? (
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          Copy Markdown
                        </Button>
                      </div>
                      <ScrollArea className="h-96 bg-gray-900 rounded-lg p-4 border border-gray-700">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                          {`# ${repo} Repository Structure

\`\`\`
${generateTreeString(treeData)}
\`\`\`

## Tech Stack
${techStack.map(tech => `- ${tech}`).join('\n')}

## Statistics
- Files: ${files.filter(f => f.type === 'blob').length}
- Folders: ${files.filter(f => f.type === 'tree').length}
- Complexity Score: ${complexityScore}/100`}
                        </pre>
                      </ScrollArea>
                    </div>
                  </TabsContent>

                  <TabsContent value="export" className="mt-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-white">Export Options</h3>
                      
                      <div className="grid gap-4">
                        <Card className="bg-gray-700 border-gray-600">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">AI Prompt Generator</h4>
                                <p className="text-sm text-gray-400">Generate a prompt for AI analysis</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const prompt = `Analyze this ${techStack.join(', ')} project. Here's the repository structure:\n\n${generateTreeString(treeData)}\n\nKey files: ${importantFiles.slice(0, 5).map(f => f.path).join(', ')}\n\nPlease provide insights about the code organization, architecture patterns, and potential improvements.`;
                                  copyToClipboard(prompt, 'AI Prompt');
                                }}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                {copySuccess === 'AI Prompt' ? (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                ) : (
                                  <Copy className="h-4 w-4 mr-1" />
                                )}
                                Copy Prompt
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-700 border-gray-600">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">Plain Text Export</h4>
                                <p className="text-sm text-gray-400">Simple text format for documentation</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const plainText = `${repo.toUpperCase()} REPOSITORY STRUCTURE\n${'='.repeat(repo.length + 20)}\n\n${generateTreeString(treeData)}\n\nTECH STACK: ${techStack.join(', ')}\nFILES: ${files.filter(f => f.type === 'blob').length}\nFOLDERS: ${files.filter(f => f.type === 'tree').length}`;
                                  copyToClipboard(plainText, 'Plain Text');
                                }}
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                {copySuccess === 'Plain Text' ? (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                ) : (
                                  <Download className="h-4 w-4 mr-1" />
                                )}
                                Export Text
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-700 border-gray-600">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">JSON Export</h4>
                                <p className="text-sm text-gray-400">Structured data for further processing</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  const jsonData = JSON.stringify({
                                    repository: {
                                      name: repo,
                                      owner: username,
                                      structure: treeData,
                                      techStack,
                                      stats: {
                                        files: files.filter(f => f.type === 'blob').length,
                                        folders: files.filter(f => f.type === 'tree').length,
                                        complexity: complexityScore
                                      }
                                    }
                                  }, null, 2);
                                  copyToClipboard(jsonData, 'JSON Data');
                                }}
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                {copySuccess === 'JSON Data' ? (
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                ) : (
                                  <Download className="h-4 w-4 mr-1" />
                                )}
                                Export JSON
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}