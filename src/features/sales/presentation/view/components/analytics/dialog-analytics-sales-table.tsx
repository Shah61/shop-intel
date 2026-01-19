import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AnalyticsSalesTable from "./analytics-sales-table";
import { useAnalysticsSales } from "../../../tanstack/analytics-tanstack";
import { ArrowRightIcon } from "lucide-react";

const DialogAnalyticsSalesTable = () => {

    const { data, isLoading, error } = useAnalysticsSales();
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <span className="hidden md:inline-block">View All</span>
                    <ArrowRightIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-[90%] md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] px-4 md:px-6 rounded-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Sales by Platform</DialogTitle>
                </DialogHeader>
                <AnalyticsSalesTable data={data || []} isLimit={false} />

            </DialogContent>
        </Dialog>
    )
}

export default DialogAnalyticsSalesTable;