import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { services } from "../data/services";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <motion.h1 
          className="text-4xl font-bold text-center text-gray-900 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Beauty Bar Services
        </motion.h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.div
              key={service.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h2>
                <p className="text-gray-600 mb-4">
                  Duration: {service.duration} minutes
                </p>
                <p className="text-pink-600 font-semibold mb-6">
                  ${service.price}
                </p>
                <Link
                  to={`/booking/${service.id}`}
                  className="block w-full bg-pink-600 text-white text-center py-2 rounded-md hover:bg-pink-700 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index; 