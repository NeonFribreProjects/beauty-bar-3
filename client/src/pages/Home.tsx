import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Category, Service } from "@/types/booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface ServicesByCategory {
  [key: string]: Service[];
}

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('Featured');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.getCategories()
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: () => api.getServices()
  });

  // Filter services by selected category
  const filteredServices = services?.filter(
    service => service.category.name === selectedCategory
  );

  // Add these calculations
  const currentCategory = categories?.find(cat => cat.name === selectedCategory);
  const isExpanded = currentCategory && expandedCategories.includes(currentCategory.id);
  const shouldShowButton = (filteredServices?.length || 0) > 3;
  const displayedServices = isExpanded 
    ? filteredServices 
    : filteredServices?.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation - make text smaller on mobile */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="text-xl sm:text-2xl font-bold text-pink-500">Medina Esthetique</div>
          </div>
        </div>
      </nav>

      {/* Hero Section - adjust padding for mobile */}
      <section id="home" className="pt-20 sm:pt-24 pb-8 sm:pb-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-[910px]">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-500 text-base sm:text-lg">★★★★★</span>
              <span className="text-gray-600 text-sm sm:text-base">4.9 (1,419)</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mb-4">
              <span className="text-gray-600">Maple, Vaughan</span>
              <a href="#" className="text-pink-600 hover:underline">Get Directions</a>
            </div>
          </div>

          {/* Photo Grid - already responsive */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <img src="https://placehold.co/400x300" alt="Beauty Service 1" className="w-full h-[300px] object-cover rounded-lg" />
              <img src="https://placehold.co/400x300" alt="Beauty Service 2" className="w-full h-[300px] object-cover rounded-lg" />
              <img src="https://placehold.co/400x300" alt="Beauty Service 3" className="w-full h-[300px] object-cover rounded-lg" />
              <img src="https://placehold.co/400x300" alt="Beauty Service 4" className="w-full h-[300px] object-cover rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-8 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-[910px]">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Our Services</h2>
          
          {/* Category Tabs - adjust for mobile */}
          <div className="flex justify-start sm:justify-center mb-6 sm:mb-8 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="bg-pink-50/50 p-1.5 rounded-full inline-flex">
              {categories?.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={cn(
                    "px-4 sm:px-8 py-2 rounded-full transition-all duration-300 whitespace-nowrap",
                    "text-xs sm:text-sm font-medium tracking-wide",
                    selectedCategory === category.name
                      ? "bg-pink-500 text-white shadow-md transform -translate-y-0.5"
                      : "text-gray-600 hover:text-pink-500 hover:bg-pink-100/50"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Services List */}
          <div className="space-y-3 sm:space-y-4">
            {displayedServices?.map(service => (
              <div 
                key={service.id}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-pink-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{service.name}</h3>
                    <p className="text-gray-500 mt-1 text-xs sm:text-sm">{service.duration}</p>
                    <p className="text-pink-500 font-bold mt-2 text-base sm:text-lg">
                      ${service.price}
                      {service.discount && (
                        <span className="ml-2 text-xs sm:text-sm text-green-500 font-normal">
                          {service.discount}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 rounded-full px-6 sm:px-8 py-2 transform transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md text-sm sm:text-base"
                    onClick={() => navigate(`/booking/${service.id}`)}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            ))}
            
            {shouldShowButton && (
              <button
                onClick={() => currentCategory && toggleCategoryExpansion(currentCategory.id)}
                className="mt-4 px-4 sm:px-6 py-2 text-pink-600 font-medium hover:text-pink-700 transition-colors w-full text-center text-sm sm:text-base"
              >
                {isExpanded ? 'Show Less' : 'See All'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
} 
