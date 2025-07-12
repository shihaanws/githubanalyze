import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RepoAnalyzer - GitHub Repository Structure Analyzer',
  description: 'Analyze any GitHub repository structure with AI-powered insights, copyable file trees, and tech stack detection.',
  keywords: 'github, repository, analyzer, file structure, tree, tech stack, AI, developer tools',
  authors: [{ name: 'RepoAnalyzer' }],
  openGraph: {
    title: 'RepoAnalyzer - GitHub Repository Structure Analyzer',
    description: 'Analyze any GitHub repository structure with AI-powered insights and copyable file trees.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster theme="dark" />
      </body>
    </html>
  );
}