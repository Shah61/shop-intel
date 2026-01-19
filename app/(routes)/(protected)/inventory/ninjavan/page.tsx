"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
    MapPin, 
    Truck, 
    Package, 
    Building, 
    Globe,
    Search,
    Download,
    MessageSquare,
    Clock,
    Navigation,
    Phone,
    Mail,
    Calendar,
    Users,
    Eye,
    Plus
} from "lucide-react";

// Generate hundreds of NinjaVan locations
const generateNinjaVanLocations = () => {
    const locations: any[] = [];
    const types = ["Shop", "Kiosk", "Locker"];
    const partners = ["NinjaVan Malaysia", "NinjaVan Singapore", "NinjaVan Thailand", "NinjaVan Indonesia", "NinjaVan Philippines"];
    const services = [
        ["Pack Creation", "Post Creation"],
        ["Pack Creation", "Post Creation", "Customer Returns"],
        ["Pack Creation", "Post Creation", "Customer Returns", "Express Delivery"],
        ["Pack Creation", "Post Creation", "Customer Returns", "Express Delivery", "COD"],
        ["Pack Creation", "Post Creation", "Customer Returns", "Express Delivery", "COD", "Insurance"]
    ];
    const acceptedSizes = [
        ["Small", "Medium"],
        ["Small", "Medium", "Large"],
        ["Small", "Medium", "Large", "Extra Large"],
        ["Small", "Medium", "Large", "Extra Large", "Oversized"]
    ];
    
    const malaysianCities = [
        // Selangor & KL
        { name: "Kuala Lumpur", lat: 3.1579, lng: 101.7118 },
        { name: "Petaling Jaya", lat: 3.1073, lng: 101.6083 },
        { name: "Shah Alam", lat: 3.0733, lng: 101.5185 },
        { name: "Subang Jaya", lat: 3.0498, lng: 101.5854 },
        { name: "Klang", lat: 3.0333, lng: 101.4500 },
        { name: "Kajang", lat: 2.9926, lng: 101.7909 },
        { name: "Ampang", lat: 3.1412, lng: 101.7003 },
        { name: "Cheras", lat: 3.0498, lng: 101.5854 },
        { name: "Kepong", lat: 3.2105, lng: 101.6401 },
        { name: "Setapak", lat: 3.2000, lng: 101.7000 },
        { name: "Gombak", lat: 3.2500, lng: 101.6500 },
        { name: "Hulu Langat", lat: 3.0000, lng: 101.8000 },
        { name: "Sepang", lat: 2.7000, lng: 101.7000 },
        { name: "Kuala Selangor", lat: 3.3500, lng: 101.2500 },
        { name: "Sabak Bernam", lat: 3.8000, lng: 100.9500 },
        
        // Johor
        { name: "Johor Bahru", lat: 1.4927, lng: 103.7414 },
        { name: "Kulai", lat: 1.6500, lng: 103.6000 },
        { name: "Kota Tinggi", lat: 1.7333, lng: 103.9000 },
        { name: "Mersing", lat: 2.4333, lng: 103.8333 },
        { name: "Segamat", lat: 2.5000, lng: 102.8167 },
        { name: "Batu Pahat", lat: 1.8500, lng: 102.9333 },
        { name: "Muar", lat: 2.0500, lng: 102.5667 },
        { name: "Pontian", lat: 1.4833, lng: 103.3833 },
        { name: "Kluang", lat: 2.0333, lng: 103.3167 },
        { name: "Tebrau", lat: 1.6000, lng: 103.8000 },
        { name: "Pasir Gudang", lat: 1.4667, lng: 103.9000 },
        { name: "Skudai", lat: 1.5333, lng: 103.6667 },
        { name: "Gelang Patah", lat: 1.4500, lng: 103.6000 },
        { name: "Kulai", lat: 1.6500, lng: 103.6000 },
        { name: "Senai", lat: 1.6000, lng: 103.6500 },
        
        // Pahang
        { name: "Kuantan", lat: 3.8077, lng: 103.3260 },
        { name: "Temerloh", lat: 3.4500, lng: 102.4167 },
        { name: "Bentong", lat: 3.5167, lng: 101.9167 },
        { name: "Raub", lat: 3.8000, lng: 101.8500 },
        { name: "Jerantut", lat: 3.9333, lng: 102.3667 },
        { name: "Maran", lat: 3.5833, lng: 102.7667 },
        { name: "Pekan", lat: 3.5000, lng: 103.4000 },
        { name: "Rompin", lat: 2.7167, lng: 103.5000 },
        { name: "Cameron Highlands", lat: 4.4833, lng: 101.3833 },
        { name: "Fraser's Hill", lat: 3.7167, lng: 101.7333 },
        { name: "Genting Highlands", lat: 3.4167, lng: 101.8000 },
        { name: "Lipis", lat: 4.1833, lng: 102.0500 },
        { name: "Bera", lat: 3.3333, lng: 102.4500 },
        { name: "Mentakab", lat: 3.4833, lng: 102.3500 },
        { name: "Triang", lat: 3.2500, lng: 102.4167 },
        
        // Perak
        { name: "Ipoh", lat: 4.5841, lng: 101.0829 },
        { name: "Taiping", lat: 4.8500, lng: 100.7333 },
        { name: "Teluk Intan", lat: 4.0167, lng: 101.0167 },
        { name: "Kuala Kangsar", lat: 4.7667, lng: 100.9333 },
        { name: "Sungai Siput", lat: 4.8167, lng: 101.0833 },
        { name: "Lumut", lat: 4.2333, lng: 100.6333 },
        { name: "Sitiawan", lat: 4.2167, lng: 100.7000 },
        { name: "Kampar", lat: 4.3000, lng: 101.1500 },
        { name: "Batu Gajah", lat: 4.4667, lng: 101.0500 },
        { name: "Parit Buntar", lat: 5.1167, lng: 100.4833 },
        { name: "Lenggong", lat: 5.1167, lng: 101.0167 },
        { name: "Gerik", lat: 5.4167, lng: 101.1333 },
        { name: "Pengkalan Hulu", lat: 5.7000, lng: 101.0167 },
        { name: "Kuala Kurau", lat: 5.0167, lng: 100.4000 },
        { name: "Bagan Serai", lat: 5.0167, lng: 100.5333 },
        
        // Penang
        { name: "George Town", lat: 5.4164, lng: 100.3327 },
        { name: "Butterworth", lat: 5.4000, lng: 100.3667 },
        { name: "Bukit Mertajam", lat: 5.3667, lng: 100.4667 },
        { name: "Nibong Tebal", lat: 5.1667, lng: 100.4833 },
        { name: "Kepala Batas", lat: 5.5167, lng: 100.4333 },
        { name: "Tanjung Tokong", lat: 5.4500, lng: 100.3000 },
        { name: "Gelugor", lat: 5.3833, lng: 100.3000 },
        { name: "Air Itam", lat: 5.4000, lng: 100.2833 },
        { name: "Bayan Lepas", lat: 5.2833, lng: 100.2667 },
        { name: "Balik Pulau", lat: 5.3500, lng: 100.2000 },
        { name: "Teluk Bahang", lat: 5.4500, lng: 100.2167 },
        { name: "Batu Ferringhi", lat: 5.4667, lng: 100.2500 },
        { name: "Tanjung Bungah", lat: 5.4500, lng: 100.2833 },
        { name: "Pulau Tikus", lat: 5.4333, lng: 100.3167 },
        { name: "Jelutong", lat: 5.4000, lng: 100.3167 },
        
        // Kedah
        { name: "Alor Setar", lat: 6.1254, lng: 100.3673 },
        { name: "Sungai Petani", lat: 5.6500, lng: 100.4833 },
        { name: "Kulim", lat: 5.3667, lng: 100.5667 },
        { name: "Langkawi", lat: 6.3500, lng: 99.8000 },
        { name: "Jitra", lat: 6.2667, lng: 100.4167 },
        { name: "Pokok Sena", lat: 6.1667, lng: 100.5167 },
        { name: "Kubang Pasu", lat: 6.3000, lng: 100.4000 },
        { name: "Kota Setar", lat: 6.1167, lng: 100.3667 },
        { name: "Pendang", lat: 6.0000, lng: 100.4667 },
        { name: "Yan", lat: 5.8000, lng: 100.3667 },
        { name: "Sik", lat: 5.8167, lng: 100.7500 },
        { name: "Baling", lat: 5.6667, lng: 100.9167 },
        { name: "Padang Terap", lat: 6.2500, lng: 100.6000 },
        { name: "Bandar Baharu", lat: 5.1333, lng: 100.4833 },
        { name: "Kuala Muda", lat: 5.6000, lng: 100.4000 },
        
        // Perlis
        { name: "Kangar", lat: 6.4333, lng: 100.2000 },
        { name: "Arau", lat: 6.4333, lng: 100.2667 },
        { name: "Padang Besar", lat: 6.6667, lng: 100.3167 },
        { name: "Kuala Perlis", lat: 6.4000, lng: 100.1333 },
        { name: "Simpang Ampat", lat: 6.5000, lng: 100.2000 },
        
        // Kelantan
        { name: "Kota Bharu", lat: 6.1333, lng: 102.2500 },
        { name: "Pasir Mas", lat: 6.0500, lng: 102.1500 },
        { name: "Tumpat", lat: 6.2000, lng: 102.1667 },
        { name: "Bachok", lat: 6.0500, lng: 102.4000 },
        { name: "Kuala Krai", lat: 5.5333, lng: 102.2000 },
        { name: "Machang", lat: 5.7667, lng: 102.2167 },
        { name: "Tanah Merah", lat: 5.8000, lng: 102.1500 },
        { name: "Pasir Puteh", lat: 5.8333, lng: 102.4000 },
        { name: "Gua Musang", lat: 4.8833, lng: 101.9667 },
        { name: "Jeli", lat: 5.7000, lng: 101.8333 },
        { name: "Ketereh", lat: 6.0000, lng: 102.2500 },
        { name: "Kadok", lat: 6.0000, lng: 102.3000 },
        { name: "Kok Lanas", lat: 6.1167, lng: 102.2833 },
        { name: "Melor", lat: 6.1167, lng: 102.3500 },
        { name: "Pulai Chondong", lat: 6.0000, lng: 102.3500 },
        
        // Terengganu
        { name: "Kuala Terengganu", lat: 5.3333, lng: 103.1333 },
        { name: "Kemaman", lat: 4.2333, lng: 103.4167 },
        { name: "Dungun", lat: 4.7667, lng: 103.4167 },
        { name: "Marang", lat: 5.2000, lng: 103.2000 },
        { name: "Hulu Terengganu", lat: 5.0833, lng: 102.7667 },
        { name: "Besut", lat: 5.8333, lng: 102.5500 },
        { name: "Setiu", lat: 5.6167, lng: 102.8000 },
        { name: "Kuala Nerus", lat: 5.3667, lng: 103.0000 },
        { name: "Kuala Berang", lat: 5.0833, lng: 102.7667 },
        { name: "Ajil", lat: 5.0833, lng: 102.7667 },
        { name: "Bukit Payong", lat: 5.3000, lng: 103.0000 },
        { name: "Chukai", lat: 4.2500, lng: 103.4167 },
        { name: "Kerteh", lat: 4.5167, lng: 103.4500 },
        { name: "Paka", lat: 4.6500, lng: 103.4333 },
        { name: "Kijal", lat: 4.3500, lng: 103.4000 },
        
        // Negeri Sembilan
        { name: "Seremban", lat: 2.7297, lng: 101.9381 },
        { name: "Port Dickson", lat: 2.5167, lng: 101.8000 },
        { name: "Nilai", lat: 2.8167, lng: 101.8000 },
        { name: "Rembau", lat: 2.5833, lng: 102.0833 },
        { name: "Jempol", lat: 2.9000, lng: 102.4000 },
        { name: "Tampin", lat: 2.4667, lng: 102.2333 },
        { name: "Kuala Pilah", lat: 2.7333, lng: 102.2500 },
        { name: "Jelebu", lat: 2.9500, lng: 102.0667 },
        { name: "Lenggeng", lat: 2.8833, lng: 101.9167 },
        { name: "Mantin", lat: 2.8167, lng: 101.9000 },
        { name: "Labu", lat: 2.7500, lng: 101.8167 },
        { name: "Senawang", lat: 2.7000, lng: 101.9500 },
        { name: "Bandar Seri Jempol", lat: 2.9000, lng: 102.4000 },
        { name: "Bahau", lat: 2.8167, lng: 102.4000 },
        { name: "Rompin", lat: 2.7167, lng: 103.5000 },
        
        // Malacca
        { name: "Malacca City", lat: 2.1896, lng: 102.2501 },
        { name: "Alor Gajah", lat: 2.3833, lng: 102.2167 },
        { name: "Jasin", lat: 2.3167, lng: 102.4333 },
        { name: "Masjid Tanah", lat: 2.3500, lng: 102.1167 },
        { name: "Merlimau", lat: 2.1500, lng: 102.4167 },
        { name: "Sungai Udang", lat: 2.2667, lng: 102.1500 },
        { name: "Tampin", lat: 2.4667, lng: 102.2333 },
        { name: "Ayer Keroh", lat: 2.2667, lng: 102.2833 },
        { name: "Batu Berendam", lat: 2.2500, lng: 102.2500 },
        { name: "Bukit Rambai", lat: 2.2500, lng: 102.2000 },
        { name: "Cheng", lat: 2.2167, lng: 102.2000 },
        { name: "Durian Tunggal", lat: 2.3000, lng: 102.3500 },
        { name: "Krubong", lat: 2.2833, lng: 102.2000 },
        { name: "Lubuk China", lat: 2.3500, lng: 102.3500 },
        { name: "Pulau Sebang", lat: 2.4667, lng: 102.2333 },
        
        // Sabah
        { name: "Kota Kinabalu", lat: 5.9804, lng: 116.0735 },
        { name: "Sandakan", lat: 5.8333, lng: 118.1167 },
        { name: "Tawau", lat: 4.2500, lng: 117.9000 },
        { name: "Lahad Datu", lat: 5.0333, lng: 118.3333 },
        { name: "Keningau", lat: 5.3333, lng: 116.1667 },
        { name: "Kudat", lat: 6.8833, lng: 116.8333 },
        { name: "Beaufort", lat: 5.3500, lng: 115.7500 },
        { name: "Kota Belud", lat: 6.3500, lng: 116.4333 },
        { name: "Papar", lat: 5.7333, lng: 115.9333 },
        { name: "Penampang", lat: 5.9167, lng: 116.1167 },
        { name: "Putatan", lat: 5.9167, lng: 116.0500 },
        { name: "Tuaran", lat: 6.1667, lng: 116.2333 },
        { name: "Ranau", lat: 6.0333, lng: 116.6667 },
        { name: "Sipitang", lat: 5.0833, lng: 115.5500 },
        { name: "Tenom", lat: 5.1333, lng: 115.9500 },
        
        // Sarawak
        { name: "Kuching", lat: 1.5533, lng: 110.3593 },
        { name: "Miri", lat: 4.4000, lng: 113.9833 },
        { name: "Sibu", lat: 2.3000, lng: 111.8167 },
        { name: "Bintulu", lat: 3.1667, lng: 113.0333 },
        { name: "Limbang", lat: 4.7500, lng: 115.0000 },
        { name: "Sri Aman", lat: 1.2333, lng: 111.4667 },
        { name: "Sarikei", lat: 2.1167, lng: 111.5167 },
        { name: "Kapit", lat: 2.0167, lng: 112.9333 },
        { name: "Samarahan", lat: 1.4667, lng: 110.4333 },
        { name: "Mukah", lat: 2.9000, lng: 112.0833 },
        { name: "Betong", lat: 1.4167, lng: 111.5167 },
        { name: "Lubok Antu", lat: 1.3500, lng: 111.8167 },
        { name: "Maradong", lat: 2.1167, lng: 111.5167 },
        { name: "Julau", lat: 2.0167, lng: 111.9167 },
        { name: "Pakan", lat: 2.0167, lng: 111.9167 }
    ];
    
    const malls = [
        "Suria KLCC", "Pavilion Kuala Lumpur", "Mid Valley Megamall", "1 Utama Shopping Centre", 
        "Sunway Pyramid", "IOI City Mall", "The Gardens Mall", "Berjaya Times Square", 
        "Lot 10", "Fahrenheit 88", "Starhill Gallery", "KLCC", "Nu Sentral", 
        "KL Sentral", "Avenue K", "Suria KLCC", "Pavilion Elite", "The Exchange TRX",
        "Genting Highlands Premium Outlets", "Johor Premium Outlets", "Gurney Plaza",
        "Queensbay Mall", "1st Avenue Mall", "Gurney Paragon", "Straits Quay",
        "City Square Mall", "KSL City Mall", "AEON Tebrau City", "Toppen Shopping Centre"
    ];
    
    let id = 1;
    
    // Generate locations for each city
    malaysianCities.forEach(city => {
        const cityMalls = malls.slice(0, Math.floor(Math.random() * 5) + 3);
        
        cityMalls.forEach(mall => {
            const type = types[Math.floor(Math.random() * types.length)];
            const partner = partners[Math.floor(Math.random() * partners.length)];
            const serviceSet = services[Math.floor(Math.random() * services.length)];
            const sizeSet = acceptedSizes[Math.floor(Math.random() * acceptedSizes.length)];
            
            const operatingHours = type === "Locker" ? {
                monday: "24/7", tuesday: "24/7", wednesday: "24/7", thursday: "24/7",
                friday: "24/7", saturday: "24/7", sunday: "24/7"
            } : {
                monday: "09:00-22:00", tuesday: "09:00-22:00", wednesday: "09:00-22:00",
                thursday: "09:00-22:00", friday: "09:00-22:00", saturday: "10:00-22:00",
                sunday: "10:00-20:00"
            };
            
            locations.push({
                id: id++,
                name: `Shop-Intel ${type} ${mall}`,
                partner,
                type,
                address: `Level ${Math.floor(Math.random() * 5) + 1}, ${mall}, ${city.name}, Malaysia`,
                coordinates: { 
                    lat: city.lat + (Math.random() - 0.5) * 0.1, 
                    lng: city.lng + (Math.random() - 0.5) * 0.1 
                },
                acceptedSizes: sizeSet,
        operatingDays: 7,
                services: serviceSet,
                operatingHours
            });
        });
    });
    
    return locations;
};

const ninjaVanLocations = generateNinjaVanLocations();

// Generate hundreds of NinjaVan orders
const generateNinjaVanOrders = () => {
    const orders: any[] = [];
    const statuses = ["Delivered", "In Transit", "Pending Pickup", "Out for Delivery", "Failed Delivery", "Returned"];
    const customerNames = [
        "Ahmad bin Ismail", "Sarah Tan", "Mohammed Ali", "Jennifer Lee", "Raj Kumar", "Fatimah binti Hassan",
        "David Chen", "Priya Sharma", "Hassan Abdullah", "Lisa Wong", "Kumar Rajan", "Aisha Rahman",
        "Michael Tan", "Nurul Huda", "James Lim", "Siti Aminah", "Robert Ng", "Zainab Ibrahim",
        "Kevin Ooi", "Mariam Ali", "Daniel Teo", "Nur Fatimah", "Alex Goh", "Aminah Yusof",
        "Ryan Lim", "Siti Nurhaliza", "Marcus Chua", "Norazila", "Brandon Lee", "Rashida"
    ];
    const items = [
        ["Classic White T-Shirt", "Denim Jeans"],
        ["Cotton Polo Shirt"],
        ["Hooded Sweatshirt", "Cargo Pants", "Baseball Cap"],
        ["Leather Jacket", "Sneakers"],
        ["Button-Down Shirt", "Chino Pants"],
        ["Winter Coat", "Wool Scarf"],
        ["Dress Shirt", "Tie", "Dress Shoes"],
        ["Tank Top", "Shorts", "Sandals", "Sunglasses"],
        ["Windbreaker", "Running Shoes"],
        ["Blazer", "Dress Pants", "Belt"]
    ];
    
    const streets = [
        "Jalan Ampang", "Jalan Bukit Bintang", "Jalan Petaling", "Jalan Sultan Ismail",
        "Jalan Tun Razak", "Jalan Pudu", "Jalan Imbi", "Jalan Raja Chulan",
        "Jalan Tuanku Abdul Rahman", "Jalan Masjid India", "Jalan Alor", "Jalan Changkat",
        "Jalan Telawi", "Jalan Bangsar", "Jalan Klang Lama", "Jalan Cheras",
        "Jalan Puchong", "Jalan Subang", "Jalan Shah Alam", "Jalan Klang"
    ];
    
    const areas = [
        "Kuala Lumpur", "Petaling Jaya", "Shah Alam", "Subang Jaya", "Klang",
        "Kajang", "Seremban", "Malacca", "Johor Bahru", "Ipoh", "Penang"
    ];
    
    let orderId = 1;
    
    for (let i = 0; i < 500; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
        const customerPhone = `+601${Math.floor(Math.random() * 90000000) + 10000000}`;
        const street = streets[Math.floor(Math.random() * streets.length)];
        const area = areas[Math.floor(Math.random() * areas.length)];
        const customerAddress = `${Math.floor(Math.random() * 999) + 1} ${street}, ${Math.floor(Math.random() * 99999) + 10000} ${area}`;
        
        const pickupLocation = ninjaVanLocations[Math.floor(Math.random() * ninjaVanLocations.length)];
        const deliveryLocation = ninjaVanLocations[Math.floor(Math.random() * ninjaVanLocations.length)];
        const orderItems = items[Math.floor(Math.random() * items.length)];
        
        const totalWeight = Math.round((Math.random() * 2 + 0.1) * 100) / 100;
        const totalValue = Math.round((Math.random() * 200 + 50) * 100) / 100;
        
        // Generate AWB - some orders might not have AWB (null)
        const hasAWB = Math.random() > 0.15; // 85% chance of having AWB
        const awb = hasAWB ? `MY${Math.floor(Math.random() * 900000000) + 100000000}` : null;
        
        // Generate creation date (last 30 days)
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
        createdAt.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
        
        const estimatedDelivery = new Date(createdAt);
        estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 5) + 1);
        
        const deliveredAt = status === "Delivered" ? new Date(estimatedDelivery) : null;
        
        // Generate tracking updates based on status
        const trackingUpdates = [
            { timestamp: createdAt.toISOString(), status: "Order Created", location: pickupLocation.name }
        ];
        
        if (status !== "Pending Pickup") {
            const pickupTime = new Date(createdAt);
            pickupTime.setHours(pickupTime.getHours() + Math.floor(Math.random() * 6) + 2);
            trackingUpdates.push({ timestamp: pickupTime.toISOString(), status: "Picked Up", location: pickupLocation.name });
        }
        
        if (status === "In Transit" || status === "Out for Delivery" || status === "Delivered") {
            const transitTime = new Date(createdAt);
            transitTime.setHours(transitTime.getHours() + Math.floor(Math.random() * 12) + 6);
            trackingUpdates.push({ timestamp: transitTime.toISOString(), status: "In Transit", location: "NinjaVan Hub" });
        }
        
        if (status === "Out for Delivery" || status === "Delivered") {
            const outForDeliveryTime = new Date(estimatedDelivery);
            outForDeliveryTime.setHours(outForDeliveryTime.getHours() - Math.floor(Math.random() * 4) - 1);
            trackingUpdates.push({ timestamp: outForDeliveryTime.toISOString(), status: "Out for Delivery", location: deliveryLocation.name });
        }
        
        if (status === "Delivered") {
            trackingUpdates.push({ timestamp: deliveredAt!.toISOString(), status: "Delivered", location: deliveryLocation.name });
        }
        
        orders.push({
            id: `NV${String(orderId++).padStart(3, '0')}`,
            awb,
            status,
            customerName,
            customerPhone,
            customerAddress,
            pickupLocation: pickupLocation.name,
            deliveryLocation: deliveryLocation.name,
            items: orderItems,
            totalWeight,
            totalValue,
            createdAt: createdAt.toISOString(),
            estimatedDelivery: estimatedDelivery.toISOString(),
            deliveredAt: deliveredAt?.toISOString(),
            trackingUpdates
        });
    }
    
    return orders;
};

const ninjaVanOrders = generateNinjaVanOrders();

const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
        case "shop": return "bg-blue-500";
        case "kiosk": return "bg-orange-500";
        case "locker": return "bg-purple-500";
        default: return "bg-gray-500";
    }
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "delivered": return "bg-green-500";
        case "in transit": return "bg-blue-500";
        case "pending pickup": return "bg-yellow-500";
        case "out for delivery": return "bg-purple-500";
        default: return "bg-gray-500";
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-MY", {
        style: "currency",
        currency: "MYR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
};

export default function NinjaVanDashboard() {
    const [activeTab, setActiveTab] = useState("inventory");
    const [selectedType, setSelectedType] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [currentLocationPage, setCurrentLocationPage] = useState(1);
    const [locationsPerPage] = useState(20);

    const filteredLocations = ninjaVanLocations.filter(location =>
        (selectedType === "all" || location.type.toLowerCase() === selectedType.toLowerCase()) &&
        (location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
         location.partner.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        totalLocations: ninjaVanLocations.length,
        shops: ninjaVanLocations.filter(l => l.type === "Shop").length,
        kiosks: ninjaVanLocations.filter(l => l.type === "Kiosk").length,
        lockers: ninjaVanLocations.filter(l => l.type === "Locker").length
    };

    // Pagination logic for orders
    const totalOrders = ninjaVanOrders.length;
    const totalPages = Math.ceil(totalOrders / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrders = ninjaVanOrders.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Pagination logic for locations
    const totalLocations = filteredLocations.length;
    const totalLocationPages = Math.ceil(totalLocations / locationsPerPage);
    const locationStartIndex = (currentLocationPage - 1) * locationsPerPage;
    const locationEndIndex = locationStartIndex + locationsPerPage;
    const currentLocations = filteredLocations.slice(locationStartIndex, locationEndIndex);

    const handleLocationPageChange = (page: number) => {
        setCurrentLocationPage(page);
    };

    const handlePreviousLocationPage = () => {
        if (currentLocationPage > 1) {
            setCurrentLocationPage(currentLocationPage - 1);
        }
    };

    const handleNextLocationPage = () => {
        if (currentLocationPage < totalLocationPages) {
            setCurrentLocationPage(currentLocationPage + 1);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                        NinjaVan Integration
                    </h1>
                    <p className="text-muted-foreground">Manage your delivery network and order tracking</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* AI Delivery Network Insights */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-600 rounded-lg">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-purple-800 dark:text-purple-200">AI Delivery Network Insights</CardTitle>
                                <p className="text-sm text-purple-600 dark:text-purple-300">AI-powered analysis of your delivery network performance</p>
                            </div>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Move to Chat
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-3 bg-white/50 dark:bg-purple-900/50 rounded-lg">
                            <div className="text-lg font-semibold text-purple-800 dark:text-purple-200">98.5%</div>
                            <div className="text-purple-600 dark:text-purple-300">Delivery Success Rate</div>
                        </div>
                        <div className="text-center p-3 bg-white/50 dark:bg-purple-900/50 rounded-lg">
                            <div className="text-lg font-semibold text-purple-800 dark:text-purple-200">2.3 hours</div>
                            <div className="text-purple-600 dark:text-purple-300">Average Delivery Time</div>
                        </div>
                        <div className="text-center p-3 bg-white/50 dark:bg-purple-900/50 rounded-lg">
                            <div className="text-lg font-semibold text-purple-800 dark:text-purple-200">4.8/5</div>
                            <div className="text-purple-600 dark:text-purple-300">Customer Satisfaction</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600">Total Locations</CardTitle>
                        <Globe className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{stats.totalLocations}</div>
                        <p className="text-xs text-blue-600">Delivery network points</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-600">Shops</CardTitle>
                        <Building className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{stats.shops}</div>
                        <p className="text-xs text-green-600">Retail locations</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-600">Kiosks</CardTitle>
                        <Truck className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700">{stats.kiosks}</div>
                        <p className="text-xs text-orange-600">Service points</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600">Lockers</CardTitle>
                        <Package className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{stats.lockers}</div>
                        <p className="text-xs text-purple-600">Self-service points</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search locations by name, address, partner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="shop">Shop</SelectItem>
                        <SelectItem value="kiosk">Kiosk</SelectItem>
                        <SelectItem value="locker">Locker</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Main Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="inventory" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Network
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Orders & AWB
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-6">
                    {/* Location Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentLocations.map((location) => (
                            <Card key={location.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm">{location.name}</CardTitle>
                                        <Badge className={getTypeColor(location.type)}>
                                            {location.type}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{location.partner}</p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="text-sm">
                                        <p className="text-muted-foreground line-clamp-2">{location.address}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Package className="h-3 w-3" />
                                        <span className="text-muted-foreground">Accepts:</span>
                                        <span>{location.acceptedSizes.join(", ")}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Clock className="h-3 w-3" />
                                        <span className="text-muted-foreground">Operating:</span>
                                        <span>{location.operatingDays} days/week</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-1">
                                            {location.services.slice(0, 2).map((service: string, index: number) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {service}
                                                </Badge>
                                            ))}
                                            {location.services.length > 2 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{location.services.length - 2} more
                                                </Badge>
                                            )}
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">View Details</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>{location.name} - Location Details</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="font-semibold mb-3">Location Information</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div><span className="text-muted-foreground">Partner:</span> {location.partner}</div>
                                                                <div><span className="text-muted-foreground">Type:</span> {location.type}</div>
                                                                <div><span className="text-muted-foreground">Address:</span> {location.address}</div>
                                                                <div><span className="text-muted-foreground">Coordinates:</span> {location.coordinates.lat}, {location.coordinates.lng}</div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold mb-3">Services Available</h4>
                                                            <div className="space-y-2">
                                                                {location.services.map((service: string, index: number) => (
                                                                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                                                                        {service}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold mb-3">Operating Hours</h4>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            {Object.entries(location.operatingHours).map(([day, hours]: [string, any]) => (
                                                                <div key={day} className="flex justify-between">
                                                                    <span className="capitalize">{day}:</span>
                                                                    <span>{hours}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold mb-3">Accepted Parcel Sizes</h4>
                                                        <div className="flex gap-2">
                                                            {location.acceptedSizes.map((size: string, index: number) => (
                                                                <Badge key={index} variant="secondary">
                                                                    {size}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button className="flex-1">
                                                            <Navigation className="h-4 w-4 mr-2" />
                                                            Get Directions
                                                        </Button>
                                                        <Button variant="outline" className="flex-1">
                                                            <MessageSquare className="h-4 w-4 mr-2" />
                                                            Move to Chat
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Location Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-700">
                            <span>
                                Showing {locationStartIndex + 1} to {Math.min(locationEndIndex, totalLocations)} of {totalLocations} locations
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousLocationPage}
                                disabled={currentLocationPage === 1}
                                className="flex items-center gap-1"
                            >
                                <span>Previous</span>
                            </Button>
                            
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalLocationPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalLocationPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentLocationPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentLocationPage >= totalLocationPages - 2) {
                                        pageNum = totalLocationPages - 4 + i;
                                    } else {
                                        pageNum = currentLocationPage - 2 + i;
                                    }
                                    
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentLocationPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleLocationPageChange(pageNum)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextLocationPage}
                                disabled={currentLocationPage === totalLocationPages}
                                className="flex items-center gap-1"
                            >
                                <span>Next</span>
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="orders" className="space-y-6">
                    {/* Add Order Button */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">NinjaVan Orders</h3>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Order
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New NinjaVan Order</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Customer Name</label>
                                            <Input placeholder="Enter customer name" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Customer Phone</label>
                                            <Input placeholder="Enter phone number" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Delivery Address</label>
                                        <Input placeholder="Enter delivery address" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Pickup Location</label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select pickup location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ninjaVanLocations.filter(l => l.type === "Shop").map(location => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Delivery Location</label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select delivery location" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ninjaVanLocations.map(location => (
                                                        <SelectItem key={location.id} value={location.id.toString()}>
                                                            {location.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="flex-1">Create Order</Button>
                                        <Button variant="outline">Cancel</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Orders Table */}
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>AWB</TableHead>
                                        <TableHead>AWB Generated</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Pickup</TableHead>
                                        <TableHead>Delivery</TableHead>
                                        <TableHead>Value</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.id}</TableCell>
                                            <TableCell>
                                                {order.awb ? (
                                                <Badge variant="outline">{order.awb}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">No AWB</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={order.awb ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}>
                                                    {order.awb ? "Generated" : "Not Generated"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{order.customerName}</div>
                                                    <div className="text-sm text-muted-foreground">{order.customerPhone}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{order.pickupLocation}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{order.deliveryLocation}</div>
                                            </TableCell>
                                            <TableCell>{formatCurrency(order.totalValue)}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{formatDate(order.createdAt)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Track</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>Order Tracking - {order.id}</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <span className="text-muted-foreground">AWB:</span> {order.awb}
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">Status:</span> {order.status}
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">Customer:</span> {order.customerName}
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">Phone:</span> {order.customerPhone}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold mb-2">Items</h4>
                                                                <div className="text-sm">
                                                                    {order.items.join(", ")}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold mb-2">Tracking Updates</h4>
                                                                <div className="space-y-2">
                                                                    {order.trackingUpdates.map((update: any, index: number) => (
                                                                        <div key={index} className="flex items-center gap-3 text-sm">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                            <div className="flex-1">
                                                                                <div className="font-medium">{update.status}</div>
                                                                                <div className="text-muted-foreground">{update.location}</div>
                                                                            </div>
                                                                            <div className="text-muted-foreground">
                                                                                {formatDate(update.timestamp)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                        <div className="flex items-center text-sm text-gray-700">
                            <span>
                                Showing {startIndex + 1} to {Math.min(endIndex, totalOrders)} of {totalOrders} orders
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1"
                            >
                                <span>Previous</span>
                            </Button>
                            
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1"
                            >
                                <span>Next</span>
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
