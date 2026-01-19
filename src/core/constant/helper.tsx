import { UsersEntity } from "@/src/features/auth/data/model/users-entity";
import { ProductEntity } from "@/src/features/sales/data/model/physical/products-entity";
import { VariantEntity } from "@/src/features/sales/data/model/physical/variants-entity";

//format date to MM/DD/YYYY
export const formatDateToMMDDYYYY = (date: string) => {
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
}

export const formatCurrency = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) {
        return "RM 0.00";
    }
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

export const formatCurrencyToSGD = (value: number) => {
    return new Intl.NumberFormat("en-SG", {
        style: "currency",
        currency: "SGD",
    }).format(value);
}



//format like this February 24, 2025
export const formatDateToMMDDYYYYSentence = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}


//format datetime to "27/4/2024"
export const formatDateToYYYYMMDD = (date: string) => {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

//convert currency like 4000 into 4k , 4000000 into 4M
export const formatCurrencyToShort = (value: number) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
}

//capitalize first letter of a string
export const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getPlatformName = (type: string) => {
    if (type === 'tiktok') {
        return {
            name: 'TikTok',
            color: '#FF0066'
        };
    } else if (type === 'shopee') {
        return {
            name: 'Shopee',
            color: '#EE4D2D'
        };
    } else if (type === 'shopify') {
        return {
            name: 'Shopify',
            color: '#22C55E'
        };
    } else if (type === 'website') {
        return {
            name: 'Website',
            color: '#0066FF'
        };
    } else if (type === 'physical') {
        return {
            name: 'Physical',
            color: '#0066FF'
        };
    }
    return {
        name: 'Other',
        color: '#9E9E9E'
    };
}

//const find total quantity of all variants in a product
export const findTotalQuantityOfAllVariantsInAProduct = (product: ProductEntity) => {
    return product.variants?.reduce((acc: number, variant: VariantEntity) => acc + (variant.quantity || 0), 0);
}

//const find list of skus in a product conver into array string
export const findListOfSkusInAProduct = (product: ProductEntity): string[] => {
    return product.variants?.map((variant: VariantEntity) => variant.sku_name || '').filter((sku): sku is string => sku !== null) || [];
}



export const isAdmin = (user_entity: UsersEntity): boolean => {
    // Always return true for demo - no auth needed
    return true;
}


export const isDevelopmentMode = (): boolean => {
    return process.env.DEVELOPMENT_MODE === 'true';
}


export const handleUnauthorized = ({
    message = 'You are not authorized to access this page'
}: {
    message?: string;
}): void => {
    throw new Error(message);
}

export const getDateRangeShopee = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Adding 1 because getMonth() returns 0-11
    const year = now.getFullYear();

    const endTime = `${year}-${String(currentMonth).padStart(2, '0')}-01`;
    const startTime = `${year}-${String(currentMonth - 1).padStart(2, '0')}-01`;

    return { startTime, endTime };
};

export const getDataDescription = (type: string) => {
    if (type == 'daily') {
        return 'Performance metrics for the last 24 hours, updated in real-time';
    } else if (type == 'weekly') {
        return 'Comprehensive 7-day rolling analysis with day-over-day trends';
    } else if (type == 'monthly') {
        return 'Detailed 30-day performance overview with month-to-date metrics';
    } else if (type == 'yearly') {
        return 'Annual performance tracking with year-to-date comparisons';
    } else {
        return 'Custom period analysis with comparative metrics';
    }
}
