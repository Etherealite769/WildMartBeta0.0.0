import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import RedesignedOrderDetailsModal from '../components/RedesignedOrderDetailsModal';
import '../styles/RedesignedOrderDetails.css';

const SalesOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();



  return (
    <div className="order-details-page">
      <Navbar />
      <RedesignedOrderDetailsModal 
        orderId={orderId}
        onClose={() => navigate('/my-products')}
        isSeller={true}
      />
    </div>
  );
};

export default SalesOrderDetails;