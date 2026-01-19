'use client';

import { useState } from 'react';
import { CopyIcon } from 'lucide-react';

const ApiDocumentationScreen = () => {
    const [activeTab, setActiveTab] = useState('cURL');
    const [activeResponseTab, setActiveResponseTab] = useState('200');
    const [activeEndpoint, setActiveEndpoint] = useState('market-analysis');

    const endpoints = {
        'market-analysis': {
            title: 'Market Analysis',
            description: 'Get comprehensive market analysis including price trends, volume, and key market indicators.',
            path: '/api/v1/market-analysis',
            method: 'GET',
            responseExample: `{
  "timestamp": 1708548723,
  "market_cap": "$2.34T",
  "24h_volume": "$98.7B",
  "btc_dominance": 52.3,
  "trends": [
    {
      "timeframe": "24h",
      "price_change_percentage": 2.45,
      "volume_change_percentage": 18.32
    },
    {
      "timeframe": "7d",
      "price_change_percentage": -3.21,
      "volume_change_percentage": 5.67
    }
  ],
  "indicators": {
    "rsi": 58.2,
    "fear_greed_index": 72,
    "average_sentiment": "bullish"
  }
}`
        },
        'bullbear-sentiment': {
            title: 'Bull/Bear Sentiment',
            description: 'Get real-time bull and bear sentiment metrics from social media, news sources, and on-chain data.',
            path: '/api/v1/bullbear-sentiment',
            method: 'GET',
            responseExample: `{
  "timestamp": 1708548723,
  "overall_sentiment": "bullish",
  "sentiment_score": 68.5,
  "sentiment_by_source": {
    "social_media": {
      "twitter": 72.1,
      "reddit": 65.4,
      "telegram": 70.8
    },
    "news": {
      "crypto_news": 62.3,
      "mainstream_media": 58.7
    },
    "on_chain": {
      "whale_transactions": "bullish",
      "exchange_flows": "neutral",
      "futures_funding": "bullish"
    }
  },
  "historical": [
    {
      "date": "2024-02-19",
      "score": 64.2
    },
    {
      "date": "2024-02-20",
      "score": 66.8
    },
    {
      "date": "2024-02-21",
      "score": 68.5
    }
  ]
}`
        },
        'coin-zone': {
            title: 'Coin Zone',
            description: 'Get detailed performance metrics and analysis for specific cryptocurrencies.',
            path: '/api/v1/coin-zone',
            method: 'GET',
            responseExample: `{
  "timestamp": 1708548723,
  "coins": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "price_usd": 52145.78,
      "market_cap": "$1.02T",
      "volume_24h": "$32.5B",
      "price_change_24h": 1.23,
      "price_change_7d": -2.45,
      "support_levels": [51000, 49500, 48000],
      "resistance_levels": [53000, 54500, 58000],
      "technical_analysis": {
        "rsi": 56.7,
        "macd": "bullish",
        "moving_averages": "buy"
      },
      "on_chain": {
        "active_addresses": 998754,
        "transaction_volume": "$12.3B",
        "average_transaction_fee": "$2.45"
      }
    },
    {
      "symbol": "ETH",
      "name": "Ethereum",
      "price_usd": 2956.34,
      "market_cap": "$354.1B",
      "volume_24h": "$14.2B",
      "price_change_24h": 3.45,
      "price_change_7d": 1.23
    }
  ]
}`
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            {/* Left Sidebar */}
            <div className="w-64 border-r border-border text-foreground">
                <div className="p-4 pt-6 space-y-6">
                    {/* Navigation Tabs */}
                    <div className="border-b border-border pb-4">
                        <div className="flex text-sm">
                            <div className="border-b-2 border-primary pb-2 mr-6 font-medium">Mooetrics API</div>
                            <div className="text-muted-foreground pb-2">Dashboard</div>
                        </div>
                    </div>

                    {/* Main Navigation */}
                    <div className="space-y-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Overview</p>
                            <p className="text-sm text-muted-foreground pl-2 py-1">Getting Started</p>
                            <p className="text-sm text-muted-foreground pl-2 py-1">Authentication</p>
                            <p className="text-sm text-muted-foreground pl-2 py-1">Rate Limits</p>
                            <p className="text-sm text-muted-foreground pl-2 py-1">Pagination</p>
                            <p className="text-sm text-muted-foreground pl-2 py-1">Error Handling</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm font-medium">API Reference</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">Endpoints</span>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>

                            <div className="space-y-3 pl-2">
                                <div
                                    className={`flex items-center space-x-2 text-sm cursor-pointer rounded-md ${activeEndpoint === 'market-analysis' ? 'bg-accent p-2' : 'p-2 hover:bg-accent/50'}`}
                                    onClick={() => setActiveEndpoint('market-analysis')}
                                >
                                    <span className="px-2 py-0.5 bg-green-900/20 text-green-500 text-xs rounded">GET</span>
                                    <span className={activeEndpoint === 'market-analysis' ? "text-foreground" : "text-muted-foreground"}>Market Analysis</span>
                                </div>

                                <div
                                    className={`flex items-center space-x-2 text-sm cursor-pointer rounded-md ${activeEndpoint === 'bullbear-sentiment' ? 'bg-accent p-2' : 'p-2 hover:bg-accent/50'}`}
                                    onClick={() => setActiveEndpoint('bullbear-sentiment')}
                                >
                                    <span className="px-2 py-0.5 bg-green-900/20 text-green-500 text-xs rounded">GET</span>
                                    <span className={activeEndpoint === 'bullbear-sentiment' ? "text-foreground" : "text-muted-foreground"}>Bull/Bear Sentiment</span>
                                </div>

                                <div
                                    className={`flex items-center space-x-2 text-sm cursor-pointer rounded-md ${activeEndpoint === 'coin-zone' ? 'bg-accent p-2' : 'p-2 hover:bg-accent/50'}`}
                                    onClick={() => setActiveEndpoint('coin-zone')}
                                >
                                    <span className="px-2 py-0.5 bg-green-900/20 text-green-500 text-xs rounded">GET</span>
                                    <span className={activeEndpoint === 'coin-zone' ? "text-foreground" : "text-muted-foreground"}>Coin Zone</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <div className="p-8 max-w-4xl">
                    <h2 className="text-primary text-sm mb-2">Endpoints</h2>
                    <h1 className="text-3xl font-bold mb-8">{endpoints[activeEndpoint as keyof typeof endpoints].title}</h1>

                    {/* API Endpoint */}
                    <div className="bg-card rounded-lg mb-8 border border-border">
                        <div className="flex items-center p-4 border-b border-border">
                            <div className="px-2 py-1 bg-green-900/20 text-green-500 text-sm rounded mr-3">GET</div>
                            <div className="font-mono text-card-foreground">{endpoints[activeEndpoint as keyof typeof endpoints].path}</div>
                            <button className="ml-auto bg-primary text-primary-foreground px-4 py-1 text-sm rounded-md flex items-center">
                                Try it
                                <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Code tabs */}
                        <div className="p-4">
                            <div className="flex border-b border-border mb-4">
                                <button
                                    className={`px-4 py-2 text-sm ${activeTab === 'cURL' ? 'text-primary border-b border-primary' : 'text-muted-foreground'}`}
                                    onClick={() => setActiveTab('cURL')}
                                >
                                    cURL
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm ${activeTab === 'Python' ? 'text-primary border-b border-primary' : 'text-muted-foreground'}`}
                                    onClick={() => setActiveTab('Python')}
                                >
                                    Python
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm ${activeTab === 'JavaScript' ? 'text-primary border-b border-primary' : 'text-muted-foreground'}`}
                                    onClick={() => setActiveTab('JavaScript')}
                                >
                                    JavaScript
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm ${activeTab === 'PHP' ? 'text-primary border-b border-primary' : 'text-muted-foreground'}`}
                                    onClick={() => setActiveTab('PHP')}
                                >
                                    PHP
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm ${activeTab === 'Go' ? 'text-primary border-b border-primary' : 'text-muted-foreground'}`}
                                    onClick={() => setActiveTab('Go')}
                                >
                                    Go
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm ${activeTab === 'Java' ? 'text-primary border-b border-primary' : 'text-muted-foreground'}`}
                                    onClick={() => setActiveTab('Java')}
                                >
                                    Java
                                </button>
                                <div className="ml-auto flex items-center">
                                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                                        <CopyIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-muted rounded p-4 font-mono text-sm">
                                <pre className="text-foreground">
                                    curl --request GET \<br />
                                    {'  '}--url https://api.mooetrics.com{endpoints[activeEndpoint as keyof typeof endpoints].path} \<br />
                                    {'  '}--header "Authorization: Bearer YOUR_API_KEY"
                                </pre>
                            </div>
                        </div>
                    </div>

                    <p className="text-muted-foreground mb-8">
                        {endpoints[activeEndpoint as keyof typeof endpoints].description}
                    </p>

                    {/* Query Parameters Section */}
                    <h2 className="text-2xl font-bold mb-4">Query Parameters</h2>
                    <div className="mb-8">
                        <div className="flex mb-2">
                            <div className="w-32 text-primary">timeframe</div>
                            <div className="w-20 text-muted-foreground">string</div>
                            <div className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">optional</div>
                        </div>
                        <p className="text-muted-foreground mb-4">Time period for the data (e.g., "24h", "7d", "30d", "1y"). Default is "24h".</p>

                        <div className="flex mb-2">
                            <div className="w-32 text-primary">limit</div>
                            <div className="w-20 text-muted-foreground">integer</div>
                            <div className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">optional</div>
                        </div>
                        <p className="text-muted-foreground mb-1">Number of results to return. Default is 10, maximum is 100.</p>
                    </div>

                    {/* Authorization Section */}
                    <h2 className="text-2xl font-bold mb-4">Authorization</h2>
                    <div className="mb-8">
                        <div className="flex mb-2">
                            <div className="w-32 text-primary">API Key</div>
                            <div className="w-20 text-muted-foreground">string</div>
                            <div className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded">required</div>
                        </div>
                        <p className="text-muted-foreground mb-1">Pass your API key in the Authorization header: <span className="font-mono">Authorization: Bearer YOUR_API_KEY</span></p>
                    </div>

                    {/* Response Section */}
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        Response
                        <span className="ml-auto flex items-center">
                            <div className="flex mr-2">
                                <button
                                    className={`px-2 py-1 text-sm ${activeResponseTab === '200' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                                    onClick={() => setActiveResponseTab('200')}
                                >
                                    200
                                </button>
                                <button
                                    className={`px-2 py-1 text-sm ${activeResponseTab === '400' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
                                    onClick={() => setActiveResponseTab('400')}
                                >
                                    400
                                </button>
                            </div>
                            <span className="text-sm text-muted-foreground">application/json</span>
                        </span>
                    </h2>

                    <div className="bg-muted rounded p-4 font-mono text-sm relative">
                        <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors">
                            <CopyIcon className="w-4 h-4" />
                        </button>
                        <pre className="text-foreground">
                            {endpoints[activeEndpoint as keyof typeof endpoints].responseExample}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiDocumentationScreen;