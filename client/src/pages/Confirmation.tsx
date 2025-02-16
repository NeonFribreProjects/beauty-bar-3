import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { CheckCircle } from "lucide-react";

const Confirmation = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you for your booking. We'll see you soon!
          </p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Confirmation; 