"use client";

import AIScreen from '@/src/features/intelligence/presentation/view/screen/ai-screen';

const IntelligencePage = () => {
    return (
        <div className="w-screen min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -mx-4 md:-mx-10">
            <AIScreen />
        </div>
    );
};

export default IntelligencePage;