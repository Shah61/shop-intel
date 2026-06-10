import type { Metadata } from "next"
import ProtectedLayoutClient from "./protected-layout-client"

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
}

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
    return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
};

export default ProtectedLayout;
