import React, { useMemo } from "react";
import { File, Folder, Tree } from "@/src/components/magicui/file-tree";
import { useBeautyTopKeywords } from "../../tanstack/ai-tanstack";
import { Eye } from 'lucide-react';

interface KeywordNode {
  id: string;
  keyword: string;
  count: number;
  total_mention: number;
  parent_id: string | null;
  children?: KeywordNode[];
  category?: string;
  created_at?: string;
  updated_at?: string;
}

interface TreeElement {
  id: string;
  isSelectable: boolean;
  name: string;
  children?: TreeElement[];
  total_mention?: number;
  count?: number;
}

interface TreeStructureProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  onKeywordClick?: (keyword: string) => void;
}

const transformToTreeElements = (data: any): { elements: TreeElement[], expandedItems: string[] } => {
  if (!data || (!Array.isArray(data) && !data.bubbles)) {
    return { elements: [], expandedItems: [] };
  }

  const keywords: KeywordNode[] = Array.isArray(data) ? data : data.bubbles;
  const expandedItems: string[] = [];

  // Create a map of all nodes by ID for easier lookup
  const nodeMap = new Map<string, KeywordNode>();
  keywords.forEach(keyword => {
    nodeMap.set(keyword.id, keyword);
  });

  // Find root nodes (those without parents)
  const rootNodes = keywords.filter((k: KeywordNode) => k.parent_id === null);
  
  const processNode = (node: KeywordNode): TreeElement => {
    // Find children for this node
    let childrenNodes: KeywordNode[] = [];
    
    if (node.children && node.children.length > 0) {
      childrenNodes = node.children;
    } else {
      childrenNodes = keywords.filter(k => k.parent_id === node.id);
    }

    // Add to expanded items if it has children
    if (childrenNodes.length > 0) {
      expandedItems.push(node.id);
    }

    return {
      id: node.id,
      isSelectable: true,
      name: node.keyword,
      total_mention: node.total_mention,
      count: node.count,
      children: childrenNodes.length > 0 ? childrenNodes.map(child => processNode(child)) : undefined
    };
  };

  const elements = rootNodes.map(node => processNode(node));
  return { elements, expandedItems };
};

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const TreeStructure: React.FC<TreeStructureProps> = ({ 
  className, 
  startDate, 
  endDate, 
  category,
  onKeywordClick
}) => {
  const { data: treeData, isLoading } = useBeautyTopKeywords(
    startDate ? {
      start_date: startDate,
      end_date: endDate || startDate
    } : undefined
  );

  const { elements, expandedItems } = useMemo(() => {
    if (!treeData?.data) return { elements: [], expandedItems: [] };
    return transformToTreeElements(treeData.data);
  }, [treeData]);

  const renderTreeItem = (element: TreeElement) => {
    const handleClick = () => {
      if (onKeywordClick) {
        onKeywordClick(element.name);
      }
    };

    const labelContent = (
      <span
        className="flex items-center gap-2 cursor-pointer group"
        onClick={handleClick}
      >
        <span>{element.name}</span>
        {/* Only show badge if mentions > 0 */}
        {(element.total_mention ?? 0) > 0 && (
          <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
            {formatNumber(element.total_mention ?? 0)} mentions
          </span>
        )}
        {/* Eye icon, always visible but subtle, becomes prominent on hover */}
        <Eye className="ml-1 w-4 h-4 text-purple-400 opacity-20 hover:opacity-100 transition-opacity duration-200" />
      </span>
    );

    if (element.children && element.children.length > 0) {
      return (
        <Folder key={element.id} value={element.id} element={element.name}>
          <div className="flex items-center gap-2 cursor-pointer w-full hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 transition-colors" onClick={handleClick}>
            <span>{element.name}</span> 
            {(element.total_mention ?? 0) > 0 && (
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                {formatNumber(element.total_mention ?? 0)} mentions
              </span>
            )}
            <Eye className="ml-1 w-4 h-4 text-purple-400 opacity-20 hover:opacity-100 transition-opacity duration-200" />
          </div>
          {element.children.map(child => renderTreeItem(child))}
        </Folder>
      );
    } else {
      return (
        <File key={element.id} value={element.id}>
          <div
            className="flex items-center justify-between w-full pr-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 py-1 transition-colors"
            onClick={handleClick}
          >
            <span className="text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2 hover:text-purple-700">
              {element.name}
              {/* Only show badge if mentions > 0 */}
              {(element.total_mention ?? 0) > 0 && (
                <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                  {formatNumber(element.total_mention ?? 0)} mentions
                </span>
              )}
              {/* Eye icon, only visible on hover of this row */}
              <Eye className="ml-1 w-4 h-4 text-purple-400 opacity-20 hover:opacity-100 transition-opacity duration-200" />
            </span>
          </div>
        </File>
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-white dark:bg-black rounded-lg border">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 dark:border-purple-400"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading keyword tree...</p>
        </div>
      </div>
    );
  }

  const hasNoData = !treeData?.data || 
    (!treeData.data.bubbles || treeData.data.bubbles.length === 0) ||
    elements.length === 0;

  if (hasNoData) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center space-y-3 p-4 text-center">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3">
            <svg 
              className="h-6 w-6 text-gray-400 dark:text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">No keywords available</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              There are no keywords to display in tree structure for the selected time period.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col h-full w-full ${className}`}>
      {/* Header - More Compact */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-black/80 dark:to-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Keywords Tree
          </h3>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span className="text-xs">Parent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            <span className="text-xs">Child</span>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs">Click to zoom</span>
          </div>
        </div>
      </div>

      {/* Tree Content - More Spacious */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-white via-gray-50/50 to-purple-50/30 dark:from-black dark:via-gray-900/50 dark:to-purple-950/20">
        <div className="h-full overflow-auto p-4">
          <Tree
            className="overflow-hidden rounded-lg bg-white/60 dark:bg-black/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 p-4 shadow-lg"
            initialSelectedId={elements[0]?.id}
            initialExpandedItems={expandedItems}
            elements={elements}
          >
            {elements.map(element => renderTreeItem(element))}
          </Tree>
        </div>
      </div>

      
    </div>
  );
};

export default TreeStructure;