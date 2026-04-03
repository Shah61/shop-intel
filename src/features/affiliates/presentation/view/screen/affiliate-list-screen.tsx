"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import {
    Users,
    UserCheck,
    Wallet,
    DollarSign,
    Search,
    ChevronDown,
    ChevronUp,
    MoreHorizontal,
    ArrowUpDown,
    UserX,
    Loader2,
    Copy,
    Check,
    X,
    SlidersHorizontal,
    Eye,
    EyeOff,
    ClipboardList,
    UserPlus,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    Calendar,
    Mail,
    Phone,
    MapPin,
    User,
    ArrowLeft,
    RefreshCw,
    Link,
    Globe,
} from "lucide-react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { SmallLoader, MediumLoader } from "@/components/ui/shop-intel-loader";
import { formatCurrency } from "@/src/core/constant/helper";
import toast from "react-hot-toast";
import OverviewDataCard from "@/src/features/sales/presentation/view/components/analytics/overview-data-card";

/* ════════════════════════════════════════════════════════════════════
   DUMMY DATA — AFFILIATES
   ════════════════════════════════════════════════════════════════════ */

interface DummyBankDetail {
    bank_name: string;
    account_number: string;
    account_holder: string;
}

interface DummyUserAffiliate {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    bank_detail: DummyBankDetail;
}

interface DummyCommission {
    id: string;
    order_id: string;
    total_sales: number;
    commission: number;
    created_at: string;
}

interface DummyAffiliate {
    user_affiliate: DummyUserAffiliate;
    status: "active" | "inactive" | "pending";
    joined_at: string;
    total_sales_amount: number;
    total_commission_amount: number;
    total_unpaid_commission_amount: number;
    unpaid_commissions: DummyCommission[];
}

/* ════════════════════════════════════════════════════════════════════
   DUMMY DATA — APPLICATIONS
   ════════════════════════════════════════════════════════════════════ */

interface DummyApplication {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    address: string;
    product_applied: string;
    applied_at: string;
    status: "pending" | "approved" | "rejected";
    note?: string;
}

const DUMMY_APPLICATIONS: DummyApplication[] = [
    {
        id: "app-001", first_name: "Ahmad", last_name: "Firdaus", email: "ahmad.firdaus@gmail.com",
        phone: "+60 12-345 6789", date_of_birth: "1995-03-14", address: "No. 12, Jalan Mawar 3, Taman Bunga, 47100 Puchong, Selangor",
        product_applied: "Premium Skincare Bundle", applied_at: "2025-03-27T10:30:00Z", status: "pending",
    },
    {
        id: "app-002", first_name: "Rachel", last_name: "Tan", email: "rachel.tan@outlook.com",
        phone: "+60 16-789 0123", date_of_birth: "1992-07-22", address: "Unit 8-3, Kondominium Seri Aman, Jalan Ampang, 50450 Kuala Lumpur",
        product_applied: "Fitness Equipment Pro", applied_at: "2025-03-26T14:15:00Z", status: "pending",
    },
    {
        id: "app-003", first_name: "Ismail", last_name: "Zainal", email: "ismail.z@yahoo.com",
        phone: "+60 19-456 7890", date_of_birth: "1998-11-05", address: "Lot 45, Kampung Baru Sungai Buloh, 47000 Sungai Buloh, Selangor",
        product_applied: "Digital Marketing Course", applied_at: "2025-03-25T09:00:00Z", status: "pending",
    },
    {
        id: "app-004", first_name: "James", last_name: "Loh", email: "james.loh@icloud.com",
        phone: "+60 11-2345 6780", date_of_birth: "1990-01-30", address: "No. 7, Lorong Kenanga 5, Taman Sejahtera, 81100 Johor Bahru, Johor",
        product_applied: "Premium Skincare Bundle", applied_at: "2025-03-24T16:45:00Z", status: "pending",
    },
    {
        id: "app-005", first_name: "Nur", last_name: "Aisyah", email: "nur.aisyah@gmail.com",
        phone: "+60 13-678 9012", date_of_birth: "1997-05-18", address: "Block C-12-5, Pangsapuri Harmoni, Jalan Putra, 68000 Ampang, Selangor",
        product_applied: "Organic Tea Collection", applied_at: "2025-03-23T11:20:00Z", status: "pending",
    },
    {
        id: "app-006", first_name: "Vincent", last_name: "Chua", email: "v.chua@hotmail.com",
        phone: "+60 17-890 1234", date_of_birth: "1993-09-02", address: "No. 33, Jalan SS2/55, 47300 Petaling Jaya, Selangor",
        product_applied: "Tech Gadgets Starter Pack", applied_at: "2025-03-22T08:30:00Z", status: "pending",
    },
    {
        id: "app-007", first_name: "Kavitha", last_name: "Rajan", email: "kavitha.r@gmail.com",
        phone: "+60 14-567 8901", date_of_birth: "1996-12-11", address: "No. 5, Jalan Tun Sambanthan, 50470 Kuala Lumpur",
        product_applied: "Digital Marketing Course", applied_at: "2025-03-21T13:00:00Z", status: "pending",
    },
    {
        id: "app-008", first_name: "Hafiz", last_name: "Rahman", email: "hafiz.rahman@proton.me",
        phone: "+60 18-234 5678", date_of_birth: "1994-06-25", address: "No. 88, Persiaran Gurney, 10250 Georgetown, Penang",
        product_applied: "Premium Skincare Bundle", applied_at: "2025-03-20T15:40:00Z", status: "pending",
    },
    {
        id: "app-009", first_name: "Michelle", last_name: "Yong", email: "m.yong@outlook.com",
        phone: "+60 12-901 2345", date_of_birth: "1991-02-08", address: "Unit 15-A, The Horizon Residences, Jalan Tun Razak, 50400 Kuala Lumpur",
        product_applied: "Fitness Equipment Pro", applied_at: "2025-03-19T10:10:00Z", status: "pending",
    },
    {
        id: "app-010", first_name: "Amirul", last_name: "Hakim", email: "amirul.h@yahoo.com",
        phone: "+60 15-345 6789", date_of_birth: "1999-08-17", address: "No. 21, Taman Desa Jaya, Jalan Kepong, 52100 Kuala Lumpur",
        product_applied: "Organic Tea Collection", applied_at: "2025-03-18T12:50:00Z", status: "pending",
    },
    {
        id: "app-011", first_name: "Siew", last_name: "Lin", email: "siew.lin@gmail.com",
        phone: "+60 16-012 3456", date_of_birth: "1988-04-03", address: "No. 9, Jalan Bukit Bintang, 55100 Kuala Lumpur",
        product_applied: "Tech Gadgets Starter Pack", applied_at: "2025-03-17T09:30:00Z", status: "approved",
        note: "Strong social media presence with 15K followers",
    },
    {
        id: "app-012", first_name: "Ravi", last_name: "Chandran", email: "ravi.c@hotmail.com",
        phone: "+60 19-678 0123", date_of_birth: "1986-10-29", address: "No. 14, Jalan Sultan Ismail, 50250 Kuala Lumpur",
        product_applied: "Premium Skincare Bundle", applied_at: "2025-03-16T14:20:00Z", status: "rejected",
        note: "Competitor affiliate — conflict of interest",
    },
    {
        id: "app-013", first_name: "Zulaikha", last_name: "Mohamad", email: "zulaikha.m@gmail.com",
        phone: "+60 11-7890 1234", date_of_birth: "2000-01-15", address: "No. 77, Jalan Raja Chulan, 50200 Kuala Lumpur",
        product_applied: "Digital Marketing Course", applied_at: "2025-03-15T11:00:00Z", status: "approved",
        note: "Previous experience in digital marketing affiliates",
    },
    {
        id: "app-014", first_name: "Timothy", last_name: "Goh", email: "tim.goh@outlook.com",
        phone: "+60 13-456 7801", date_of_birth: "1987-07-07", address: "No. 2, Lorong Damai, Taman Tun Dr Ismail, 60000 Kuala Lumpur",
        product_applied: "Organic Tea Collection", applied_at: "2025-03-14T16:00:00Z", status: "rejected",
        note: "Incomplete social media verification",
    },
];

const DUMMY_AFFILIATES: DummyAffiliate[] = [
    {
        user_affiliate: {
            id: "aff-001",
            first_name: "Sarah",
            last_name: "Ahmad",
            email: "sarah.ahmad@gmail.com",
            bank_detail: { bank_name: "Maybank", account_number: "1234567890", account_holder: "Sarah Ahmad" },
        },
        status: "active",
        joined_at: "2024-08-15T00:00:00Z",
        total_sales_amount: 12500,
        total_commission_amount: 875,
        total_unpaid_commission_amount: 320,
        unpaid_commissions: [
            { id: "c-001", order_id: "ORD-4821", total_sales: 450, commission: 45, created_at: "2025-03-10T00:00:00Z" },
            { id: "c-002", order_id: "ORD-4835", total_sales: 890, commission: 89, created_at: "2025-03-12T00:00:00Z" },
            { id: "c-003", order_id: "ORD-4901", total_sales: 1860, commission: 186, created_at: "2025-03-18T00:00:00Z" },
        ],
    },
    {
        user_affiliate: {
            id: "aff-002",
            first_name: "Muhammad",
            last_name: "Rizki",
            email: "m.rizki@outlook.com",
            bank_detail: { bank_name: "CIMB Bank", account_number: "9876543210", account_holder: "Muhammad Rizki" },
        },
        status: "active",
        joined_at: "2024-06-20T00:00:00Z",
        total_sales_amount: 28900,
        total_commission_amount: 2023,
        total_unpaid_commission_amount: 580,
        unpaid_commissions: [
            { id: "c-004", order_id: "ORD-4910", total_sales: 2300, commission: 230, created_at: "2025-03-15T00:00:00Z" },
            { id: "c-005", order_id: "ORD-4922", total_sales: 3500, commission: 350, created_at: "2025-03-20T00:00:00Z" },
        ],
    },
    {
        user_affiliate: {
            id: "aff-003",
            first_name: "Aisha",
            last_name: "Tan",
            email: "aisha.tan@yahoo.com",
            bank_detail: { bank_name: "Public Bank", account_number: "5678901234", account_holder: "Aisha Tan" },
        },
        status: "active",
        joined_at: "2024-11-02T00:00:00Z",
        total_sales_amount: 6200,
        total_commission_amount: 434,
        total_unpaid_commission_amount: 155,
        unpaid_commissions: [
            { id: "c-006", order_id: "ORD-4930", total_sales: 780, commission: 78, created_at: "2025-03-19T00:00:00Z" },
            { id: "c-007", order_id: "ORD-4941", total_sales: 770, commission: 77, created_at: "2025-03-22T00:00:00Z" },
        ],
    },
    {
        user_affiliate: {
            id: "aff-004",
            first_name: "Lim",
            last_name: "Wei Jie",
            email: "weijie.lim@gmail.com",
            bank_detail: { bank_name: "Hong Leong Bank", account_number: "1122334455", account_holder: "Lim Wei Jie" },
        },
        status: "inactive",
        joined_at: "2024-03-10T00:00:00Z",
        total_sales_amount: 3400,
        total_commission_amount: 238,
        total_unpaid_commission_amount: 0,
        unpaid_commissions: [],
    },
    {
        user_affiliate: {
            id: "aff-005",
            first_name: "Nurul",
            last_name: "Huda",
            email: "nurul.huda@hotmail.com",
            bank_detail: { bank_name: "Bank Islam", account_number: "6677889900", account_holder: "Nurul Huda" },
        },
        status: "active",
        joined_at: "2025-01-05T00:00:00Z",
        total_sales_amount: 18700,
        total_commission_amount: 1309,
        total_unpaid_commission_amount: 470,
        unpaid_commissions: [
            { id: "c-008", order_id: "ORD-4950", total_sales: 1200, commission: 120, created_at: "2025-03-14T00:00:00Z" },
            { id: "c-009", order_id: "ORD-4965", total_sales: 2100, commission: 210, created_at: "2025-03-21T00:00:00Z" },
            { id: "c-010", order_id: "ORD-4980", total_sales: 1400, commission: 140, created_at: "2025-03-25T00:00:00Z" },
        ],
    },
    {
        user_affiliate: {
            id: "aff-006",
            first_name: "Raj",
            last_name: "Kumar",
            email: "raj.kumar@gmail.com",
            bank_detail: { bank_name: "RHB Bank", account_number: "4455667788", account_holder: "Raj Kumar" },
        },
        status: "active",
        joined_at: "2024-09-18T00:00:00Z",
        total_sales_amount: 9800,
        total_commission_amount: 686,
        total_unpaid_commission_amount: 245,
        unpaid_commissions: [
            { id: "c-011", order_id: "ORD-4990", total_sales: 980, commission: 98, created_at: "2025-03-16T00:00:00Z" },
            { id: "c-012", order_id: "ORD-5001", total_sales: 1470, commission: 147, created_at: "2025-03-23T00:00:00Z" },
        ],
    },
    {
        user_affiliate: {
            id: "aff-007",
            first_name: "Fatimah",
            last_name: "Zahra",
            email: "fatimah.z@gmail.com",
            bank_detail: { bank_name: "AmBank", account_number: "3344556677", account_holder: "Fatimah Zahra" },
        },
        status: "active",
        joined_at: "2024-12-01T00:00:00Z",
        total_sales_amount: 15300,
        total_commission_amount: 1071,
        total_unpaid_commission_amount: 390,
        unpaid_commissions: [
            { id: "c-013", order_id: "ORD-5010", total_sales: 1950, commission: 195, created_at: "2025-03-17T00:00:00Z" },
            { id: "c-014", order_id: "ORD-5025", total_sales: 1950, commission: 195, created_at: "2025-03-24T00:00:00Z" },
        ],
    },
    {
        user_affiliate: {
            id: "aff-008",
            first_name: "Daniel",
            last_name: "Ong",
            email: "daniel.ong@outlook.com",
            bank_detail: { bank_name: "Maybank", account_number: "8899001122", account_holder: "Daniel Ong" },
        },
        status: "inactive",
        joined_at: "2024-04-22T00:00:00Z",
        total_sales_amount: 2100,
        total_commission_amount: 147,
        total_unpaid_commission_amount: 0,
        unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-009", first_name: "Hana", last_name: "Sofia", email: "hana.s@icloud.com", bank_detail: { bank_name: "Maybank", account_number: "2233445566", account_holder: "Hana Sofia" } },
        status: "active", joined_at: "2024-05-12T00:00:00Z", total_sales_amount: 11200, total_commission_amount: 784, total_unpaid_commission_amount: 210,
        unpaid_commissions: [{ id: "c-015", order_id: "ORD-5100", total_sales: 600, commission: 60, created_at: "2025-03-20T00:00:00Z" }],
    },
    {
        user_affiliate: { id: "aff-010", first_name: "Jason", last_name: "Teoh", email: "j.teoh@gmail.com", bank_detail: { bank_name: "Public Bank", account_number: "3344556677", account_holder: "Jason Teoh" } },
        status: "pending", joined_at: "2025-02-01T00:00:00Z", total_sales_amount: 0, total_commission_amount: 0, total_unpaid_commission_amount: 0, unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-011", first_name: "Priya", last_name: "Menon", email: "priya.menon@yahoo.com", bank_detail: { bank_name: "CIMB Bank", account_number: "4455667788", account_holder: "Priya Menon" } },
        status: "active", joined_at: "2023-11-08T00:00:00Z", total_sales_amount: 45200, total_commission_amount: 3164, total_unpaid_commission_amount: 890,
        unpaid_commissions: [{ id: "c-016", order_id: "ORD-5201", total_sales: 3200, commission: 320, created_at: "2025-03-22T00:00:00Z" }],
    },
    {
        user_affiliate: { id: "aff-012", first_name: "Kevin", last_name: "Wong", email: "k.wong@outlook.com", bank_detail: { bank_name: "Hong Leong Bank", account_number: "5566778899", account_holder: "Kevin Wong" } },
        status: "active", joined_at: "2024-07-19T00:00:00Z", total_sales_amount: 7600, total_commission_amount: 532, total_unpaid_commission_amount: 0, unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-013", first_name: "Siti", last_name: "Noraini", email: "snoraini@hotmail.com", bank_detail: { bank_name: "Bank Islam", account_number: "6677889900", account_holder: "Siti Noraini" } },
        status: "inactive", joined_at: "2023-09-30T00:00:00Z", total_sales_amount: 4100, total_commission_amount: 287, total_unpaid_commission_amount: 0, unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-014", first_name: "Ethan", last_name: "Cheah", email: "ethan.cheah@gmail.com", bank_detail: { bank_name: "RHB Bank", account_number: "7788990011", account_holder: "Ethan Cheah" } },
        status: "active", joined_at: "2024-10-05T00:00:00Z", total_sales_amount: 13400, total_commission_amount: 938, total_unpaid_commission_amount: 412,
        unpaid_commissions: [{ id: "c-017", order_id: "ORD-5302", total_sales: 1800, commission: 180, created_at: "2025-03-24T00:00:00Z" }],
    },
    {
        user_affiliate: { id: "aff-015", first_name: "Amelia", last_name: "Gomez", email: "amelia.g@proton.me", bank_detail: { bank_name: "Maybank", account_number: "8899001122", account_holder: "Amelia Gomez" } },
        status: "active", joined_at: "2025-01-18T00:00:00Z", total_sales_amount: 5600, total_commission_amount: 392, total_unpaid_commission_amount: 95,
        unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-016", first_name: "Vikram", last_name: "Singh", email: "vikram.singh@gmail.com", bank_detail: { bank_name: "AmBank", account_number: "9900112233", account_holder: "Vikram Singh" } },
        status: "active", joined_at: "2024-02-14T00:00:00Z", total_sales_amount: 22100, total_commission_amount: 1547, total_unpaid_commission_amount: 620,
        unpaid_commissions: [{ id: "c-018", order_id: "ORD-5403", total_sales: 2400, commission: 240, created_at: "2025-03-26T00:00:00Z" }],
    },
    {
        user_affiliate: { id: "aff-017", first_name: "Chloe", last_name: "Ng", email: "chloe.ng@icloud.com", bank_detail: { bank_name: "CIMB Bank", account_number: "0011223344", account_holder: "Chloe Ng" } },
        status: "pending", joined_at: "2025-03-01T00:00:00Z", total_sales_amount: 800, total_commission_amount: 56, total_unpaid_commission_amount: 56,
        unpaid_commissions: [{ id: "c-019", order_id: "ORD-5504", total_sales: 800, commission: 56, created_at: "2025-03-27T00:00:00Z" }],
    },
    {
        user_affiliate: { id: "aff-018", first_name: "Darren", last_name: "Lee", email: "darren.lee@outlook.com", bank_detail: { bank_name: "Public Bank", account_number: "1122334455", account_holder: "Darren Lee" } },
        status: "active", joined_at: "2023-12-03T00:00:00Z", total_sales_amount: 31800, total_commission_amount: 2226, total_unpaid_commission_amount: 0, unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-019", first_name: "Yasmin", last_name: "Ibrahim", email: "y.ibrahim@gmail.com", bank_detail: { bank_name: "Maybank", account_number: "2233445577", account_holder: "Yasmin Ibrahim" } },
        status: "active", joined_at: "2024-04-28T00:00:00Z", total_sales_amount: 9100, total_commission_amount: 637, total_unpaid_commission_amount: 180,
        unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-020", first_name: "Marcus", last_name: "Ho", email: "marcus.ho@yahoo.com", bank_detail: { bank_name: "Hong Leong Bank", account_number: "3344556688", account_holder: "Marcus Ho" } },
        status: "inactive", joined_at: "2023-08-15T00:00:00Z", total_sales_amount: 1500, total_commission_amount: 105, total_unpaid_commission_amount: 0, unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-021", first_name: "Nadia", last_name: "Rahman", email: "nadia.r@gmail.com", bank_detail: { bank_name: "Bank Islam", account_number: "4455667799", account_holder: "Nadia Rahman" } },
        status: "active", joined_at: "2024-09-09T00:00:00Z", total_sales_amount: 16800, total_commission_amount: 1176, total_unpaid_commission_amount: 340,
        unpaid_commissions: [{ id: "c-020", order_id: "ORD-5605", total_sales: 1100, commission: 110, created_at: "2025-03-21T00:00:00Z" }],
    },
    {
        user_affiliate: { id: "aff-022", first_name: "Oscar", last_name: "Fernandez", email: "o.fernandez@outlook.com", bank_detail: { bank_name: "RHB Bank", account_number: "5566778800", account_holder: "Oscar Fernandez" } },
        status: "active", joined_at: "2024-01-22T00:00:00Z", total_sales_amount: 7400, total_commission_amount: 518, total_unpaid_commission_amount: 0, unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-023", first_name: "Mei Ling", last_name: "Chow", email: "ml.chow@gmail.com", bank_detail: { bank_name: "Maybank", account_number: "6677889911", account_holder: "Mei Ling Chow" } },
        status: "active", joined_at: "2024-06-30T00:00:00Z", total_sales_amount: 20500, total_commission_amount: 1435, total_unpaid_commission_amount: 505,
        unpaid_commissions: [{ id: "c-021", order_id: "ORD-5706", total_sales: 2900, commission: 290, created_at: "2025-03-28T00:00:00Z" }],
    },
    {
        user_affiliate: { id: "aff-024", first_name: "Irfan", last_name: "Hakim", email: "irfan.h@hotmail.com", bank_detail: { bank_name: "CIMB Bank", account_number: "7788990022", account_holder: "Irfan Hakim" } },
        status: "pending", joined_at: "2025-03-10T00:00:00Z", total_sales_amount: 0, total_commission_amount: 0, total_unpaid_commission_amount: 0, unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-025", first_name: "Sophie", last_name: "Lim", email: "sophie.lim@icloud.com", bank_detail: { bank_name: "Public Bank", account_number: "8899001133", account_holder: "Sophie Lim" } },
        status: "active", joined_at: "2023-10-17T00:00:00Z", total_sales_amount: 39200, total_commission_amount: 2744, total_unpaid_commission_amount: 1200,
        unpaid_commissions: [{ id: "c-022", order_id: "ORD-5807", total_sales: 4500, commission: 450, created_at: "2025-03-11T00:00:00Z" }],
    },
    {
        user_affiliate: { id: "aff-026", first_name: "Arjun", last_name: "Nair", email: "arjun.nair@gmail.com", bank_detail: { bank_name: "AmBank", account_number: "9900112244", account_holder: "Arjun Nair" } },
        status: "active", joined_at: "2024-11-25T00:00:00Z", total_sales_amount: 6300, total_commission_amount: 441, total_unpaid_commission_amount: 88,
        unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-027", first_name: "Bella", last_name: "Kusuma", email: "bella.k@yahoo.com", bank_detail: { bank_name: "Maybank", account_number: "0011223355", account_holder: "Bella Kusuma" } },
        status: "inactive", joined_at: "2024-02-08T00:00:00Z", total_sales_amount: 2800, total_commission_amount: 196, total_unpaid_commission_amount: 0, unpaid_commissions: [],
    },
    {
        user_affiliate: { id: "aff-028", first_name: "Zach", last_name: "Yap", email: "zach.yap@outlook.com", bank_detail: { bank_name: "Hong Leong Bank", account_number: "1122334466", account_holder: "Zach Yap" } },
        status: "active", joined_at: "2024-12-12T00:00:00Z", total_sales_amount: 14100, total_commission_amount: 987, total_unpaid_commission_amount: 275,
        unpaid_commissions: [{ id: "c-023", order_id: "ORD-5908", total_sales: 1650, commission: 165, created_at: "2025-03-29T00:00:00Z" }],
    },
];

/* ════════════════════════════════════════════════════════════════════
   HELPER — Generate unique affiliate code
   ════════════════════════════════════════════════════════════════════ */

function generateAffiliateCode(firstName: string, lastName: string): string {
    const prefix = (firstName.slice(0, 2) + lastName.slice(0, 2)).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
}

function slugifyProduct(product: string): string {
    return product
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

/* ════════════════════════════════════════════════════════════════════
   STATUS BADGE (shimmer — matching PlatformBadge from AnalyticsSalesTable)
   ════════════════════════════════════════════════════════════════════ */

function StatusBadge({ status }: { status: "active" | "inactive" | "pending" | "approved" | "rejected" }) {
    const map: Record<string, { gradient: string; shadow: string; label: string }> = {
        active: { gradient: "linear-gradient(135deg, #22c55e, #4ade80)", shadow: "0 2px 8px rgba(34,197,94,0.3)", label: "Active" },
        inactive: { gradient: "linear-gradient(135deg, #ef4444, #f87171)", shadow: "0 2px 8px rgba(239,68,68,0.3)", label: "Inactive" },
        pending: { gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)", shadow: "0 2px 8px rgba(245,158,11,0.3)", label: "Pending" },
        approved: { gradient: "linear-gradient(135deg, #22c55e, #4ade80)", shadow: "0 2px 8px rgba(34,197,94,0.3)", label: "Approved" },
        rejected: { gradient: "linear-gradient(135deg, #ef4444, #f87171)", shadow: "0 2px 8px rgba(239,68,68,0.3)", label: "Rejected" },
    };
    const c = map[status] || map.active;
    return (
        <span
            style={{
                display: "inline-flex", alignItems: "center", position: "relative", overflow: "hidden",
                background: c.gradient, boxShadow: c.shadow, borderRadius: 6, padding: "2px 8px",
                fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                color: "#fff", lineHeight: 1.6,
            }}
        >
            <span style={{ position: "relative", zIndex: 1 }}>{c.label}</span>
            <span style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                backgroundSize: "200% 100%", animation: "shimmer-badge 2s infinite linear",
            }} />
        </span>
    );
}

/* ════════════════════════════════════════════════════════════════════
   APPROVE DRAWER — Side drawer (PC) / Bottom drawer (Tablet/Mobile)
   ════════════════════════════════════════════════════════════════════ */

function ApproveDrawer({
    application,
    open,
    onOpenChange,
    onConfirmApprove,
    isDark,
    theme,
}: {
    application: DummyApplication;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmApprove: (id: string) => void;
    isDark: boolean;
    theme: any;
}) {
    const [isDesktop, setIsDesktop] = useState(false);
    const [desktopMounted, setDesktopMounted] = useState(false);
    const [desktopVisible, setDesktopVisible] = useState(false);
    const enterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [code, setCode] = useState(() => generateAffiliateCode(application.first_name, application.last_name));
    const [url, setUrl] = useState(() => `https://${slugifyProduct(application.product_applied)}.myshop.com`);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const fullUrl = `${url}/${code}`;

    useEffect(() => {
        // Use side drawer only on true desktop-class pointers.
        // iPads in landscape should still use bottom drawer.
        const media = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
        const apply = () => setIsDesktop(media.matches);
        apply();
        media.addEventListener("change", apply);
        return () => media.removeEventListener("change", apply);
    }, []);

    useEffect(() => {
        if (!isDesktop) {
            if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
            if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
            setDesktopVisible(false);
            setDesktopMounted(false);
            return;
        }

        if (open) {
            if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
            setDesktopMounted(true);
            setDesktopVisible(false);
            // Ensure one paint in hidden state before animating in.
            enterTimerRef.current = setTimeout(() => setDesktopVisible(true), 20);
            return;
        }

        if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
        setDesktopVisible(false);
        exitTimerRef.current = setTimeout(() => setDesktopMounted(false), 260);
        return () => {
            if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        };
    }, [open, isDesktop]);

    const handleGenerateCode = () => {
        setCode(generateAffiliateCode(application.first_name, application.last_name));
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success("Copied!");
        setTimeout(() => setCopiedField(null), 1500);
    };

    const handleConfirm = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            onConfirmApprove(application.id);
            setIsSubmitting(false);
            onOpenChange(false);
        }, 800);
    };

    /* ── Shared form content ── */
    const formContent = (
        <div style={{ display: "flex", flexDirection: "column", gap: 0, fontFamily: "'Outfit', sans-serif" }}>
            {/* Applicant info fields (read-only) */}
            {[
                { icon: <User size={14} />, label: "Name", value: `${application.first_name} ${application.last_name}` },
                { icon: <Mail size={14} />, label: "Email", value: application.email },
                { icon: <Calendar size={14} />, label: "Date of Birth", value: new Date(application.date_of_birth).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" }) },
                { icon: <MapPin size={14} />, label: "Address", value: application.address },
            ].map((field, idx) => (
                <div
                    key={field.label}
                    style={{
                        display: "flex", alignItems: "flex-start", gap: 12,
                        padding: "14px 0",
                        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    }}
                >
                    <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: isDark ? "rgba(var(--preset-primary-rgb), 0.1)" : "rgba(var(--preset-primary-rgb), 0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--preset-primary)", marginTop: 1,
                    }}>
                        {field.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: 10, fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8",
                            textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3,
                        }}>
                            {field.label}
                        </div>
                        <div style={{
                            fontSize: 13, fontWeight: 600,
                            color: isDark ? "#e2e8f0" : "#1a1a2e",
                            lineHeight: 1.4, wordBreak: "break-word",
                        }}>
                            {field.value}
                        </div>
                    </div>
                </div>
            ))}

            {/* Code field */}
            <div style={{
                padding: "14px 0",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: isDark ? "rgba(var(--preset-primary-rgb), 0.1)" : "rgba(var(--preset-primary-rgb), 0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--preset-primary)", marginTop: 1,
                    }}>
                        <Link size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: 10, fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8",
                            textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6,
                        }}>
                            Affiliate Code
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{
                                flex: 1, padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                letterSpacing: "0.5px",
                                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                                color: isDark ? "#e2e8f0" : "#1a1a2e",
                            }}>
                                {code}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCopy(code, "code")}
                                style={{
                                    width: 34, height: 34, borderRadius: 9, border: "none", flexShrink: 0,
                                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                                    color: isDark ? "#94a3b8" : "#64748b",
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.15s",
                                }}
                            >
                                {copiedField === "code" ? <Check size={14} style={{ color: "#22c55e" }} /> : <Copy size={14} />}
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerateCode}
                                style={{
                                    display: "flex", alignItems: "center", gap: 5,
                                    padding: "7px 12px", borderRadius: 9, border: "none", flexShrink: 0,
                                    background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                    color: "#fff", fontSize: 11, fontWeight: 700,
                                    cursor: "pointer", transition: "all 0.15s",
                                    boxShadow: "0 2px 8px rgba(var(--preset-primary-rgb), 0.25)",
                                }}
                            >
                                <RefreshCw size={12} />
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* URL field (editable) */}
            <div style={{
                padding: "14px 0",
                borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
            }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: isDark ? "rgba(var(--preset-primary-rgb), 0.1)" : "rgba(var(--preset-primary-rgb), 0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--preset-primary)", marginTop: 1,
                    }}>
                        <Globe size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: 10, fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8",
                            textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6,
                        }}>
                            URL
                        </div>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            style={{
                                width: "100%", padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500,
                                background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                                color: isDark ? "#e2e8f0" : "#1a1a2e",
                                outline: "none", fontFamily: "'Outfit', sans-serif",
                                transition: "border-color 0.15s",
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--preset-primary)"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"; }}
                        />
                    </div>
                </div>
            </div>

            {/* Full URL (read-only) */}
            <div style={{ padding: "14px 0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                        background: isDark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#22c55e", marginTop: 1,
                    }}>
                        <Link size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: 10, fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8",
                            textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6,
                        }}>
                            Full Affiliate URL
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{
                                flex: 1, padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                background: isDark ? "rgba(34,197,94,0.06)" : "rgba(34,197,94,0.04)",
                                border: `1px solid ${isDark ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.12)"}`,
                                color: isDark ? "#4ade80" : "#16a34a",
                                wordBreak: "break-all", lineHeight: 1.5,
                            }}>
                                {fullUrl}
                            </div>
                            <button
                                type="button"
                                onClick={() => handleCopy(fullUrl, "fullUrl")}
                                style={{
                                    width: 34, height: 34, borderRadius: 9, border: "none", flexShrink: 0,
                                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                                    color: isDark ? "#94a3b8" : "#64748b",
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all 0.15s",
                                }}
                            >
                                {copiedField === "fullUrl" ? <Check size={14} style={{ color: "#22c55e" }} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    /* ── Shared footer buttons ── */
    const footerButtons = (
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                style={{
                    flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    background: "transparent",
                    color: isDark ? "#e2e8f0" : "#1a1a2e",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    fontFamily: "'Outfit', sans-serif",
                }}
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                style={{
                    flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                    border: "none",
                    background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                    color: "#fff",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: "0 4px 16px rgba(var(--preset-primary-rgb), 0.3)",
                    fontFamily: "'Outfit', sans-serif",
                }}
            >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Approve & Create
            </button>
        </div>
    );

    return isDesktop ? (
        <>
            {/* ── Desktop: Side drawer (right) ── */}
            {desktopMounted && (
                    <div
                        style={{
                            position: "fixed", inset: 0, zIndex: 9999,
                            display: "flex", justifyContent: "flex-end",
                        }}
                        onClick={(e) => { if (e.target === e.currentTarget) onOpenChange(false); }}
                    >
                        <div style={{
                            position: "absolute", inset: 0,
                            background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                            opacity: desktopVisible ? 1 : 0,
                            transition: "opacity 260ms cubic-bezier(0.22, 1, 0.36, 1)",
                        }} />
                        <div
                            style={{
                                position: "relative", zIndex: 1,
                                width: "100%", maxWidth: 480, height: "100vh",
                                background: isDark ? "hsl(222, 20%, 14%)" : "#fff",
                                boxShadow: "-8px 0 40px rgba(0,0,0,0.2)",
                                display: "flex", flexDirection: "column",
                                transform: desktopVisible ? "translateX(0)" : "translateX(100%)",
                                opacity: desktopVisible ? 1 : 0.98,
                                transition: "transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms cubic-bezier(0.22, 1, 0.36, 1)",
                                fontFamily: "'Outfit', sans-serif",
                                color: isDark ? "#e2e8f0" : "#1a1a2e",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div style={{
                                background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                padding: "20px 24px 24px",
                                position: "relative", overflow: "hidden", flexShrink: 0,
                            }}>
                                <div style={{
                                    position: "absolute", top: -30, right: -30, width: 120, height: 120,
                                    background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                                    pointerEvents: "none",
                                }} />
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <UserPlus size={18} style={{ color: "#fff" }} />
                                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>
                                            Approve Affiliate
                                        </h2>
                                    </div>
                                    <button
                                        onClick={() => onOpenChange(false)}
                                        style={{
                                            width: 32, height: 32, borderRadius: 9, border: "none",
                                            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
                                            color: "#fff", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 12,
                                        background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 16, fontWeight: 700, color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                    }}>
                                        {application.first_name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>
                                            {application.first_name} {application.last_name}
                                        </p>
                                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>
                                            {application.product_applied}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Body (scrollable) */}
                            <div style={{ flex: 1, overflowY: "auto", padding: "4px 24px 0" }}>
                                {formContent}
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: "16px 24px 20px", flexShrink: 0,
                                borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                            }}>
                                {footerButtons}
                            </div>
                        </div>
                    </div>
                )}
        </>
    ) : (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent
                style={{ fontFamily: "'Outfit', sans-serif" }}
            >
                <div style={{ maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
                    <DrawerHeader className="text-left">
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0,
                            }}>
                                {application.first_name[0].toUpperCase()}
                            </div>
                            <div>
                                <DrawerTitle style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                                    Approve Affiliate
                                </DrawerTitle>
                                <DrawerDescription style={{ fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
                                    {application.first_name} {application.last_name} — {application.product_applied}
                                </DrawerDescription>
                            </div>
                        </div>
                    </DrawerHeader>

                    <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
                        {formContent}
                    </div>

                    <DrawerFooter>
                        {footerButtons}
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

/* ════════════════════════════════════════════════════════════════════
   APPLICATION DETAIL VIEW (View More panel)
   ════════════════════════════════════════════════════════════════════ */

function ApplicationDetailView({
    application,
    onClose,
    onApprove,
    onReject,
    isDark,
    theme,
}: {
    application: DummyApplication;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isDark: boolean;
    theme: any;
}) {
    const [isRejecting, setIsRejecting] = useState(false);

    const handleReject = () => {
        setIsRejecting(true);
        setTimeout(() => {
            onReject(application.id);
            setIsRejecting(false);
        }, 800);
    };

    const infoFields = [
        { icon: <User size={14} />, label: "First Name", value: application.first_name },
        { icon: <User size={14} />, label: "Last Name", value: application.last_name },
        { icon: <Calendar size={14} />, label: "Date of Birth", value: new Date(application.date_of_birth).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" }) },
        { icon: <MapPin size={14} />, label: "Address", value: application.address },
        { icon: <Mail size={14} />, label: "Email", value: application.email },
        { icon: <Phone size={14} />, label: "Phone", value: application.phone },
    ];

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            <div
                style={{
                    position: "relative", zIndex: 1,
                    width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
                    margin: "0 16px",
                    background: isDark ? "hsl(222, 20%, 14%)" : "#fff",
                    borderRadius: 20, padding: 0,
                    boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
                    fontFamily: "'Outfit', sans-serif",
                    color: isDark ? "#e2e8f0" : "#1a1a2e",
                    overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient header */}
                <div style={{
                    background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                    padding: "24px 24px 32px",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute", top: -30, right: -30, width: 120, height: 120,
                        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />
                    <div style={{
                        position: "absolute", bottom: -20, left: -20, width: 80, height: 80,
                        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <button
                            onClick={onClose}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)",
                                border: "none", borderRadius: 10, padding: "6px 12px",
                                color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600,
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <StatusBadge status={application.status} />
                    </div>

                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(10px)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, fontWeight: 700, color: "#fff", flexShrink: 0,
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}>
                            {application.first_name[0].toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>
                                {application.first_name} {application.last_name}
                            </h2>
                            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", margin: "2px 0 0" }}>
                                Applied for <strong>{application.product_applied}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: "20px 24px 24px" }}>
                    {/* Applied date chip */}
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                        border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                        borderRadius: 10, padding: "6px 12px", marginBottom: 20,
                    }}>
                        <Clock size={12} style={{ color: isDark ? "#94a3b8" : "#64748b" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b" }}>
                            Applied {new Date(application.applied_at).toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })} at {new Date(application.applied_at).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                    </div>

                    {/* Info fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {infoFields.map((field, idx) => (
                            <div
                                key={field.label}
                                style={{
                                    display: "flex", alignItems: "flex-start", gap: 12,
                                    padding: "14px 0",
                                    borderBottom: idx < infoFields.length - 1
                                        ? `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`
                                        : "none",
                                }}
                            >
                                <div style={{
                                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                                    background: isDark ? "rgba(var(--preset-primary-rgb), 0.1)" : "rgba(var(--preset-primary-rgb), 0.08)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "var(--preset-primary)",
                                    marginTop: 1,
                                }}>
                                    {field.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: 10, fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8",
                                        textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3,
                                    }}>
                                        {field.label}
                                    </div>
                                    <div style={{
                                        fontSize: 13, fontWeight: 600,
                                        color: isDark ? "#e2e8f0" : "#1a1a2e",
                                        lineHeight: 1.4,
                                        wordBreak: "break-word",
                                    }}>
                                        {field.value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Note if exists */}
                    {application.note && (
                        <div style={{
                            marginTop: 16, padding: "12px 14px", borderRadius: 12,
                            background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                        }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: isDark ? "#64748b" : "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                                Note
                            </div>
                            <div style={{ fontSize: 12, color: isDark ? "#cbd5e1" : "#475569", lineHeight: 1.5 }}>
                                {application.note}
                            </div>
                        </div>
                    )}

                    {/* Action buttons (only for pending) */}
                    {application.status === "pending" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
                            <button
                                onClick={handleReject}
                                disabled={isRejecting}
                                style={{
                                    flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                                    border: `1px solid ${isDark ? "rgba(239,68,68,0.3)" : "rgba(239,68,68,0.2)"}`,
                                    background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)",
                                    color: "#ef4444",
                                    cursor: isRejecting ? "not-allowed" : "pointer",
                                    transition: "all 0.15s",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                }}
                            >
                                {isRejecting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                Reject
                            </button>
                            <button
                                onClick={() => onApprove(application.id)}
                                disabled={isRejecting}
                                style={{
                                    flex: 1, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 700,
                                    border: "none",
                                    background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                    color: "#fff",
                                    cursor: isRejecting ? "not-allowed" : "pointer",
                                    opacity: isRejecting ? 0.5 : 1,
                                    transition: "all 0.15s",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    boxShadow: "0 4px 16px rgba(var(--preset-primary-rgb), 0.3)",
                                }}
                            >
                                <CheckCircle2 size={14} />
                                Approve
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   APPLICATION LIST TAB CONTENT
   ════════════════════════════════════════════════════════════════════ */

function ApplicationsTab({
    applications,
    setApplications,
    isDark,
    theme,
    isLoading,
}: {
    applications: DummyApplication[];
    setApplications: React.Dispatch<React.SetStateAction<DummyApplication[]>>;
    isDark: boolean;
    theme: any;
    isLoading: boolean;
}) {
    const [appStatusFilter, setAppStatusFilter] = useState<string>("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedApp, setSelectedApp] = useState<DummyApplication | null>(null);
    const [approveDrawerApp, setApproveDrawerApp] = useState<DummyApplication | null>(null);
    const [approveDrawerOpen, setApproveDrawerOpen] = useState(false);

    const filteredApps = useMemo(() => {
        let filtered = applications;
        if (appStatusFilter !== "all") {
            filtered = filtered.filter((a) => a.status === appStatusFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (a) =>
                    a.first_name.toLowerCase().includes(q) ||
                    a.last_name.toLowerCase().includes(q) ||
                    a.email.toLowerCase().includes(q) ||
                    a.product_applied.toLowerCase().includes(q)
            );
        }
        return filtered;
    }, [applications, appStatusFilter, searchQuery]);

    const appMeta = useMemo(() => ({
        total: applications.length,
        pending: applications.filter((a) => a.status === "pending").length,
        approved: applications.filter((a) => a.status === "approved").length,
        rejected: applications.filter((a) => a.status === "rejected").length,
    }), [applications]);

    /** Opens the approve drawer instead of immediately approving */
    const handleOpenApproveDrawer = (app: DummyApplication) => {
        setApproveDrawerApp(app);
        setApproveDrawerOpen(true);
        // If the detail modal is open, close it
        setSelectedApp(null);
    };

    /** Called when the approve drawer confirms */
    const handleConfirmApprove = (id: string) => {
        setApplications((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: "approved" as const, note: a.note || "Approved by admin" } : a))
        );
        setApproveDrawerApp(null);
        setApproveDrawerOpen(false);
        toast.success("Application approved & affiliate created!");
    };

    const handleReject = (id: string) => {
        setApplications((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: "rejected" as const, note: a.note || "Rejected by admin" } : a))
        );
        setSelectedApp(null);
        toast.success("Application rejected");
    };

    /** Triggered from the detail modal's Approve button */
    const handleApproveFromDetail = (id: string) => {
        const app = applications.find((a) => a.id === id);
        if (app) {
            handleOpenApproveDrawer(app);
        }
    };

    const appStatusOptions = [
        { value: "pending", label: "Pending", count: appMeta.pending },
        { value: "approved", label: "Approved", count: appMeta.approved },
        { value: "rejected", label: "Rejected", count: appMeta.rejected },
        { value: "all", label: "All", count: appMeta.total },
    ];

    return (
        <>
            {/* Mini stat cards */}
            <div
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}
                className="!grid-cols-1 sm:!grid-cols-3"
            >
                {[
                    { label: "Pending Review", value: appMeta.pending, icon: <Clock size={18} />, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                    { label: "Approved", value: appMeta.approved, icon: <CheckCircle2 size={18} />, color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                    { label: "Rejected", value: appMeta.rejected, icon: <XCircle size={18} />, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            background: theme.cardBg, border: theme.cardBorder, borderRadius: 14,
                            padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
                            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                            position: "relative", overflow: "hidden",
                        }}
                    >
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center",
                            color: stat.color, flexShrink: 0,
                        }}>
                            {stat.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: theme.title, lineHeight: 1.1 }}>{stat.value}</div>
                            <div style={{ fontSize: 11, fontWeight: 500, color: theme.subtitle, marginTop: 2 }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Applications table card */}
            <div
                style={{
                    background: theme.cardBg, borderRadius: 20, border: theme.cardBorder,
                    padding: "22px 26px", display: "flex", flexDirection: "column", gap: 16,
                    position: "relative", overflow: "hidden",
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                }}
            >
                <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`, pointerEvents: "none" }} />

                {isLoading && (
                    <div style={{
                        position: "absolute", inset: 0,
                        background: isDark ? "rgba(26, 34, 44, 0.78)" : "rgba(250, 247, 255, 0.72)",
                        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
                        zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20,
                    }}>
                        <MediumLoader label="Loading applications" className="!py-4" />
                    </div>
                )}

                {/* Header + status filters */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.title, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                            Applications
                        </h2>
                        <p style={{ fontSize: 12, color: theme.subtitle, margin: "4px 0 0" }}>
                            {filteredApps.length} application{filteredApps.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <div style={{ background: theme.pillBg, borderRadius: 10, padding: 3, display: "flex", gap: 2 }}>
                        {appStatusOptions.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setAppStatusFilter(opt.value)}
                                style={{
                                    fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8,
                                    border: "none", cursor: "pointer", transition: "all 0.15s ease",
                                    color: appStatusFilter === opt.value ? theme.pillActiveText : theme.pillText,
                                    background: appStatusFilter === opt.value ? theme.pillActive : "transparent",
                                    boxShadow: appStatusFilter === opt.value ? "0 1px 4px rgba(var(--preset-primary-rgb), 0.25)" : "none",
                                    display: "flex", alignItems: "center", gap: 4,
                                }}
                            >
                                {opt.label}
                                {opt.count > 0 && (
                                    <span style={{
                                        fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 6,
                                        background: appStatusFilter === opt.value ? "rgba(255,255,255,0.2)" : theme.expandBtnBg,
                                        color: appStatusFilter === opt.value ? "#fff" : theme.subtitle,
                                    }}>
                                        {opt.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: theme.inputBg, border: theme.cardBorder, borderRadius: 12, padding: "0 14px" }}>
                    <Search size={15} style={{ color: theme.subtitle, flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or product..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 500, background: "transparent", border: "none", outline: "none", color: theme.title, fontFamily: "'Outfit', sans-serif" }}
                    />
                </div>

                {/* Application list */}
                <div style={{
                    borderRadius: 14,
                    border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
                    background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
                    overflow: "hidden",
                }}>
                    {filteredApps.length === 0 ? (
                        <div style={{ padding: "48px 20px", textAlign: "center" }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: theme.subtitle, marginBottom: 4 }}>
                                No {appStatusFilter !== "all" ? appStatusFilter : ""} applications
                            </div>
                            <div style={{ fontSize: 12, color: isDark ? "#475569" : "#94a3b8" }}>
                                {appStatusFilter === "pending" ? "All caught up! No pending reviews." : "Try changing the filter to see more."}
                            </div>
                        </div>
                    ) : (
                        filteredApps.map((app, idx) => (
                            <div
                                key={app.id}
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "14px 18px", gap: 12,
                                    borderBottom: idx < filteredApps.length - 1
                                        ? (isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)")
                                        : "none",
                                    transition: "background 0.15s ease",
                                    cursor: "pointer",
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(var(--preset-primary-rgb), 0.04)" : "rgba(var(--preset-primary-rgb), 0.06)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                onClick={() => setSelectedApp(app)}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                                    }}>
                                        {app.first_name[0].toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: theme.cellBold }}>
                                                {app.first_name} {app.last_name}
                                            </span>
                                            {appStatusFilter === "all" && <StatusBadge status={app.status} />}
                                        </div>
                                        <div style={{ fontSize: 11, color: theme.cellText, marginTop: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                            <span>{app.product_applied}</span>
                                            <span style={{ opacity: 0.5 }}>•</span>
                                            <span>{new Date(app.applied_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                    {/* Quick action buttons (only for pending) */}
                                    {app.status === "pending" && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenApproveDrawer(app); }}
                                                title="Approve"
                                                style={{
                                                    width: 30, height: 30, borderRadius: 8, border: "none",
                                                    background: "rgba(34,197,94,0.1)", color: "#22c55e",
                                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                                    transition: "all 0.15s",
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.2)"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.1)"; }}
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleReject(app.id); }}
                                                title="Reject"
                                                style={{
                                                    width: 30, height: 30, borderRadius: 8, border: "none",
                                                    background: "rgba(239,68,68,0.1)", color: "#ef4444",
                                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                                    transition: "all 0.15s",
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    )}
                                    {/* View more arrow */}
                                    <div style={{
                                        width: 30, height: 30, borderRadius: 8,
                                        background: theme.expandBtnBg,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: theme.subtitle,
                                    }}>
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail modal */}
            {selectedApp && (
                <ApplicationDetailView
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onApprove={handleApproveFromDetail}
                    onReject={handleReject}
                    isDark={isDark}
                    theme={theme}
                />
            )}

            {/* Approve drawer */}
            {approveDrawerApp && (
                <ApproveDrawer
                    application={approveDrawerApp}
                    open={approveDrawerOpen}
                    onOpenChange={(open) => {
                        setApproveDrawerOpen(open);
                        if (!open) {
                            // Delay clearing the app so close animation can finish
                            setTimeout(() => setApproveDrawerApp(null), 300);
                        }
                    }}
                    onConfirmApprove={handleConfirmApprove}
                    isDark={isDark}
                    theme={theme}
                />
            )}
        </>
    );
}

/* ════════════════════════════════════════════════════════════════════
   PAYOUT DIALOG (fully self-contained, no portals that break clicks)
   ════════════════════════════════════════════════════════════════════ */

function PayoutDialog({
    affiliate,
    onClose,
    isDark,
}: {
    affiliate: DummyAffiliate;
    onClose: () => void;
    isDark: boolean;
}) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const commissions = affiliate.unpaid_commissions;

    const totalSelected = commissions
        .filter((c) => selectedIds.includes(c.id))
        .reduce((s, c) => s + c.commission, 0);

    const handleToggle = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedIds(checked ? commissions.map((c) => c.id) : []);
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success("Copied!");
        setTimeout(() => setCopiedField(null), 1500);
    };

    const handleSubmit = () => {
        if (selectedIds.length === 0) {
            toast.error("Select at least one commission");
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            toast.success(`Payout of ${formatCurrency(totalSelected)} created!`);
            setIsSubmitting(false);
            onClose();
        }, 1200);
    };

    const bank = affiliate.user_affiliate.bank_detail;

    return (
        <div
            style={{
                position: "fixed", inset: 0, zIndex: 9999,
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            <div
                style={{
                    position: "relative", zIndex: 1,
                    width: "100%", maxWidth: 600, maxHeight: "85vh", overflowY: "auto",
                    margin: "0 16px",
                    background: isDark ? "hsl(222, 20%, 14%)" : "#fff",
                    borderRadius: 16, padding: "24px",
                    boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
                    fontFamily: "'Outfit', sans-serif",
                    color: isDark ? "#e2e8f0" : "#1a1a2e",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Create Payout</h2>
                        <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "4px 0 0" }}>
                            {affiliate.user_affiliate.first_name} {affiliate.user_affiliate.last_name}
                        </p>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: isDark ? "#94a3b8" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={16} />
                    </button>
                </div>

                <div style={{ borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, padding: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Bank Details</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        {[
                            { label: "Bank", value: bank.bank_name, field: "bank" },
                            { label: "Account No.", value: bank.account_number, field: "acc" },
                            { label: "Holder", value: bank.account_holder, field: "holder" },
                        ].map(({ label, value, field }) => (
                            <div key={field}>
                                <div style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8", marginBottom: 2 }}>{label}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                                    <button type="button" onClick={() => handleCopy(value, field)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                                        {copiedField === field ? <Check size={12} style={{ color: "#22c55e" }} /> : <Copy size={12} style={{ color: isDark ? "#64748b" : "#94a3b8" }} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ borderRadius: 12, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, overflow: "hidden", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                        <Checkbox checked={selectedIds.length === commissions.length && commissions.length > 0} onCheckedChange={(v) => handleSelectAll(!!v)} />
                        <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Select All</span>
                        <span style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>{selectedIds.length} / {commissions.length} selected</span>
                    </div>
                    <div style={{ maxHeight: 220, overflowY: "auto" }}>
                        {commissions.length === 0 ? (
                            <div style={{ padding: "24px 14px", textAlign: "center", fontSize: 13, color: isDark ? "#64748b" : "#94a3b8" }}>No unpaid commissions</div>
                        ) : (
                            commissions.map((c) => (
                                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`, transition: "background 0.15s", cursor: "pointer" }}
                                    onClick={() => handleToggle(c.id)}
                                    onMouseOver={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)")}
                                    onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <Checkbox checked={selectedIds.includes(c.id)} onCheckedChange={() => handleToggle(c.id)} />
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>Order #{c.order_id}</div>
                                            <div style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>Sales: {formatCurrency(c.total_sales)} • Commission: {formatCurrency(c.commission)}</div>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 11, color: isDark ? "#64748b" : "#94a3b8" }}>{new Date(c.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 12, marginBottom: 20, background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Total Payout</span>
                    <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{formatCurrency(totalSelected)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} disabled={isSubmitting} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1a1a2e", cursor: "pointer", transition: "all 0.15s" }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={isSubmitting || selectedIds.length === 0} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: selectedIds.length === 0 ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)") : "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", color: selectedIds.length === 0 ? (isDark ? "#475569" : "#94a3b8") : "#fff", cursor: selectedIds.length === 0 ? "not-allowed" : "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}>
                        {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                        Create Payout
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   DELETE CONFIRM DIALOG
   ════════════════════════════════════════════════════════════════════ */

function DeleteDialog({
    affiliate,
    onClose,
    onConfirm,
    isDark,
}: {
    affiliate: DummyAffiliate;
    onClose: () => void;
    onConfirm: () => void;
    isDark: boolean;
}) {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, margin: "0 16px", background: isDark ? "hsl(222, 20%, 14%)" : "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", fontFamily: "'Outfit', sans-serif", color: isDark ? "#e2e8f0" : "#1a1a2e" }}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Are you sure?</h2>
                <p style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#64748b", margin: "0 0 20px", lineHeight: 1.5 }}>
                    This will permanently delete the affiliate account for{" "}
                    <strong>{affiliate.user_affiliate.first_name} {affiliate.user_affiliate.last_name}</strong>. This action cannot be undone.
                </p>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={onClose} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1a1a2e", cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => { onConfirm(); onClose(); }} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", background: "linear-gradient(135deg, #ef4444, #f87171)", color: "#fff", cursor: "pointer" }}>Delete</button>
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   QUICK VIEW PANEL
   ════════════════════════════════════════════════════════════════════ */

function AffiliateQuickView({
    affiliate,
    onClose,
    theme,
}: {
    affiliate: DummyAffiliate;
    onClose: () => void;
    theme: any;
}) {
    const user = affiliate.user_affiliate;
    const commissionRate =
        affiliate.total_sales_amount > 0
            ? ((affiliate.total_commission_amount + affiliate.total_unpaid_commission_amount) / affiliate.total_sales_amount * 100).toFixed(1)
            : "0.0";

    const stats = [
        { label: "Total Sales", value: formatCurrency(affiliate.total_sales_amount) },
        { label: "Paid Commission", value: formatCurrency(affiliate.total_commission_amount) },
        { label: "Unpaid Commission", value: formatCurrency(affiliate.total_unpaid_commission_amount) },
        { label: "Joined", value: new Date(affiliate.joined_at).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" }) },
    ];

    return (
        <div style={{ background: theme.cardBg, border: theme.cardBorder, borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16, fontFamily: "'Outfit', sans-serif", position: "relative", overflow: "hidden", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`, pointerEvents: "none" }} />
            <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28, borderRadius: 8, border: "none", background: theme.expandBtnBg, color: theme.subtitle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                <X size={14} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: `0 2px 12px ${theme.glowColor}` }}>
                    {(user.first_name?.[0] || "A").toUpperCase()}
                </div>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.title, margin: 0, lineHeight: 1.2 }}>{user.first_name} {user.last_name}</h3>
                    <p style={{ fontSize: 12, color: theme.subtitle, margin: "2px 0 0" }}>{user.email}</p>
                </div>
            </div>
            <div style={{ background: theme.expandBtnBg, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 500, color: theme.subtitle, textTransform: "uppercase", letterSpacing: "0.4px" }}>Effective Rate</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: theme.title, fontFamily: "'Outfit', sans-serif" }}>{commissionRate}%</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {stats.map((s) => (
                    <div key={s.label}>
                        <div style={{ fontSize: 10, color: theme.subtitle, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: theme.title }}>{s.value}</div>
                    </div>
                ))}
            </div>
            <div style={{ width: "100%", height: 1, background: theme.divider }} />
            <div>
                <div style={{ fontSize: 10, color: theme.subtitle, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Bank Details</div>
                {[
                    { l: "Bank", v: user.bank_detail.bank_name },
                    { l: "Account", v: user.bank_detail.account_number },
                    { l: "Holder", v: user.bank_detail.account_holder },
                ].map(({ l, v }) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: theme.subtitle }}>{l}</span>
                        <span style={{ color: theme.title, fontWeight: 600 }}>{v}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Same lazy-load mascot as Facebook Marketing campaigns table */
function AffiliateLoadMoreMascots({ text, subColor }: { text: string; subColor: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "28px 16px" }}>
            <svg width={72} height={72} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 0 20px rgba(167,139,250,0.4))" }}>
                <defs>
                    <radialGradient id="affLoadGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                        <stop offset="40%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="40" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.4">
                    <animate attributeName="r" values="35;45;35" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="50" r="28" fill="url(#affLoadGradient)">
                    <animate attributeName="r" values="26;30;26" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="50" cy="50" r="34" stroke="rgba(255,255,255,0.3)" strokeDasharray="4 6" strokeWidth="1" fill="none">
                    <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="6s" repeatCount="indefinite" />
                </circle>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, color: subColor, letterSpacing: "0.04em" }}>{text}</span>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════════════
   MAIN SCREEN
   ════════════════════════════════════════════════════════════════════ */

const AffiliateListScreen = () => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    /* ── Top-level tab: "affiliates" | "applications" ── */
    const [activeTab, setActiveTab] = useState<"affiliates" | "applications">("affiliates");

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [revealedAmounts, setRevealedAmounts] = useState(true);
    const [cardsExpanded, setCardsExpanded] = useState(false);
    const [payoutAffiliate, setPayoutAffiliate] = useState<DummyAffiliate | null>(null);
    const [deleteAffiliate, setDeleteAffiliate] = useState<DummyAffiliate | null>(null);
    const [quickViewAffiliate, setQuickViewAffiliate] = useState<DummyAffiliate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [affiliates, setAffiliates] = useState<DummyAffiliate[]>([]);
    const [applications, setApplications] = useState<DummyApplication[]>([]);

    const perPage = 20;
    const [visibleAffiliateCount, setVisibleAffiliateCount] = useState(perPage);
    const [loadingAffiliatesMore, setLoadingAffiliatesMore] = useState(false);
    const sentinelAffiliateRef = useRef<HTMLDivElement | null>(null);
    const loadAffiliateLockRef = useRef(false);
    const sortedAffiliateLenRef = useRef(0);
    const visibleAffiliateRef = useRef(perPage);

    // Simulate loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setAffiliates(DUMMY_AFFILIATES);
            setApplications(DUMMY_APPLICATIONS);
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const pendingAppCount = useMemo(() => applications.filter((a) => a.status === "pending").length, [applications]);

    const filteredData = useMemo(() => {
        if (statusFilter === "all") return affiliates;
        return affiliates.filter((a) => a.status === statusFilter);
    }, [affiliates, statusFilter]);

    const meta = useMemo(() => {
        const total = affiliates.length;
        const active = affiliates.filter((a) => a.status === "active").length;
        const inactive = affiliates.filter((a) => a.status === "inactive").length;
        const pending = affiliates.filter((a) => a.status === "pending").length;
        const total_commission = affiliates.reduce((s, a) => s + a.total_commission_amount, 0);
        const total_unpaid = affiliates.reduce((s, a) => s + a.total_unpaid_commission_amount, 0);
        const withUnpaid = affiliates.filter((a) => a.total_unpaid_commission_amount > 0).length;
        const paidPositive = affiliates.filter((a) => a.total_commission_amount > 0).length;
        const avgPaidPerAff = total > 0 ? total_commission / total : 0;
        const avgUnpaidAmongOwed = withUnpaid > 0 ? total_unpaid / withUnpaid : 0;
        return { total, active, inactive, pending, total_commission, total_unpaid, withUnpaid, paidPositive, avgPaidPerAff, avgUnpaidAmongOwed };
    }, [affiliates]);

    /* ── Theme tokens ── */
    const t = useMemo(() => {
        if (isDark) {
            return {
                cardBg: "linear-gradient(135deg, rgba(26, 34, 44, 0.9), rgba(35, 45, 56, 0.85))",
                cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.12)",
                glowColor: "rgba(var(--preset-primary-rgb), 0.08)",
                title: "hsl(var(--foreground))",
                subtitle: "hsl(var(--muted-foreground))",
                subtitleAccent: "var(--preset-lighter)",
                headerText: "hsl(var(--muted-foreground))",
                cellText: "hsl(var(--muted-foreground))",
                cellBold: "hsl(var(--foreground))",
                rowHover: "rgba(var(--preset-primary-rgb), 0.06)",
                divider: "rgba(var(--preset-primary-rgb), 0.08)",
                inputBg: "rgba(var(--preset-primary-rgb), 0.06)",
                expandBtnBg: "rgba(var(--preset-primary-rgb), 0.06)",
                pillBg: "rgba(var(--preset-primary-rgb), 0.12)",
                pillActive: "rgba(var(--preset-primary-rgb), 0.6)",
                pillText: "var(--preset-lighter)",
                pillActiveText: "#fff",
                statIconBg: (h: string) => `hsla(${h}, 70%, 50%, 0.12)`,
                statIconColor: (h: string) => `hsla(${h}, 70%, 65%, 1)`,
            };
        }
        return {
            cardBg: "linear-gradient(135deg, rgba(250, 247, 255, 0.95), rgba(243, 237, 255, 0.85))",
            cardBorder: "1px solid rgba(var(--preset-primary-rgb), 0.1)",
            glowColor: "rgba(var(--preset-primary-rgb), 0.05)",
            title: "hsl(var(--foreground))",
            subtitle: "hsl(var(--muted-foreground))",
            subtitleAccent: "var(--preset-primary)",
            headerText: "hsl(var(--muted-foreground))",
            cellText: "hsl(var(--muted-foreground))",
            cellBold: "hsl(var(--foreground))",
            rowHover: "rgba(var(--preset-primary-rgb), 0.04)",
            divider: "rgba(var(--preset-primary-rgb), 0.08)",
            inputBg: "rgba(var(--preset-primary-rgb), 0.04)",
            expandBtnBg: "rgba(var(--preset-primary-rgb), 0.04)",
            pillBg: "rgba(var(--preset-primary-rgb), 0.08)",
            pillActive: "rgba(var(--preset-primary-rgb), 0.85)",
            pillText: "var(--preset-primary)",
            pillActiveText: "#fff",
            statIconBg: (h: string) => `hsla(${h}, 70%, 50%, 0.1)`,
            statIconColor: (h: string) => `hsla(${h}, 70%, 45%, 1)`,
        };
    }, [isDark]);

    /* ── Table columns ── */
    const columns: ColumnDef<DummyAffiliate>[] = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                        aria-label="Select all"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "user_affiliate",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Name <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => {
                    const user = row.original.user_affiliate;
                    return (
                        <div style={{ cursor: "pointer" }} onClick={() => setQuickViewAffiliate(row.original)}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--preset-primary), var(--preset-lighter))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                    {(user.first_name?.[0] || "A").toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: t.cellBold }}>{user.first_name} {user.last_name}</div>
                                    <div style={{ fontSize: 11, color: t.cellText }}>{user.email}</div>
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                accessorKey: "joined_at",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Joined <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => (
                    <span style={{ fontSize: 12, color: t.cellText }}>{new Date(row.original.joined_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}</span>
                ),
            },
            {
                accessorKey: "total_sales_amount",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Sales <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => (
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.cellBold }}>{revealedAmounts ? formatCurrency(row.original.total_sales_amount) : "••••••"}</span>
                ),
            },
            {
                accessorKey: "total_commission_amount",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Paid <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => (
                    <span style={{ fontSize: 12, color: t.cellText }}>{revealedAmounts ? formatCurrency(row.original.total_commission_amount) : "••••••"}</span>
                ),
            },
            {
                accessorKey: "total_unpaid_commission_amount",
                header: ({ column }) => (
                    <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.5px", padding: 0 }}>
                        Unpaid <ArrowUpDown size={12} />
                    </button>
                ),
                cell: ({ row }) => {
                    const amt = row.original.total_unpaid_commission_amount;
                    return (
                        <span style={{ fontSize: 12, fontWeight: amt > 0 ? 600 : 400, color: amt > 0 ? (isDark ? "#fbbf24" : "#d97706") : t.cellText }}>
                            {revealedAmounts ? formatCurrency(amt) : "••••••"}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                enableHiding: false,
                cell: ({ row }) => {
                    const aff = row.original;
                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: t.expandBtnBg, color: t.subtitle, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <MoreHorizontal size={14} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setQuickViewAffiliate(aff)}>View Details <Eye className="ml-2 h-4 w-4" /></DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { if (aff.unpaid_commissions.length > 0) { setPayoutAffiliate(aff); } else { toast.error("No unpaid commissions."); } }}>Mark as Paid <DollarSign className="ml-2 h-4 w-4" /></DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setDeleteAffiliate(aff)}>Delete <UserX className="ml-2 h-4 w-4" /></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [t, isDark, revealedAmounts]
    );

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: { sorting, columnFilters, columnVisibility, rowSelection },
    });

    const sortedAffiliateRows = table.getSortedRowModel().rows;
    sortedAffiliateLenRef.current = sortedAffiliateRows.length;
    visibleAffiliateRef.current = visibleAffiliateCount;
    const visibleAffiliateRows = sortedAffiliateRows.slice(0, visibleAffiliateCount);
    const hasMoreAffiliates = visibleAffiliateCount < sortedAffiliateRows.length;
    const affiliateTableTotalPages = Math.max(1, Math.ceil(sortedAffiliateRows.length / perPage));
    const affiliateTableCurrentPage = Math.min(affiliateTableTotalPages, Math.max(1, Math.ceil(visibleAffiliateCount / perPage)));

    const handleLoadMoreAffiliates = useCallback(() => {
        if (loadAffiliateLockRef.current) return;
        if (visibleAffiliateRef.current >= sortedAffiliateLenRef.current) return;
        loadAffiliateLockRef.current = true;
        setLoadingAffiliatesMore(true);
        window.setTimeout(() => {
            setVisibleAffiliateCount((prev) => Math.min(prev + perPage, sortedAffiliateLenRef.current));
            setLoadingAffiliatesMore(false);
            loadAffiliateLockRef.current = false;
        }, 650);
    }, [perPage]);

    useEffect(() => {
        setVisibleAffiliateCount(perPage);
        visibleAffiliateRef.current = perPage;
    }, [filteredData, statusFilter, columnFilters, perPage]);

    useEffect(() => {
        if (isLoading) return;
        const el = sentinelAffiliateRef.current;
        if (!el || loadingAffiliatesMore || !hasMoreAffiliates) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting && !loadAffiliateLockRef.current) handleLoadMoreAffiliates();
            },
            { root: null, rootMargin: "200px", threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMoreAffiliates, loadingAffiliatesMore, handleLoadMoreAffiliates, isLoading, sortedAffiliateRows.length, visibleAffiliateCount]);

    const statusOptions = [
        { value: "all", label: "All" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
    ];

    /* ── Tab definitions ── */
    const tabs = [
        { id: "affiliates" as const, label: "Affiliates", icon: <Users size={15} /> },
        { id: "applications" as const, label: "Applications", icon: <ClipboardList size={15} />, badge: pendingAppCount },
    ];

    /* ════════════════════════════════════════════════════════════════
       RENDER
       ════════════════════════════════════════════════════════════════ */

    return (
        <div className="affiliate-dashboard flex flex-col gap-4 w-full" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <style>{`
                @keyframes shimmer-badge { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3">
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                        Affiliates
                    </h2>
                    <p style={{ fontSize: 13, color: t.subtitle, margin: "4px 0 0" }}>
                        Manage your affiliates and review applications
                    </p>
                </div>
                <button
                    onClick={() => setRevealedAmounts((r) => !r)}
                    style={{
                        display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
                        padding: "7px 14px", borderRadius: 10, border: t.cardBorder, cursor: "pointer",
                        color: t.subtitle, background: t.expandBtnBg, transition: "all 0.15s ease",
                    }}
                >
                    {revealedAmounts ? <Eye size={14} /> : <EyeOff size={14} />}
                    {revealedAmounts ? "Hide Amounts" : "Show Amounts"}
                </button>
            </div>

            {/* ── Main Tabs ── */}
            <div style={{
                display: "flex", gap: 2, padding: 3, borderRadius: 12,
                background: t.pillBg, width: "fit-content",
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600,
                            padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                            transition: "all 0.2s ease",
                            color: activeTab === tab.id ? t.pillActiveText : t.pillText,
                            background: activeTab === tab.id ? t.pillActive : "transparent",
                            boxShadow: activeTab === tab.id ? "0 2px 8px rgba(var(--preset-primary-rgb), 0.25)" : "none",
                            position: "relative",
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.badge != null && tab.badge > 0 && (
                            <span style={{
                                fontSize: 10, fontWeight: 700, lineHeight: 1,
                                padding: "2px 6px", borderRadius: 8, minWidth: 18, textAlign: "center",
                                background: activeTab === tab.id ? "rgba(255,255,255,0.25)" : "linear-gradient(135deg, #f59e0b, #fbbf24)",
                                color: activeTab === tab.id ? "#fff" : "#fff",
                                boxShadow: activeTab !== tab.id ? "0 1px 4px rgba(245,158,11,0.35)" : "none",
                            }}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ── TAB: Affiliates ── */}
            {activeTab === "affiliates" && (
                <div style={{ animation: "fadeIn 0.25s ease-out" }} className="flex flex-col gap-4">
                    {/* Stat cards */}
                    <div
                        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, width: "100%" }}
                        className="overview-platform-grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4"
                    >
                        <OverviewDataCard variant="stat" customTitle="Total Affiliates" customIcon={<Users size={22} strokeWidth={2} />} metricSubtitle="Registered affiliates" primaryValueDisplay={String(meta.total)} expandLabel1="Active" expandValue1Display={String(meta.active)} expandLabel2="Inactive" expandValue2Display={String(meta.inactive)} isLoading={isLoading} expanded={cardsExpanded} onExpandToggle={() => setCardsExpanded((e) => !e)} />
                        <OverviewDataCard variant="stat" customTitle="Active Affiliates" customIcon={<UserCheck size={22} strokeWidth={2} />} metricSubtitle="Currently active" primaryValueDisplay={String(meta.active)} expandLabel1="Pending" expandValue1Display={String(meta.pending)} expandLabel2="Inactive" expandValue2Display={String(meta.inactive)} isLoading={isLoading} expanded={cardsExpanded} onExpandToggle={() => setCardsExpanded((e) => !e)} />
                        <OverviewDataCard variant="stat" customTitle="Total Commissions" customIcon={<Wallet size={22} strokeWidth={2} />} metricSubtitle="Total commissions paid" primaryValueDisplay={revealedAmounts ? formatCurrency(meta.total_commission) : "RM ••••••"} expandLabel1="Avg. per affiliate" expandValue1Display={revealedAmounts ? formatCurrency(meta.avgPaidPerAff) : "••••••"} expandLabel2="With payouts" expandValue2Display={String(meta.paidPositive)} isLoading={isLoading} expanded={cardsExpanded} onExpandToggle={() => setCardsExpanded((e) => !e)} />
                        <OverviewDataCard variant="stat" customTitle="Unpaid Commissions" customIcon={<DollarSign size={22} strokeWidth={2} />} metricSubtitle="Awaiting payout" primaryValueDisplay={revealedAmounts ? formatCurrency(meta.total_unpaid) : "RM ••••••"} expandLabel1="Affiliates owed" expandValue1Display={String(meta.withUnpaid)} expandLabel2="Avg. owed" expandValue2Display={revealedAmounts ? formatCurrency(meta.avgUnpaidAmongOwed) : "••••••"} isLoading={isLoading} expanded={cardsExpanded} onExpandToggle={() => setCardsExpanded((e) => !e)} />
                    </div>

                    {/* Table Card */}
                    <div
                        style={{
                            background: t.cardBg, borderRadius: 20, border: t.cardBorder,
                            padding: "22px 26px", display: "flex", flexDirection: "column", gap: 16,
                            position: "relative", overflow: "hidden",
                            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                        }}
                    >
                        <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, background: `radial-gradient(circle, ${t.glowColor} 0%, transparent 70%)`, pointerEvents: "none" }} />

                        {isLoading && (
                            <div style={{ position: "absolute", inset: 0, background: isDark ? "rgba(26, 34, 44, 0.78)" : "rgba(250, 247, 255, 0.72)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20 }}>
                                <MediumLoader label="Loading affiliates" className="!py-4" />
                            </div>
                        )}

                        {/* Table header */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                            <div>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: t.title, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.2 }}>Affiliate Directory</h2>
                                <p style={{ fontSize: 12, color: t.subtitle, margin: "4px 0 0" }}>{filteredData.length} affiliates</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                                <div style={{ background: t.pillBg, borderRadius: 10, padding: 3, display: "flex", gap: 2 }}>
                                    {statusOptions.map((opt) => (
                                        <button key={opt.value} type="button" onClick={() => setStatusFilter(opt.value)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", transition: "all 0.15s ease", color: statusFilter === opt.value ? t.pillActiveText : t.pillText, background: statusFilter === opt.value ? t.pillActive : "transparent", boxShadow: statusFilter === opt.value ? "0 1px 4px rgba(var(--preset-primary-rgb), 0.25)" : "none" }}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button type="button" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: t.cardBorder, cursor: "pointer", color: t.subtitle, background: t.expandBtnBg }}>
                                            <SlidersHorizontal size={14} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                                            <DropdownMenuCheckboxItem key={col.id} className="capitalize" checked={col.getIsVisible()} onCheckedChange={(v) => col.toggleVisibility(!!v)}>
                                                {col.id.replace(/_/g, " ")}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Search */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: t.inputBg, border: t.cardBorder, borderRadius: 12, padding: "0 14px" }}>
                            <Search size={15} style={{ color: t.subtitle, flexShrink: 0 }} />
                            <input type="text" placeholder="Search affiliates by name..." value={(table.getColumn("user_affiliate")?.getFilterValue() as string) ?? ""} onChange={(e) => table.getColumn("user_affiliate")?.setFilterValue(e.target.value)} style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 500, background: "transparent", border: "none", outline: "none", color: t.title, fontFamily: "'Outfit', sans-serif" }} />
                        </div>

                        {/* Table + Quick View */}
                        <div style={{ display: "flex", gap: 16 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ borderRadius: 14, border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)", background: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", overflow: "hidden" }}>
                                    <div style={{ padding: "13px 17px", borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: t.title }}>All Affiliates ({filteredData.length})</div>
                                        <div style={{ fontSize: 10, color: t.subtitle }}>Click any row for quick view</div>
                                    </div>
                                    <div style={{ overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                            <thead>
                                                {table.getHeaderGroups().map((hg) => (
                                                    <tr key={hg.id} style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)" }}>
                                                        <th style={{ padding: "9px 11px", textAlign: "left", fontSize: 10, fontWeight: 800, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 36 }}>#</th>
                                                        {hg.headers.map((header) => (
                                                            <th key={header.id} style={{ textAlign: "left", padding: "9px 11px", fontSize: 10, fontWeight: 800, color: t.headerText, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </thead>
                                            <tbody>
                                                {visibleAffiliateRows.length ? (
                                                    visibleAffiliateRows.map((row, rowIdx) => (
                                                        <tr key={row.id} style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)", cursor: "pointer", transition: "background 0.15s ease" }}
                                                            onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(var(--preset-primary-rgb), 0.04)" : "rgba(var(--preset-primary-rgb), 0.06)"; }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                                                        >
                                                            <td style={{ padding: "10px 11px", fontSize: 11, fontWeight: 700, color: t.subtitle }}>{rowIdx + 1}</td>
                                                            {row.getVisibleCells().map((cell) => (
                                                                <td key={cell.id} style={{ padding: "10px 11px", fontSize: 12, whiteSpace: "nowrap" }}>
                                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan={columns.length + 1} style={{ padding: "40px 0", textAlign: "center", color: t.subtitle, fontSize: 14 }}>No affiliates found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    {(hasMoreAffiliates || loadingAffiliatesMore) && sortedAffiliateRows.length > perPage && (
                                        <div ref={sentinelAffiliateRef} aria-hidden style={{ minHeight: loadingAffiliatesMore ? 8 : 24, borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            {loadingAffiliatesMore ? <AffiliateLoadMoreMascots text="Fetching affiliates" subColor={isDark ? "rgba(255,255,255,0.6)" : "rgba(71,85,105,0.85)"} /> : null}
                                        </div>
                                    )}
                                    {sortedAffiliateRows.length > 0 && (
                                        <div style={{ padding: "10px 17px 12px", borderTop: (hasMoreAffiliates || loadingAffiliatesMore) && sortedAffiliateRows.length > perPage ? "none" : isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: t.subtitle, letterSpacing: "0.02em" }}>Page {affiliateTableCurrentPage} of {affiliateTableTotalPages}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {quickViewAffiliate && (
                                <div className="hidden lg:block" style={{ width: 300, flexShrink: 0, animation: "slideIn 0.2s ease-out" }}>
                                    <AffiliateQuickView affiliate={quickViewAffiliate} onClose={() => setQuickViewAffiliate(null)} theme={t} />
                                </div>
                            )}
                        </div>

                        {Object.keys(rowSelection).length > 0 && (
                            <div style={{ fontSize: 12, color: t.subtitle, paddingTop: 4 }}>{Object.keys(rowSelection).length} selected</div>
                        )}
                    </div>

                    {/* Quick View — mobile */}
                    {quickViewAffiliate && (
                        <div className="lg:hidden">
                            <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setQuickViewAffiliate(null)}>
                                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} />
                                <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 400, margin: "0 16px" }} onClick={(e) => e.stopPropagation()}>
                                    <AffiliateQuickView affiliate={quickViewAffiliate} onClose={() => setQuickViewAffiliate(null)} theme={t} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: Applications ── */}
            {activeTab === "applications" && (
                <div style={{ animation: "fadeIn 0.25s ease-out" }} className="flex flex-col gap-4">
                    <ApplicationsTab
                        applications={applications}
                        setApplications={setApplications}
                        isDark={isDark}
                        theme={t}
                        isLoading={isLoading}
                    />
                </div>
            )}

            {/* Payout dialog */}
            {payoutAffiliate && <PayoutDialog affiliate={payoutAffiliate} onClose={() => setPayoutAffiliate(null)} isDark={isDark} />}

            {/* Delete dialog */}
            {deleteAffiliate && (
                <DeleteDialog
                    affiliate={deleteAffiliate}
                    onClose={() => setDeleteAffiliate(null)}
                    onConfirm={() => {
                        setAffiliates((prev) => prev.filter((a) => a.user_affiliate.id !== deleteAffiliate.user_affiliate.id));
                        toast.success("Affiliate deleted");
                    }}
                    isDark={isDark}
                />
            )}
        </div>
    );
};

export default AffiliateListScreen;