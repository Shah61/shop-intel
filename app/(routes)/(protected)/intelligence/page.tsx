"use client";

import AIScreen from '@/src/features/intelligence/presentation/view/screen/ai-screen';

const IntelligencePage = () => {
    return (
        <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-3.5rem)] overflow-hidden flex flex-col bg-background">
            <AIScreen />
        </div>
    );
};

export default IntelligencePage;