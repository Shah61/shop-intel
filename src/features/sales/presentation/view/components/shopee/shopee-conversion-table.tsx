import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ConversionEntity } from "@/src/features/sales/data/model/conversion-entity";
import { formatDateToMMDDYYYY } from "@/src/core/constant/helper";
import { ArrowRightIcon } from "lucide-react";
import { ShopeeConversionRate } from "@/src/features/sales/data/model/shopee-entity";
import { useSession } from "@/src/core/lib/dummy-session-provider";
import { formatCurrency, isAdmin } from "@/src/core/constant/helper";
import { useState } from "react";

const ShopeeConversionTable = ({
    conversionRate,
    onSelectTap,
    selectedTab,
    onLoadMore
}: {
    conversionRate: ShopeeConversionRate[],
    onSelectTap: () => void,
    selectedTab: string,
    onLoadMore: () => void
}) => {
    const { data: session } = useSession();
    const isUserAdmin = isAdmin(session?.user_entity || {});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const sortedConversionRate = [...conversionRate].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const totalPages = Math.ceil(sortedConversionRate.length / itemsPerPage);

    const handleNextPage = () => {
        if (currentPage === totalPages) {
            onLoadMore();
        } else {
            setCurrentPage(prev => prev + 1);
        }
    };

    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedConversionRate.slice(startIndex, startIndex + itemsPerPage);
    };

    return (
        <Card className="hover:shadow-lg transition-shadow h-full w-full">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <p className="text-lg font-bold">List Conversion</p>
                        <p className="text-sm text-muted-foreground font-normal">Conversion rate for each date</p>
                    </div>

                    {selectedTab !== "campaigns" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSelectTap}
                        >
                            <span className="hidden md:inline-block">View All</span>
                            <ArrowRightIcon className="h-4 w-4" />
                        </Button>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Revenus</TableHead>
                            <TableHead>Orders</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(selectedTab === "campaigns" ? getCurrentPageData() : sortedConversionRate.slice(0, 7)).map((conversion) => (
                            <TableRow key={conversion.date}>
                                <TableCell className="font-medium">{formatDateToMMDDYYYY(conversion.date)}</TableCell>
                                <TableCell>{formatCurrency(conversion.total_revenues)}</TableCell>
                                <TableCell>{conversion.total_orders}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {selectedTab === "campaigns" && (
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextPage}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ShopeeConversionTable;