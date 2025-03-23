import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ChevronLeft } from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import { TimeSlot } from "../types/booking";
import { services } from "../data/services";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "../components/ui/spinner";
import { toast } from "../components/ui/use-toast";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { format } from "date-fns";
import { formatDuration } from "../lib/utils";

const validateBookingFields = (
  selectedDate: Date | undefined,
  selectedTime: TimeSlot | undefined,
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  }
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!selectedDate) {
    errors.push("Please select a date");
  }

  if (!selectedTime) {
    errors.push("Please select a time slot");
  }

  if (!customerDetails.name.trim()) {
    errors.push("Name is required");
  }

  if (!customerDetails.email.trim()) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!customerDetails.phone.trim()) {
    errors.push("Phone number is required");
  } else if (!/^\+?[\d\s-]{10,}$/.test(customerDetails.phone)) {
    errors.push("Please enter a valid phone number");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const Booking = () => {
  const { serviceId } = useParams() as { serviceId: string };
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<TimeSlot>();
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => api.getService(serviceId),
    onError: (error) => {
      console.error('Service fetch error:', error);
      navigate('/');
      toast({
        title: "Service not found",
        description: "Please try selecting another service",
        variant: "destructive"
      });
    }
  });

  const { data: timeSlots, isLoading: timeSlotsLoading } = useQuery({
    queryKey: ['timeSlots', serviceId, selectedDate],
    queryFn: () => {
      if (!selectedDate || !serviceId) return Promise.resolve([]);
      console.log('Fetching slots for:', {
        date: selectedDate.toISOString().split('T')[0],
        serviceId
      });
      return api.getAvailableTimeSlots(
        serviceId,
        selectedDate.toISOString().split('T')[0]
      );
    },
    enabled: !!selectedDate && !!serviceId
  });

  console.log('Current time slots:', timeSlots);

  console.log('Service data:', service);

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner />
    </div>
  );

  if (!service) return null;

  const handleBooking = async () => {
    const validation = validateBookingFields(selectedDate, selectedTime, customerDetails);

    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Please fix the following errors:",
        description: (
          <ul className="list-disc pl-4">
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )
      });
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      const bookingData = {
        serviceId: service.id,
        date: selectedDate.toISOString().split('T')[0],
        startTime: selectedTime.startTime,
        endTime: selectedTime.endTime,
        customerName: customerDetails.name.trim(),
        customerEmail: customerDetails.email.trim(),
        customerPhone: customerDetails.phone.trim()
      };

      await api.createBooking(bookingData);
      
      toast({
        title: "Booking confirmed!",
        description: "Your appointment has been scheduled."
      });
      
      navigate('/confirmation');
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => navigate('/')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to services
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold mb-6">{service.name}</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between mb-4">
              <span>Duration</span>
              <span>{formatDuration(Number(service.duration))}</span>
            </div>
            <div className="flex justify-between">
              <span>Price</span>
              <span>${service.price}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < new Date()}
              />

              <div>
                <h3 className="font-medium mb-3">Available Times</h3>
                {timeSlotsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : !selectedDate ? (
                  <p className="text-gray-500 text-center py-8">
                    Please select a date
                  </p>
                ) : timeSlots?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No available times for this date
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots?.map((slot: TimeSlot) => (
                      <Badge
                        key={slot.startTime}
                        variant={selectedTime?.startTime === slot.startTime ? 'default' : 'outline'}
                        className={cn(
                          "cursor-pointer py-2",
                          !slot.available && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => slot.available && setSelectedTime(slot)}
                      >
                        {slot.startTime}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input 
                      id="name"
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                      required
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails(prev => ({
                        ...prev,
                        email: e.target.value
                      }))}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails(prev => ({
                        ...prev,
                        phone: e.target.value
                      }))}
                      required
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <Button
                  className="w-full mt-6"
                  disabled={
                    !selectedDate ||
                    !selectedTime ||
                    !customerDetails.name.trim() ||
                    !customerDetails.email.trim() ||
                    !customerDetails.phone.trim() ||
                    isSubmitting
                  }
                  onClick={handleBooking}
                >
                  {isSubmitting ? "Booking..." : "Book Appointment"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Booking; 