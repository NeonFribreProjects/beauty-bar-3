import { Service } from "@/types/booking";
import { Card, CardContent } from "./card";
import { Button } from "./button";

interface ServiceCardProps {
  service: Service;
  onBook: (serviceId: string) => void;
}

export function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
          <p className="text-gray-600 mb-2">{service.duration}</p>
          <p className="text-pink-600 font-bold">
            ${service.price}
            {service.discount && (
              <span className="ml-2 text-sm text-green-600">{service.discount}</span>
            )}
          </p>
        </div>
        <Button 
          className="bg-pink-600 hover:bg-pink-700 transform hover:scale-105 transition-all duration-300"
          onClick={() => onBook(service.id)}
        >
          Book
        </Button>
      </CardContent>
    </Card>
  );
} 