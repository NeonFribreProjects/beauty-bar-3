import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { UserIcon, MailIcon, PhoneIcon, CalendarIcon, ClockIcon, CheckIcon, XIcon, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { AvailabilityManager } from "@/components/admin/AvailabilityManager";

const CATEGORIES = ['Featured', 'Eyelash', 'Waxing', 'Foot Care', 'Hand Care'];

const AdminDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('Featured');
  const queryClient = useQueryClient();
  
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.getBookings()
  });

  // Filter bookings by category first
  const categoryBookings = bookings.filter(booking => 
    booking.service?.category?.name === selectedCategory
  );

  const today = new Date().toISOString().split('T')[0];
  const confirmedBookings = categoryBookings.filter(b => b.status === 'confirmed');
  const todayBookings = confirmedBookings.filter(b => b.date === today);
  const upcomingBookings = confirmedBookings.filter(b => b.date > today);
  const pendingBookings = categoryBookings.filter(b => b.status === 'pending');
  const cancelledBookings = categoryBookings.filter(b => b.status === 'cancelled');
  
  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus} this booking?`)) {
      return;
    }

    try {
      await api.updateBookingStatus(bookingId, newStatus);
      await queryClient.invalidateQueries(['bookings']); // Refresh data
      toast({
        title: `Booking ${newStatus}`,
        description: `The booking has been ${newStatus} successfully.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${newStatus} booking`
      });
    }
  };

  const renderBooking = (booking) => (
    <Card key={booking.id} className="mb-4 hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            {/* Service Info */}
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">{booking.service.name}</h3>
              <Badge variant={
                booking.status === 'confirmed' ? 'success' :
                booking.status === 'pending' ? 'warning' : 'destructive'
              }>
                {booking.status}
              </Badge>
            </div>
            
            {/* Customer Info */}
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span>{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="w-4 h-4" />
                <span>{booking.customerEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <span>{booking.customerPhone}</span>
              </div>
            </div>
            
            {/* Time Info */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarIcon className="w-4 h-4" />
              <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
              <ClockIcon className="w-4 h-4 ml-2" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {booking.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                className="w-28 bg-green-50 text-green-600 hover:bg-green-100"
                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            )}
            {booking.status !== 'cancelled' && (
              <Button
                variant="outline"
                size="sm"
                className="w-28 bg-red-50 text-red-600 hover:bg-red-100"
                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
              >
                <XIcon className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const tabs = ['Bookings', 'Availability'] as const;
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>('Bookings');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              Last updated: {format(new Date(), 'HH:mm')}
            </span>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof tabs[number])}>
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="Bookings">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <Tabs defaultValue="Featured" onValueChange={setSelectedCategory}>
                <TabsList className="mb-6 bg-gray-100/80 p-1">
                  {CATEGORIES.map(category => (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {CATEGORIES.map(category => (
                  <TabsContent key={category} value={category}>
                    <div className="space-y-6">
                      <Tabs defaultValue="today" className="w-full">
                        <TabsList className="w-full justify-start bg-transparent border-b">
                          <TabsTrigger 
                            value="today"
                            className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-600"
                          >
                            Today ({todayBookings.length})
                          </TabsTrigger>
                          <TabsTrigger value="upcoming">
                            Upcoming ({upcomingBookings.length})
                          </TabsTrigger>
                          <TabsTrigger value="pending">
                            Pending ({pendingBookings.length})
                          </TabsTrigger>
                          <TabsTrigger value="cancelled">
                            Cancelled ({cancelledBookings.length})
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="today" className="pt-6">
                          {todayBookings.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                              No bookings for today
                            </div>
                          ) : (
                            todayBookings.map(renderBooking)
                          )}
                        </TabsContent>
                        <TabsContent value="upcoming">
                          {upcomingBookings.map(renderBooking)}
                        </TabsContent>
                        <TabsContent value="pending">
                          {pendingBookings.map(renderBooking)}
                        </TabsContent>
                        <TabsContent value="cancelled">
                          {cancelledBookings.map(renderBooking)}
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="Availability">
            <AvailabilityManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
