import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { HierarchyCircularNode } from "d3-hierarchy";
import { useTheme } from "next-themes";
import { 
  useBeautyTopKeywords,
} from "../../tanstack/ai-tanstack";
import TreeStructure from './tree-structure';

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

export interface BubbleKeywordData {
  name: string;
  value?: number;
  children?: BubbleKeywordData[];
  total_mention?: number;
}

interface BubbleKeywordProps {
  className?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
}

const transformBubbleData = (data: any): BubbleKeywordData[] => {
  // Check if we have the data in the correct format
  if (!data || (!Array.isArray(data) && !data.bubbles)) {
    return [];
  }

  // Get the keywords array from either format
  const keywords: KeywordNode[] = Array.isArray(data) ? data : data.bubbles;

  // Create a map of all nodes by ID for easier lookup
  const nodeMap = new Map<string, KeywordNode>();
  keywords.forEach(keyword => {
    nodeMap.set(keyword.id, keyword);
  });

  // Build the hierarchy properly by processing only root nodes and their actual children
  const rootNodes = keywords.filter((k: KeywordNode) => k.parent_id === null);
  
  const processNode = (node: KeywordNode): BubbleKeywordData => {
    // Use the children property if it exists, otherwise find children from the array
    let childrenNodes: KeywordNode[] = [];
    
    if (node.children && node.children.length > 0) {
      childrenNodes = node.children;
    } else {
      // Fallback: find children from the main array
      childrenNodes = keywords.filter(k => k.parent_id === node.id);
    }

    return {
      name: node.keyword,
      value: Math.max(node.count * 1000, 100), // Ensure minimum size for visibility with higher scaling
      total_mention: node.total_mention,
      children: childrenNodes.length > 0 ? childrenNodes.map((child: KeywordNode) => processNode(child)) : undefined
    };
  };

  // Return array of root nodes directly instead of wrapping in a parent node
  const result = rootNodes.map(node => processNode(node));
  return result;
};

const BubbleKeyword: React.FC<BubbleKeywordProps> = ({ className, startDate, endDate, category }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { theme } = useTheme(); 
  
  // Use the beauty top keywords hook
  const { data: bubbleData, isLoading } = useBeautyTopKeywords(
    startDate ? {
      start_date: startDate,
      end_date: endDate || startDate // Use endDate if provided, otherwise use startDate for both
    } : undefined
  );

  // Ref to store zoom function
  const zoomRef = useRef<((event: any, d: any) => void) | null>(null);

  // Function to find and zoom to a specific keyword
  const zoomToKeyword = (keywordName: string) => {
    if (!svgRef.current || !bubbleData?.data || !zoomRef.current) return;
    
    // Get the current D3 selection to find the actual node
    const svg = d3.select(svgRef.current);
    const circles = svg.selectAll("circle");
    
    // Find the circle with matching data
    let targetNode: any = null;
    circles.each(function(d: any) {
      if (d.data.name === keywordName) {
        targetNode = d;
      }
    });
    
    if (targetNode) {
      // Trigger zoom to this node
      const event = { altKey: false }; // Simulate click event
      zoomRef.current(event, targetNode);
    }
  };

  useEffect(() => {
    if (!svgRef.current || !bubbleData?.data || isLoading) return;
    
    // Transform the data based on the response structure
    const transformedData = transformBubbleData(bubbleData.data);
    
    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Remove any existing tooltips
    d3.selectAll(".bubble-tooltip").remove();
    
    // Calculate responsive dimensions based on viewport
    const containerWidth = Math.min(window.innerWidth - 80, 1600);
    const containerHeight = 700;
    
    // Use the smaller dimension to ensure the chart fits in both dimensions
    const size = Math.min(containerWidth, containerHeight);
    const width = size;
    const height = size;

    // Determine colors based on theme
    const isDark = theme === 'dark';
    
    // Updated modern color palette for both modes
    const modernColors = {
      dark: {
        background: '#000000',
        levels: [
          '#6200EA', // Deep purple - primary
          '#7C4DFF', // Secondary
          '#B388FF', // Light purple
        ],
        text: '#000000',
        leafNodes: ['#A7FFEB', '#CCFFFF', '#F4FFFF'] // Gradient for leaf nodes
      },
      light: {
        background: '#F8F9FA',
        levels: [
          '#9575CD', // Soft purple - primary
          '#B39DDB', // Secondary
          '#D1C4E9', // Light purple
        ],
        text: 'rgba(0, 0, 0, 0.85)',
        leafNodes: ['#64B5F6', '#81D4FA', '#B3E5FC'] // Gradient for leaf nodes
      }
    };

    // Create the color scale for different hierarchy levels
    const color = d3.scaleOrdinal<string>()
      .domain(['0', '1', '2']) // Hierarchy levels
      .range(isDark ? modernColors.dark.levels : modernColors.light.levels);
      
    // Create a color scale for leaf nodes based on value
    const leafColor = d3.scaleLinear<string>()
      .domain([0, 0.5, 1])
      .range(isDark ? modernColors.dark.leafNodes : modernColors.light.leafNodes)
      .interpolate(d3.interpolateHcl);

    // Compute the layout
    const pack = d3.pack<BubbleKeywordData>()
      .size([width, height])
      .padding(5);

    // Create a fake root to pack the bubbles, but we'll render its children
    const fakeRoot = {
      name: "",
      children: transformedData
    };
      
    const root = pack(d3.hierarchy<BubbleKeywordData>(fakeRoot)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0)));
      
    // Find the maximum value for leaf nodes to normalize values
    const maxLeafValue = d3.max(root.leaves(), d => d.value || 0) || 1;

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `-${width / 2} -${height / 2} ${width} ${height}`)
      .attr("width", "100%") 
      .attr("height", "100%")
      .attr("style", `max-width: 100%; height: 700px; display: block; margin: 0 auto; background: ${isDark ? modernColors.dark.background : modernColors.light.background}; cursor: pointer;`);

    let focus = root;
    let view: [number, number, number] = [root.x, root.y, root.r * 2.8];

    // Append the nodes - skip the fake root node
    const node = svg.append("g")
      .selectAll("circle")
      .data(root.descendants().slice(1))
      .join("circle")
        .attr("fill", d => {
          if (!d.children) {
            // For leaf nodes, use the value to determine color
            const normalizedValue = (d.value || 0) / maxLeafValue;
            return leafColor(normalizedValue);
          }
          return color(d.depth.toString());
        })
        // Remove pointer-events restriction - allow all circles to be clickable
        .attr("cursor", "pointer")
        .on("mouseover", function(event, d) { 
          d3.select(this)
            .attr("stroke", isDark ? "#ffffff" : "#000000")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 2);
          
          // Show tooltip with keyword information
          tooltip.style("visibility", "visible")
            .html(`
              <strong>${d.data.name}</strong><br/>
              ${d.data.total_mention ? `${formatNumber(d.data.total_mention)} mentions` : 'No mentions data'}<br/>
              <small>Click to ${d.children ? 'zoom in' : 'focus'}</small>
            `);
        })
        .on("mousemove", function(event) {
          tooltip.style("top", (event.pageY - 10) + "px")
                 .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() { 
          d3.select(this)
            .attr("stroke", null)
            .attr("stroke-opacity", null)
            .attr("stroke-width", null);
          
          // Hide tooltip
          tooltip.style("visibility", "hidden");
        })
        .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

    // Create a container for labels
    const labelContainer = svg.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle");

    // Create tooltip element
    const tooltip = d3.select("body").append("div")
      .attr("class", "bubble-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", isDark ? "rgba(0, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.9)")
      .style("color", isDark ? "#ffffff" : "#000000")
      .style("border", `1px solid ${isDark ? "#333" : "#ccc"}`)
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("font-family", "Inter, system-ui, sans-serif")
      .style("font-size", "12px")
      .style("z-index", "1000")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)");

    // Function to format number with commas
    const formatNumber = (num: number) => {
      return new Intl.NumberFormat().format(num);
    };

    // Function to calculate optimal font size that fits within the bubble
    const getOptimalFontSize = (text: string, radius: number, maxFontSize: number = 16, minFontSize: number = 6) => {
      // Estimate text width - roughly 0.6 * fontSize per character for most fonts
      const estimateTextWidth = (text: string, fontSize: number) => text.length * fontSize * 0.6;
      
      // Maximum text width should be about 1.6 * radius (diameter * 0.8 for padding)
      const maxTextWidth = radius * 1.6;
      
      // Start with a proportional font size based on radius
      let fontSize = Math.max(radius * 0.25, minFontSize);
      fontSize = Math.min(fontSize, maxFontSize);
      
      // Adjust font size if text is too wide
      const textWidth = estimateTextWidth(text, fontSize);
      if (textWidth > maxTextWidth) {
        fontSize = Math.max((maxTextWidth / text.length) / 0.6, minFontSize);
      }
      
      return Math.min(fontSize, maxFontSize);
    };

    // Function to truncate text to fit within bubble
    const getTruncatedText = (text: string, radius: number, fontSize: number) => {
      const maxTextWidth = radius * 1.6;
      const estimateTextWidth = (text: string) => text.length * fontSize * 0.6;
      
      if (estimateTextWidth(text) <= maxTextWidth) {
        return text;
      }
      
      // Binary search for optimal length
      let left = 0;
      let right = text.length;
      let bestLength = 0;
      
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const truncated = text.substring(0, mid) + (mid < text.length ? "..." : "");
        
        if (estimateTextWidth(truncated) <= maxTextWidth) {
          bestLength = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      
      return bestLength > 0 ? text.substring(0, bestLength) + (bestLength < text.length ? "..." : "") : "";
    };

    // Create text group for each label - skip the fake root node
    const labelGroup = labelContainer.selectAll("g")
      .data(root.descendants().slice(1))
      .join("g")
      .attr("class", "label-group")
      .style("display", d => d.parent === root.children?.[0]?.parent || d === root.children?.[0]?.parent ? "inline" : "none")
      .style("opacity", d => d.parent === root.children?.[0]?.parent || d === root.children?.[0]?.parent ? 1 : 0);

    // Add keyword text
    labelGroup.append("text")
      .attr("class", "keyword")
      .style("font-family", "Inter, system-ui, sans-serif")
      .style("font-weight", d => d.depth === 1 ? "700" : "500") // Adjust depth check since we removed a level
      .style("fill", isDark ? modernColors.dark.text : modernColors.light.text)
      .style("font-size", d => {
        // Only show text if bubble is large enough (radius > 8)
        if (d.r <= 8) return "0px";
        const fontSize = getOptimalFontSize(d.data.name, d.r, 18, 8);
        return `${fontSize}px`;
      })
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .text(d => {
        // Only show text for bubbles with radius > 8
        if (d.r <= 8) return '';
        const fontSize = getOptimalFontSize(d.data.name, d.r, 18, 8);
        return getTruncatedText(d.data.name, d.r, fontSize);
      });

    // Add total mentions text
    labelGroup.append("text")
      .attr("class", "total-mentions")
      .style("font-family", "Inter, system-ui, sans-serif")
      .style("font-weight", "400")
      .style("fill", isDark ? modernColors.dark.text : modernColors.light.text)
      .style("font-size", d => {
        // Only show mentions for larger bubbles (radius > 15) to avoid overcrowding
        if (d.r <= 15 || !d.data.total_mention) return "0px";
        const keywordFontSize = getOptimalFontSize(d.data.name, d.r, 18, 8);
        const mentionsFontSize = Math.max(keywordFontSize * 0.7, 6); // 70% of keyword font size
        return `${mentionsFontSize}px`;
      })
      .style("text-anchor", "middle")
      .style("dominant-baseline", "central")
      .attr("dy", d => {
        // Only show mentions for larger bubbles
        if (d.r <= 15 || !d.data.total_mention) return "0px";
        const keywordFontSize = getOptimalFontSize(d.data.name, d.r, 18, 8);
        return `${keywordFontSize + 4}px`; // Position below keyword with small gap
      })
      .text(d => {
        // Only show mentions for larger bubbles to avoid overcrowding
        if (d.r <= 15 || !d.data.total_mention) return '';
        const mentionText = `${formatNumber(d.data.total_mention)} mentions`;
        const keywordFontSize = getOptimalFontSize(d.data.name, d.r, 18, 8);
        const mentionsFontSize = Math.max(keywordFontSize * 0.7, 6);
        return getTruncatedText(mentionText, d.r, mentionsFontSize);
      });

    // Create the zoom behavior
    svg.on("click", (event) => zoom(event, root));
    zoomTo([focus.x, focus.y, focus.r * 2.8]);

    function zoomTo(v: [number, number, number]) {
      const k = width / v[2];
      view = v;

      labelGroup.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("r", d => d.r * k);

      // Update font sizes during zoom
      labelGroup.select(".keyword")
        .style("font-size", d => {
          const zoomedRadius = d.r * k;
          // Only show text if zoomed bubble is large enough
          if (zoomedRadius <= 8) return "0px";
          const fontSize = getOptimalFontSize(d.data.name, zoomedRadius, 18, 8);
          return `${fontSize}px`;
        })
        .text(d => {
          const zoomedRadius = d.r * k;
          // Only show text for bubbles with zoomed radius > 8
          if (zoomedRadius <= 8) return '';
          const fontSize = getOptimalFontSize(d.data.name, zoomedRadius, 18, 8);
          return getTruncatedText(d.data.name, zoomedRadius, fontSize);
        });

      labelGroup.select(".total-mentions")
        .style("font-size", d => {
          const zoomedRadius = d.r * k;
          // Only show mentions for larger zoomed bubbles
          if (zoomedRadius <= 15 || !d.data.total_mention) return "0px";
          const keywordFontSize = getOptimalFontSize(d.data.name, zoomedRadius, 18, 8);
          const mentionsFontSize = Math.max(keywordFontSize * 0.7, 6);
          return `${mentionsFontSize}px`;
        })
        .attr("dy", d => {
          const zoomedRadius = d.r * k;
          // Only show mentions for larger zoomed bubbles
          if (zoomedRadius <= 15 || !d.data.total_mention) return "0px";
          const keywordFontSize = getOptimalFontSize(d.data.name, zoomedRadius, 18, 8);
          return `${keywordFontSize + 4}px`;
        })
        .text(d => {
          const zoomedRadius = d.r * k;
          // Only show mentions for larger zoomed bubbles
          if (zoomedRadius <= 15 || !d.data.total_mention) return '';
          const mentionText = `${formatNumber(d.data.total_mention)} mentions`;
          const keywordFontSize = getOptimalFontSize(d.data.name, zoomedRadius, 18, 8);
          const mentionsFontSize = Math.max(keywordFontSize * 0.7, 6);
          return getTruncatedText(mentionText, zoomedRadius, mentionsFontSize);
        });
    }

    function zoom(event: any, d: HierarchyCircularNode<BubbleKeywordData>) {
      const focus0 = focus;
      focus = d;

      const transition = svg.transition()
        .duration(event.altKey ? 7500 : 750)
        .tween("zoom", () => {
          const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2.8]);
          return (t: number) => zoomTo(i(t));
        });

      labelGroup
        .filter(function(d) { 
          const el = this as SVGElement;
          // Skip the fake root and adjust parent check
          return (d.parent === focus || d === focus || el.style.display === "inline") && d !== root; 
        })
        .transition(transition as any)
          .style("opacity", d => d.parent === focus || d === focus ? 1 : 0)
          .on("start", function(d) { 
            const el = this as SVGElement;
            if (d.parent === focus || d === focus) el.style.display = "inline"; 
          })
          .on("end", function(d) { 
            const el = this as SVGElement;
            if (d.parent !== focus && d !== focus) el.style.display = "none"; 
          });
    }

    // Store zoom function in ref for external access
    zoomRef.current = zoom;
 }, [bubbleData, theme, isLoading]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[700px] bg-white dark:bg-[#000000] rounded-lg">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
        </div>
      </div>
    );
  }

  // Check if there's no data
  const hasNoData = !bubbleData?.data || 
    (!bubbleData.data.bubbles || bubbleData.data.bubbles.length === 0);

  if (hasNoData) {
    return (
      <div className="flex items-center justify-center h-[700px] bg-white dark:bg-[#000000] rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col items-center space-y-4 p-6 text-center">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
            <svg 
              className="h-8 w-8 text-gray-400 dark:text-gray-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No data available</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              There are no keywords or mentions to display for the selected time period.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Main bubble chart container */}
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Tree Structure - Positioned inside */}
      <div className="absolute top-4 left-4 w-[420px] h-[calc(100%-2rem)] bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <TreeStructure 
          className="h-full" 
          startDate={startDate} 
          endDate={endDate} 
          category={category}
          onKeywordClick={zoomToKeyword}
        />
      </div>
    </div>
  );
  };

export default BubbleKeyword; 