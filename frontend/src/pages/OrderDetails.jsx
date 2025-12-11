import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import RedesignedOrderDetailsModal from '../components/RedesignedOrderDetailsModal';
import '../styles/RedesignedOrderDetails.css';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();



  return (
    <div className="order-details-page">
      <Navbar />
      <RedesignedOrderDetailsModal 
        orderId={orderId}
        onClose={() => navigate('/my-orders')}
      />
    </div>
  );
};

export default OrderDetails;